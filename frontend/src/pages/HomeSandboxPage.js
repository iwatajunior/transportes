import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Container, Typography, Box, Button, Grid, Link as RouterLink, Paper, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Tooltip, IconButton, Avatar, Collapse } from '@mui/material';
import { Pagination } from '@mui/material';
import {
  List as ListIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  ArrowForward, ArrowBack,
  Luggage as LuggageIcon,
  Explore as ExploreIcon,
  Visibility as VisibilityIcon,
  HelpOutline as HelpOutlineIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  TaskAlt as TaskAltIcon,
  Cancel as CancelIcon,
  Place as PlaceIcon,
  FilterAltOff as FilterAltOffIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteMap from '../components/RouteMap';
import api from '../services/api';
import { cidadesPI, getCoordsByNome } from '../services/cidadesPI';

const HomeSandboxPage = ({ hideRotasProgramadas = false, hidePainelViagens = false, hideFiltros = false, headerFirst = false, forceTestMode = false }) => {
  const { user } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const isTeste = forceTestMode || (!!location && typeof location.pathname === 'string' && location.pathname.startsWith('/teste'));
  const theme = useTheme();

  const [rotas, setRotas] = useState([]);
  const [rotasFiltradas, setRotasFiltradas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [filteredTrips, setFilteredTrips] = useState([]);

  const [filters, setFilters] = useState({ origem: '', destino: '', solicitante: '', dataSaida: '', dataRetorno: '', status: '', veiculo: '', motorista: '' });
  const [showTestArea, setShowTestArea] = useState(false);
  const [stickyNote, setStickyNote] = useState('');
  const [calendarDate, setCalendarDate] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openEncomendaDialog, setOpenEncomendaDialog] = useState(false);
  const [selectedRota, setSelectedRota] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [materialInfo, setMaterialInfo] = useState({ tipo: '', quantidade: '', observacoes: '', cidade_destino: '' });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await api.get('/routes?home=true');
        const data = Array.isArray(resp.data) ? resp.data : [];
        const ordenadas = data.sort((a, b) => {
          const order = { agendada:1, andamento:2, concluida:3, cancelada:4 };
          return (order[a.status?.toLowerCase()]||99)-(order[b.status?.toLowerCase()]||99);
        });
        setRotas(data);
        setRotasFiltradas(ordenadas);
      } catch (e) {
        setError('Erro ao carregar rotas'); 
      } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('sandboxStickyNote');
    if (saved) setStickyNote(saved);
  }, []);
  useEffect(() => { try { localStorage.setItem('sandboxStickyNote', stickyNote||''); } catch {} }, [stickyNote]);

  const toDateKey = (value) => {
    if (!value) return '';
    if (typeof value === 'string') { const m = value.match(/^(\d{4}-\d{2}-\d{2})/); if (m) return m[1]; }
    const d = new Date(value); if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const getCidadeNome = (id) => cidadesPI.find(c=>String(c.id)===String(id))?.nome || id;

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const formatDate = (s) => { if (!s) return 'N/A'; const d = new Date(s); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).toLocaleDateString('pt-BR', { timeZone: 'UTC' }); };
  const formatTime = (v) => {
    if (!v) return '--:--';
    if (typeof v==='string') { const m=v.match(/^(\d{2}):(\d{2})/); if (m) return `${m[1]}:${m[2]}h`; }
    const d=new Date(v); if (isNaN(d.getTime())) return '--:--';
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}h`;
  };

  useEffect(() => {
    (async () => {
      setTripsLoading(true); setTripsError('');
      try {
        const r = await api.get('/trips');
        const data = r.data||[];
        setTrips(data);
        setFilteredTrips(data);
      } catch (e) {
        const status = e?.response?.status;
        const detail = e?.response?.data?.message || e?.message || 'Sem detalhes.';
        setTripsError(`Falha ao buscar viagens${status ? ` (HTTP ${status})` : ''}: ${detail}`);
        try { console.error('[trips] fetch error:', e); } catch {}
      }
      finally { setTripsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const f = (trips||[]).filter((t)=>{
      const o=(t.origem||t.origem_completo||'').toLowerCase();
      const d=(t.destino_completo||'').toLowerCase();
      const s=(t.solicitante_nome||'').toLowerCase();
      const m=(t.motorista_nome||'').toLowerCase();
      const v=((t.veiculo_alocado_modelo||'')+' '+(t.veiculo_alocado_placa||'')).toLowerCase();
      const st=(t.status_viagem||'').toLowerCase();
      return (!filters.origem||o.includes(filters.origem.toLowerCase()))
        && (!filters.destino||d.includes(filters.destino.toLowerCase()))
        && (!filters.solicitante||s.includes(filters.solicitante.toLowerCase()))
        && (!filters.motorista||m.includes(filters.motorista.toLowerCase()))
        && (!filters.veiculo||v.includes(filters.veiculo.toLowerCase()))
        && (!filters.status||st===filters.status.toLowerCase())
        && (!filters.dataSaida||(t.data_saida||'').includes(filters.dataSaida))
        && (!filters.dataRetorno||(t.data_retorno_prevista||'').includes(filters.dataRetorno));
    });
    setFilteredTrips(f); setPage(0);
  }, [filters, trips]);

  const todayKey = useMemo(()=>{ const n=new Date(); n.setHours(0,0,0,0); return toDateKey(n); },[]);
  const markedDays = useMemo(()=>{ const s=new Set(); (filteredTrips||[]).forEach(t=>{ const a=toDateKey(t.data_saida); const b=toDateKey(t.data_retorno_prevista||t.data_saida)||a; if(!a) return; const A=new Date(a); const B=new Date(b); if(isNaN(A)||isNaN(B)||B<A){ s.add(a); return;} const c=new Date(A); while(c<=B){ s.add(toDateKey(c)); c.setDate(c.getDate()+1);} }); return s; },[filteredTrips]);
  const tripsByDay = useMemo(()=>{ const map=new Map(); const add=(k,l)=>{ if(!k||!l) return; if(!map.has(k)) map.set(k,[]); map.get(k).push(l); }; const key=(d)=>toDateKey(d); const label=(t)=>{ const r=t?.referencia||t?.identificacao||''; const o=t?.origem||''; const de=t?.destino_completo||t?.destino||''; if(r&&(o||de)) return `${r}: ${o} → ${de}`; return r||o||de||'Viagem'; }; (filteredTrips||[]).forEach(t=>{ const a=toDateKey(t.data_saida); const b=toDateKey(t.data_retorno_prevista||t.data_saida)||a; if(!a) return; const A=new Date(a), B=new Date(b); if(isNaN(A)||isNaN(B)||B<A){ add(a,label(t)); return;} const c=new Date(A); while(c<=B){ add(key(c), label(t)); c.setDate(c.getDate()+1);} }); return map; },[filteredTrips]);

  // Charts and counters helpers
  const parseToLocalDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === 'string') {
      const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return new Date(parseInt(m[1],10), parseInt(m[2],10)-1, parseInt(m[3],10));
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const getMonthConclusionDateStrict = (t) => {
    // Ampliado para considerar campos usados no backend/dados reais
    // Mantém prioridade: retorno/chegada reais > previstas > saída
    const candidates = [
      t?.data_retorno,
      t?.data_chegada,
      t?.data_retorno_real,
      t?.data_retorno_efetiva,
      t?.data_retorno_prevista,
      t?.data_saida,
    ];
    for (const c of candidates) {
      const d = parseToLocalDate(c);
      if (d) return d;
    }
    return null;
  };

  const getTripConclusionDate = (t) => {
    const candidates = [t?.data_retorno, t?.data_retorno_real, t?.data_retorno_efetiva, t?.data_chegada, t?.data_retorno_prevista, t?.data_saida];
    for (const c of candidates) {
      const d = parseToLocalDate(c);
      if (d) return d;
    }
    return null;
  };

  const isStatusConcluida = (value) => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase() === 'concluida';

  const tripsCompletedThisMonthCount = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return (trips || []).filter((t) => {
      if (!isStatusConcluida(t?.status_viagem)) return false;
      const d = getMonthConclusionDateStrict(t);
      return d && d.getFullYear() === y && d.getMonth() === m;
    }).length;
  }, [trips]);

  const tripsCompletedThisYearCount = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    return (trips || []).filter((t) => {
      if (!isStatusConcluida(t?.status_viagem)) return false;
      const d = getTripConclusionDate(t);
      return d && d.getFullYear() === y;
    }).length;
  }, [trips]);

  const destinationData = useMemo(() => {
    const list = (filteredTrips && filteredTrips.length ? filteredTrips : trips) || [];
    const nameOf = (t) => t?.destino_completo || t?.destino || 'Destino';
    const map = new Map();
    list.forEach((t) => {
      const n = nameOf(t) || 'Destino';
      map.set(n, (map.get(n) || 0) + 1);
    });
    const entries = Array.from(map.entries()).sort((a,b)=> b[1]-a[1]);
    const total = entries.reduce((s, [,v])=> s+v, 0) || 1;
    return { entries, total };
  }, [filteredTrips, trips]);

  // Tiny SVG PieChart (no external deps)
  const PieChart = ({ data, size = 220, thickness = 28, centerTitle = 'Destinos' }) => {
    const radius = (size - thickness) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const [activeIdx, setActiveIdx] = React.useState(0);
    const [angle, setAngle] = React.useState(0);
    React.useEffect(() => {
      const id = setInterval(() => {
        setActiveIdx((i) => (i + 1) % Math.max(1, data.entries.length));
        setAngle((a) => (a + 20) % 360);
      }, 1800);
      return () => clearInterval(id);
    }, [data.entries.length]);

    const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#22D3EE', '#F59E0B', '#EF4444', '#10B981'];
    let offset = 0;
    const content = data.entries.map(([label, value], idx) => {
      const fraction = value / data.total;
      const dash = circumference * fraction;
      const dashArray = `${dash} ${circumference - dash}`;
      const isActive = idx === activeIdx;
      const strokeWidth = isActive ? thickness + 6 : thickness;
      const strokeOpacity = isActive ? 1 : 0.45;
      const node = (
        <g key={label}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors[idx % colors.length]}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ cursor: 'default', pointerEvents: 'visibleStroke', opacity: strokeOpacity }}
          >
            <title>{`${label}: ${value} (${Math.round(fraction * 100)}%)`}</title>
          </circle>
        </g>
      );
      offset += dash;
      return node;
    });

    const activeLabel = data.entries[activeIdx]?.[0] || centerTitle;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ pointerEvents: 'auto' }}>
        <g transform={`rotate(${angle} ${center} ${center})`}>
          {content}
        </g>
        <text x={center} y={center-2} textAnchor="middle" fontWeight="700" fontSize={14} fill="#111111">
          {activeLabel}
        </text>
      </svg>
    );
  };

  const CounterCard = ({ leftLabel, rightLabel, value, numberColor, leftColor = '#E5E7EB', rightColor = '#CBD5E1' }) => (
    <Box sx={{
      bgcolor: '#808080',
      color: '#FFFFFF',
      borderRadius: 2,
      border: '1px solid #8A8A8A',
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: leftColor, textTransform: 'none' }}>{leftLabel}</Typography>
        {rightLabel ? (
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: rightColor, textTransform: 'none' }}>{rightLabel}</Typography>
        ) : null}
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: { xs: '2.5rem', sm: '3.25rem' }, fontWeight: 800, lineHeight: 1, color: numberColor || 'inherit' }}>
          {String(value ?? 0).padStart(2, '0')}
        </Typography>
      </Box>
    </Box>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente': return { color:'default', icon:<HelpOutlineIcon/> };
      case 'Agendada': return { color:'warning', icon:<EventIcon/> };
      case 'Andamento': return { color:'primary', icon:<AccessTimeIcon/> };
      case 'Concluida':
      case 'Concluída': return { color:'success', icon:<TaskAltIcon/> };
      case 'Cancelada': return { color:'error', icon:<CancelIcon/> };
      default: return { color:'default', icon:<HelpOutlineIcon/> };
    }
  };

  const handlePrevMonth = () => setCalendarDate((p)=>new Date(p.getFullYear(), p.getMonth()-1, 1));
  const handleNextMonth = () => setCalendarDate((p)=>new Date(p.getFullYear(), p.getMonth()+1, 1));
  const handleFilterChange = (f,v)=> setFilters(prev=>({...prev,[f]:v}));
  const clearFilters = () => setFilters({ origem:'', destino:'', solicitante:'', dataSaida:'', dataRetorno:'', status:'', veiculo:'', motorista:'' });

  const RotasProgramadasSection = () => (
    <>
      <RouteMap rotas={rotasFiltradas} currentPage={currentPage} itemsPerPage={itemsPerPage} />
      {rotasFiltradas.length>0 && (
        <Box sx={{ display:'flex', justifyContent:'center', mt:1 }}>
          <Pagination
            count={Math.ceil(rotasFiltradas.length/itemsPerPage)}
            page={currentPage}
            onChange={(e,p)=>setCurrentPage(p)}
            color="primary"
            size="small"
            sx={{ '& .MuiPaginationItem-root':{ minWidth:24, fontSize:'0.875rem' }, '& .MuiPaginationItem-page':{ padding:'0 4px' } }}
          />
        </Box>
      )}
    </>
  );

  if (loading && !hideRotasProgramadas) return (<Box sx={{ p:3, textAlign:'center' }}><Typography>Carregando rotas...</Typography></Box>);
  if (error && !hideRotasProgramadas) return (<Box sx={{ p:3, textAlign:'center' }}><Typography color="error">{error}</Typography></Box>);

  const welcomeHeader = (
    <>
      <Box sx={{ textAlign:'center', mb:-1 }}>
        <Typography variant="h5" component="h1" sx={{ fontFamily:"'Exo 2', sans-serif", fontWeight:'bold', color:'#1976d2', mb:-0.5, textAlign:'left' }}>
          {user?.nome ? `Bem-vindo, ${user.nome}!` : 'Bem-vindo ao Rotas e Viagens!'}
          <Typography variant="subtitle1" sx={{ fontFamily:"'Exo 2', sans-serif", color:'text.secondary', display:'inline', ml:1 }}>
            Gerencie aqui suas viagens e encomendas.
          </Typography>
        </Typography>
      </Box>
      <Box sx={{ height:'15px' }} />
    </>
  );

  return (
    <Box component="main" sx={{ flexGrow:1, p:0, mt:-2 }}>
      <Container maxWidth="lg" sx={{ py:0, px:0 }}>
        {!isTeste && (
          <Box sx={{ mb:1, position:'sticky', top:{ xs:56, sm:64 } }}>
            <Alert severity="error" variant="filled" sx={{ fontWeight:700, borderRadius:0, textAlign:'center' }}>
              Ambiente de Teste
            </Alert>
          </Box>
        )}

        {(headerFirst && !isTeste) && welcomeHeader}

        {/* Área de Testes */}
        <Paper elevation={isTeste ? 0 : 1} sx={{ mb:2, backgroundColor: isTeste ? 'transparent' : undefined, boxShadow: isTeste ? 'none' : undefined, border:'none' }}>
          {!isTeste && (
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight:600 }}>Área de Testes</Typography>
              <Button size="small" onClick={()=>setShowTestArea(v=>!v)}>{showTestArea ? 'Ocultar' : 'Mostrar'}</Button>
            </Box>
          )}
          <Collapse in={isTeste ? true : showTestArea} sx={{ display: isTeste ? 'contents' : 'block' }}>
            <Box sx={{ p:2 }}>
              {tripsError ? (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  {tripsError}
                </Alert>
              ) : null}
              <Grid container spacing={2} columns={12} justifyContent="space-between" alignItems="stretch">
                {/* ESQUERDA: 3 botões iguais ao Painel de Viagens + Calendário */}
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {isTeste && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" component="h1" sx={{ fontFamily:"'Exo 2', sans-serif", fontWeight:'bold', color:'#1976d2' }}>
                          {user?.nome ? `Bem-vindo, ${user.nome}!` : 'Bem-vindo ao Rotas e Viagens!'}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontFamily:"'Exo 2', sans-serif", color:'text.secondary' }}>
                          Gerencie aqui suas viagens e encomendas.
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Button variant="contained" fullWidth startIcon={<ListIcon sx={{ fontSize: 28 }} />} onClick={()=>history.push('/viagens')}
                        sx={{ bgcolor:'#FF9800', color:'white', textTransform:'none', borderRadius:2, mb:1, py:1, justifyContent:'flex-start', alignItems:'center',
                          '&:hover':{ transform:'scale(1.02)', bgcolor:'#F57C00' } }}>
                        <Typography variant="subtitle1" sx={{ fontWeight:600, textAlign:'left', flexGrow:1, display:{ xs:'none', sm:'inline' } }}>Painel de Viagens</Typography>
                      </Button>
                      <Button variant="contained" fullWidth startIcon={<ExploreIcon sx={{ fontSize: 28 }} />} onClick={()=>history.push('/rotasprogramadas')}
                        sx={{ bgcolor:'#FF9800', color:'white', textTransform:'none', borderRadius:2, mb:1, py:1, justifyContent:'flex-start', alignItems:'center',
                          '&:hover':{ transform:'scale(1.02)', bgcolor:'#F57C00' } }}>
                        <Typography variant="subtitle1" sx={{ fontWeight:600, textAlign:'left', flexGrow:1, display:{ xs:'none', sm:'inline' } }}>Rotas Programadas</Typography>
                      </Button>
                      <Button variant="contained" fullWidth startIcon={<LuggageIcon sx={{ fontSize: 28 }} />} onClick={()=>history.push('/minhasviagens')}
                        sx={{ bgcolor:'#FF9800', color:'white', textTransform:'none', borderRadius:2, mb:1, py:1, justifyContent:'flex-start', alignItems:'center',
                          '&:hover':{ transform:'scale(1.02)', bgcolor:'#F57C00' } }}>
                        <Typography variant="subtitle1" sx={{ fontWeight:600, textAlign:'left', flexGrow:1, display:{ xs:'none', sm:'inline' } }}>Minhas Viagens</Typography>
                      </Button>
                    </Box>
                  </Paper>

                  {/* Calendário */}
                  <Paper elevation={0} sx={{ p:1.5, backgroundColor:'#FFFFFF', borderRadius:3, mt:2, border:'none', boxShadow:'none' }}>
                    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:0.5 }}>
                      <IconButton size="small" onClick={()=>setCalendarDate(d=>new Date(d.getFullYear(), d.getMonth()-1, 1))}><ArrowBack fontSize="small" /></IconButton>
                      <Typography variant="subtitle2" sx={{ fontWeight:700, fontSize:'0.9rem' }}>{calendarDate.toLocaleDateString('pt-BR', { month:'long', year:'numeric' })}</Typography>
                      <IconButton size="small" onClick={()=>setCalendarDate(d=>new Date(d.getFullYear(), d.getMonth()+1, 1))}><ArrowForward fontSize="small" /></IconButton>
                    </Box>
                    <Box>
                      <Grid container columns={7} spacing={0.5} sx={{ mb:0.4, bgcolor:(t)=>t.palette.grey[100], borderRadius:1, px:0.25, py:0.25 }}>
                        {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(w=>(
                          <Grid item xs={1} key={w}><Typography variant="caption" sx={{ fontWeight:600, color:'text.secondary' }}>{w}</Typography></Grid>
                        ))}
                      </Grid>
                      <Grid container columns={7} spacing={0.5}>
                        {(()=>{
                          const startOfMonth = (d)=>new Date(d.getFullYear(), d.getMonth(), 1);
                          const endOfMonth = (d)=>new Date(d.getFullYear(), d.getMonth()+1, 0);
                          const getMondayBasedWeekday = (jsDay)=>(jsDay+6)%7;
                          const first=startOfMonth(calendarDate), last=endOfMonth(calendarDate);
                          const leading=getMondayBasedWeekday(first.getDay()), total=last.getDate();
                          const cells=[...Array(42)].map((_,i)=>{ const n=i-leading+1; const inMonth=n>=1&&n<=total; const date=new Date(calendarDate.getFullYear(), calendarDate.getMonth(), n); return { inMonth, day:date.getDate(), date };});
                          return cells.map((cell,idx)=>{
                            const key=toDateKey(cell.date);
                            const has=cell.inMonth && markedDays.has(key);
                            const isToday=cell.inMonth && key===todayKey;
                            return (
                              <Grid item xs={1} key={idx}>
                                <Tooltip title={has? <Box sx={{ px:0.5 }}>{(tripsByDay.get(key)||[]).map((lbl,i)=><Typography key={i} variant="caption" sx={{ display:'block' }}>{lbl}</Typography>)}</Box> : ''} arrow disableInteractive>
                                  <Box sx={{ height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:1, position:'relative',
                                    bgcolor: has ? 'warning.light' : (cell.inMonth ? '#FFFFFF' : 'action.hover'),
                                    color: cell.inMonth ? 'text.primary' : 'text.disabled',
                                    border:1, borderColor:'divider', outline: isToday ? '2px solid' : 'none', outlineColor: isToday ? 'primary.main' : 'transparent' }}>
                                    <Typography variant="caption" sx={{ fontWeight: has ? 700 : 400 }}>{cell.day}</Typography>
                                    {has && <Box sx={{ position:'absolute', bottom:3, right:3, width:6, height:6, borderRadius:'50%', bgcolor:'warning.main' }} />}
                                  </Box>
                                </Tooltip>
                              </Grid>
                            );
                          });
                        })()}
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>

{/* MEIO: nota + gráficos */}
<Grid item xs={12} md={4}>
  <Paper elevation={0} sx={{ p:1.5, backgroundColor:'#FFFFFF', borderRadius:3, mb:1.5, border:'none', boxShadow:'none' }}>
    <Box sx={{ p:1, bgcolor:'#FFF59D', border:'1px solid', borderColor:'#FDD835', borderRadius:1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight:700, mb:0.5, color:'text.primary' }}>Nota (Avisos)</Typography>
      <TextField
        value={stickyNote}
        onChange={(e)=>setStickyNote(e.target.value)}
        placeholder="Escreva aqui seus avisos..."
        multiline
        minRows={3}
        fullWidth
        variant="standard"
        InputProps={{ disableUnderline:true }}
        sx={{ fontFamily:'inherit', '& textarea':{ fontSize:'0.95rem', lineHeight:1.4 }, bgcolor:'transparent' }}
      />
    </Box>
  </Paper>

  {/* ESTE Paper envolve o Grid dos gráficos e PRECISA ser fechado */}
  <Paper elevation={0} sx={{ p: 1.5, backgroundColor: '#FFFFFF', borderRadius: 2, minHeight: 430, border: 'none', boxShadow: 'none' }}>
    <Grid container spacing={1.2}>
      <Grid item xs={12} sm={6}>
        <CounterCard
          leftLabel={'Viagens/Mês'}
          rightLabel={''}
          value={tripsCompletedThisMonthCount}
          numberColor={'#22D3EE'}
          leftColor={'#D1D5DB'}
          rightColor={'#9CA3AF'}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <CounterCard
          leftLabel={'Viagens/Ano'}
          rightLabel={''}
          value={tripsCompletedThisYearCount}
          numberColor={'#F59E0B'}
          leftColor={'#D1D5DB'}
          rightColor={'#9CA3AF'}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <PieChart data={destinationData} thickness={36} />
        </Box>
      </Grid>
    </Grid>
  </Paper>
</Grid>

                {/* DIREITA: mapa */}
                <Grid item xs={12} md={4}>
                  <LeafletTripMap routes={(rotas||[]).filter(r=>(r.status||'').toLowerCase()==='andamento')} />
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>

        {/* Rotas Programadas */}
        <React.Fragment>
          {!hideRotasProgramadas && <RotasProgramadasSection />}
        </React.Fragment>

        {/* Filtros - Viagens (Teste) */}
        {!hideFiltros && (
          <Paper elevation={0} sx={{ p:1, mb:1.5, border:(t)=>`1px solid ${t.palette.grey[200]}`, borderRadius:1 }}>
            <Grid container spacing={1} columns={12} sx={{ mb:1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Origem" value={filters.origem} onChange={(e)=>handleFilterChange('origem', e.target.value)} size="small" InputProps={{ startAdornment:(<PlaceIcon sx={{ mr:1, color:theme.palette.text.secondary }} />) }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Destino" value={filters.destino} onChange={(e)=>handleFilterChange('destino', e.target.value)} size="small" InputProps={{ startAdornment:(<PlaceIcon sx={{ mr:1, color:theme.palette.text.secondary }} />) }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Solicitante" value={filters.solicitante} onChange={(e)=>handleFilterChange('solicitante', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Motorista" value={filters.motorista} onChange={(e)=>handleFilterChange('motorista', e.target.value)} size="small" InputProps={{ startAdornment:(<PersonIcon sx={{ mr:1, color:theme.palette.text.secondary }} />) }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth type="date" label="Data Saída" value={filters.dataSaida} onChange={(e)=>handleFilterChange('dataSaida', e.target.value)} size="small" InputLabelProps={{ shrink:true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth type="date" label="Data Retorno" value={filters.dataRetorno} onChange={(e)=>handleFilterChange('dataRetorno', e.target.value)} size="small" InputLabelProps={{ shrink:true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={filters.status} onChange={(e)=>handleFilterChange('status', e.target.value)}>
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Pendente">Pendente</MenuItem>
                    <MenuItem value="Agendada">Agendada</MenuItem>
                    <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                    <MenuItem value="Concluída">Concluída</MenuItem>
                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  <TextField fullWidth label="Veículo" value={filters.veiculo} onChange={(e)=>handleFilterChange('veiculo', e.target.value)} size="small" InputProps={{ startAdornment:(<DirectionsCarIcon sx={{ mr:1, color:theme.palette.text.secondary }} />) }} />
                  <Tooltip title="Limpar filtros"><IconButton size="small" onClick={clearFilters}><FilterAltOffIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Painel de Viagens (Teste) */}
        {!hidePainelViagens && (
          <Paper elevation={3} sx={{ p:1.5, backgroundColor:'#FFFFFF', borderRadius:2, mb:2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1, color:'text.primary' }}>Painel de Viagens (Teste)</Typography>
            </Box>

            {tripsLoading ? (
              <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', py:3 }}><CircularProgress size={24} /></Box>
            ) : tripsError ? (
              <Alert severity="error">{tripsError}</Alert>
            ) : (
              <>
                <TableContainer>
                  <Table size="small" sx={{ minWidth:800, backgroundColor:theme.palette.background.paper, '& .MuiTableCell-root':{ borderBottom:`1px solid ${theme.palette.divider}`, padding:'8px 16px' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', padding:'8px 16px', width:40 }}>ID</TableCell>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', padding:'8px 16px', width:50 }}>Status</TableCell>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', py:1, px:2, width:140 }}>Origem</TableCell>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', py:1, px:2, width:140 }}>Destino</TableCell>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', py:1, px:2, width:160 }}>Solicitante</TableCell>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', py:1, px:2, width:90 }}>Data/Hora<br/>Saída</TableCell>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', py:1, px:2, width:90 }}>Data/Hora<br/>Retorno</TableCell>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', py:1, px:2, width:140 }}>Veículo</TableCell>
                        <TableCell sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', py:1, px:2, width:160 }}>Motorista</TableCell>
                        <TableCell align="right" sx={{ backgroundColor:theme.palette.primary.main, color:theme.palette.primary.contrastText, fontWeight:500, whiteSpace:'nowrap', py:1, px:2, width:64 }}>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTrips.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage).map(trip=>(
                        <TableRow key={trip.tripid} sx={{ '&:nth-of-type(odd)':{ backgroundColor:theme.palette.action.hover }, '&:hover':{ backgroundColor:theme.palette.action.selected }, '& td':{ fontSize:'0.875rem', py:1 } }}>
                          <TableCell sx={{ py:1, px:2, whiteSpace:'nowrap', width:40 }}>#{trip.tripid}</TableCell>
                          <TableCell sx={{ py:1, px:2, width:50 }}>
                            <Tooltip title={trip.status_viagem || 'Status'}>
                              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', color: theme.palette[getStatusColor(trip.status_viagem).color]?.main }}>
                                {getStatusColor(trip.status_viagem).icon}
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ py:1, px:2, maxWidth:140, whiteSpace:'nowrap' }}><Typography variant="body2" noWrap>{trip.origem || trip.origem_completo || 'N/A'}</Typography></TableCell>
                          <TableCell sx={{ py:1, px:2, maxWidth:140, whiteSpace:'nowrap' }}><Typography variant="body2" noWrap>{trip.destino_completo}</Typography></TableCell>
                          <TableCell sx={{ py:1, px:2, maxWidth:160 }}>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                              <Avatar src={trip.solicitante_avatar ? `http://10.1.1.42:3001${trip.solicitante_avatar}` : undefined} sx={{ width:32, height:32, border:'2px solid', borderColor:'primary.main' }}>
                                {trip.solicitante_nome?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight:500, color:'text.primary', lineHeight:1.2 }}>{trip.solicitante_nome}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py:1, px:2, maxWidth:90, whiteSpace:'nowrap' }}>
                            <Box><Typography variant="body2" noWrap>{formatDate(trip.data_saida)}</Typography><Typography variant="caption" color="text.secondary" noWrap>{formatTime(trip.horario_saida)}</Typography></Box>
                          </TableCell>
                          <TableCell sx={{ py:1, px:2, maxWidth:90, whiteSpace:'nowrap' }}>
                            <Box><Typography variant="body2" noWrap>{formatDate(trip.data_retorno_prevista)}</Typography><Typography variant="caption" color="text.secondary" noWrap>{formatTime(trip.horario_retorno_previsto)}</Typography></Box>
                          </TableCell>
                          <TableCell sx={{ py:1, px:2, maxWidth:140 }}>
                            {trip.veiculo_alocado_modelo}
                            {trip.veiculo_alocado_placa && (<Typography variant="caption" display="block" color="text.secondary">{trip.veiculo_alocado_placa}</Typography>)}
                          </TableCell>
                          <TableCell sx={{ py:1, px:2, maxWidth:160 }}>
                            {trip.motorista_nome ? (
                              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                                <Avatar src={trip.motorista_avatar ? `http://10.1.1.42:3001${trip.motorista_avatar}` : undefined} sx={{ width:32, height:32, border:'2px solid', borderColor:'primary.main' }}>
                                  {trip.motorista_nome?.charAt(0)}
                                </Avatar>
                                <Box><Typography variant="body2" sx={{ fontWeight:500, color:'text.primary', lineHeight:1.2 }}>{trip.motorista_nome}</Typography></Box>
                              </Box>
                            ) : (<Typography variant="body2" sx={{ color:'text.disabled' }}>Não alocado</Typography>)}
                          </TableCell>
                          <TableCell align="right" sx={{ py:1, px:2, width:64 }}>
                            <Tooltip title="Ver Detalhes"><IconButton component={RouterLink} to={`/viagens/${trip.tripid}`} size="small"><VisibilityIcon /></IconButton></Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredTrips.length}
                  page={page}
                  onPageChange={(e,np)=>setPage(np)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e)=>{ setRowsPerPage(parseInt(e.target.value,10)); setPage(0); }}
                  labelRowsPerPage="Itens por página"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                  rowsPerPageOptions={[6,12,24,48]}
                  sx={{ borderTop:1, borderColor:'divider' }}
                />
              </>
            )}
          </Paper>
        )}

        {/* Rotas Programadas (Home-like) */}
        <React.Fragment>
          {!hideRotasProgramadas && <RotasProgramadasSection />}
        </React.Fragment>

        {/* Dialog Enviar Material */}
        <Dialog open={openEncomendaDialog} onClose={()=>setOpenEncomendaDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <LocalShippingIcon color="primary" />
              <Typography variant="h6">Enviar Material</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt:2 }}>
              <Typography variant="subtitle1" gutterBottom>Rota: {selectedRota?.identificacao}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{getCidadeNome(selectedRota?.cidade_origem)} → {getCidadeNome(selectedRota?.cidade_destino)}</Typography>
            </Box>
            <Box sx={{ mt:3 }}>
              <FormControl fullWidth sx={{ mb:2 }}>
                <InputLabel>Rota</InputLabel>
                <Select value={selectedRota?.id||''} label="Rota" onChange={(e)=>{ const r=rotas.find(x=>x.id===e.target.value); setSelectedRota(r); setSelectedCidade(''); setMaterialInfo({ tipo:'', quantidade:'', observacoes:'', cidade_destino:'' }); }}>
                  {rotas.map(r=>(<MenuItem key={r.id} value={r.id}>{r.identificacao}</MenuItem>))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb:2 }}>
                <InputLabel>Cidade de Coleta do Material</InputLabel>
                <Select value={selectedCidade} label="Cidade de Coleta do Material" onChange={(e)=>setSelectedCidade(e.target.value)}>
                  {selectedRota && [
                    { id:selectedRota.cidade_origem, nome:getCidadeNome(selectedRota.cidade_origem) },
                    ...((selectedRota.cidades_intermediarias_ida||[]).map(cid=>({ id:cid, nome:getCidadeNome(cid) }))),
                    { id:selectedRota.cidade_destino, nome:getCidadeNome(selectedRota.cidade_destino) },
                    ...((selectedRota.cidades_intermediarias_volta||[]).map(cid=>({ id:cid, nome:getCidadeNome(cid) })))
                  ].filter((c,idx,arr)=>arr.findIndex(x=>x.id===c.id)===idx).map(c=>(<MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb:2 }}>
                <InputLabel>Cidade de Destino do Material</InputLabel>
                <Select value={materialInfo.cidade_destino} label="Cidade de Destino do Material" onChange={(e)=>setMaterialInfo({...materialInfo, cidade_destino:e.target.value})}>
                  {selectedRota && [
                    { id:selectedRota.cidade_origem, nome:getCidadeNome(selectedRota.cidade_origem) },
                    ...((selectedRota.cidades_intermediarias_ida||[]).map(cid=>({ id:cid, nome:getCidadeNome(cid) }))),
                    { id:selectedRota.cidade_destino, nome:getCidadeNome(selectedRota.cidade_destino) },
                    ...((selectedRota.cidades_intermediarias_volta||[]).map(cid=>({ id:cid, nome:getCidadeNome(cid) })))
                  ].filter((c,idx,arr)=>arr.findIndex(x=>x.id===c.id)===idx).map(c=>(<MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>))}
                </Select>
              </FormControl>

              <TextField fullWidth label="Tipo de Material" value={materialInfo.tipo} onChange={(e)=>setMaterialInfo({...materialInfo, tipo:e.target.value})} sx={{ mb:2 }} />
              <TextField fullWidth label="Quantidade" type="number" value={materialInfo.quantidade} onChange={(e)=>setMaterialInfo({...materialInfo, quantidade:e.target.value})} sx={{ mb:2 }} />
              <TextField fullWidth label="Observações" multiline rows={3} value={materialInfo.observacoes} onChange={(e)=>setMaterialInfo({...materialInfo, observacoes:e.target.value})} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpenEncomendaDialog(false)}>Cancelar</Button>
            <Button onClick={()=>{/* handler separado no original */}} disabled={!(selectedCidade && materialInfo.tipo && materialInfo.quantidade && materialInfo.cidade_destino)} variant="contained">Confirmar Envio</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical:'top', horizontal:'center' }}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width:'100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default HomeSandboxPage;

// LeafletTripMap (com Leaflet restaurado)
function LeafletTripMap({ routes }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const maskRef = useRef(null);
  const highlightRef = useRef(null);
  const borderRef = useRef(null);
  const leafletLoadedRef = useRef(false);

  const routeId = useMemo(() => {
    const r = (routes && routes.length > 0) ? routes[0] : null;
    if (!r) return '01/2025';
    return (r.referencia || r.codigo || r.numero || r.identificador || r.nome || r.titulo || '01/2025');
  }, [routes]);

  const piauiCenter = useMemo(() => ({ lat: -8.28, lng: -43.0, zoom: 6 }), []);
  const piauiBounds = useMemo(() => {
    const west = -48.0, south = -13.5, east = -38.0, north = -3.0;
    return [[south, west], [north, east]];
  }, []);

  const loadLeaflet = () => new Promise((resolve) => {
    if (leafletLoadedRef.current || window.L) {
      leafletLoadedRef.current = true;
      return resolve();
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      leafletLoadedRef.current = true;
      resolve();
    };
    document.body.appendChild(script);
  });

  const getCacheKey = (q) => `geo:${q}`;
  const geocode = async (query) => {
    if (!query) return null;
    const raw = String(query).trim();
    const official = getCoordsByNome(raw);
    if (official) return { lat: official.lat, lng: official.lng };

    const [south, west] = [piauiBounds[0][0], piauiBounds[0][1]];
    const [north, east] = [piauiBounds[1][0], piauiBounds[1][1]];
    const viewbox = `${west},${south},${east},${north}`;
    const deaccent = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const candidates = Array.from(new Set([raw, deaccent(raw)]));

    const pickInPiaui = (arr) => {
      if (!Array.isArray(arr)) return null;
      const inBounds = (lat, lng) => lat >= south && lat <= north && lng >= west && lng <= east;
      const preferred = arr.find(it => {
        const lat = parseFloat(it.lat);
        const lng = parseFloat(it.lon);
        const state = it.address?.state || '';
        const name = it.display_name || '';
        return inBounds(lat, lng) && (state === 'Piauí' || /Piau[ií]/i.test(state) || /Piau[ií]/i.test(name));
      });
      if (preferred) return preferred;
      const fallback = arr.find(it => {
        const lat = parseFloat(it.lat);
        const lng = parseFloat(it.lon);
        return inBounds(lat, lng);
      });
      return fallback || null;
    };

    for (const name of candidates) {
      const key1 = getCacheKey(`q:${name}, Piauí, Brasil`);
      try {
        const cached1 = localStorage.getItem(key1);
        if (cached1) return JSON.parse(cached1);
      } catch {}
      try {
        const url1 = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=br&q=${encodeURIComponent(name + ', Piauí, Brasil')}`;
        const resp1 = await fetch(url1, { headers: { 'Accept-Language': 'pt-BR' } });
        const data1 = await resp1.json();
        const chosen1 = pickInPiaui(data1);
        if (chosen1) {
          const item1 = { lat: parseFloat(chosen1.lat), lng: parseFloat(chosen1.lon) };
          try { localStorage.setItem(key1, JSON.stringify(item1)); } catch {}
          return item1;
        }
      } catch {}

      const key2 = getCacheKey(`structured:${name}`);
      try {
        const cached2 = localStorage.getItem(key2);
        if (cached2) return JSON.parse(cached2);
      } catch {}
      try {
        const url2 = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=br&state=${encodeURIComponent('Piauí')}&city=${encodeURIComponent(name)}`;
        const resp2 = await fetch(url2, { headers: { 'Accept-Language': 'pt-BR' } });
        const data2 = await resp2.json();
        const chosen2 = pickInPiaui(data2);
        if (chosen2) {
          const item2 = { lat: parseFloat(chosen2.lat), lng: parseFloat(chosen2.lon) };
          try { localStorage.setItem(key2, JSON.stringify(item2)); } catch {}
          return item2;
        }
      } catch {}

      const key3 = getCacheKey(`bbox:${name}`);
      try {
        const cached3 = localStorage.getItem(key3);
        if (cached3) return JSON.parse(cached3);
      } catch {}
      try {
        const url3 = `https://nominatim.openstreetmap.org/search?format=json&limit=5&bounded=1&viewbox=${encodeURIComponent(viewbox)}&q=${encodeURIComponent(name)}`;
        const resp3 = await fetch(url3, { headers: { 'Accept-Language': 'pt-BR' } });
        const data3 = await resp3.json();
        const chosen3 = pickInPiaui(data3);
        if (chosen3) {
          const item3 = { lat: parseFloat(chosen3.lat), lng: parseFloat(chosen3.lon) };
          try { localStorage.setItem(key3, JSON.stringify(item3)); } catch {}
          return item3;
        }
      } catch {}
    }
    return null;
  };

  const loadPiauiBorder = async () => {
    if (!window.L || !mapRef.current || borderRef.current) return;
    try {
      const cacheKey = 'geojson:piauiborder';
      let gj = null;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        gj = JSON.parse(cached);
      } else {
        const url = 'https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=1&countrycodes=br&q=' + encodeURIComponent('Piauí, Brasil');
        const resp = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
        const data = await resp.json();
        if (Array.isArray(data) && data[0] && data[0].geojson) {
          gj = data[0].geojson;
          try { localStorage.setItem(cacheKey, JSON.stringify(gj)); } catch {}
        }
      }
      if (gj) {
        borderRef.current = window.L.geoJSON(gj, {
          style: { color: '#bdbdbd', weight: 3, opacity: 0.9, fill: false },
          interactive: false
        }).addTo(mapRef.current);
      }
    } catch (e) {
      console.warn('Falha ao carregar fronteira do Piauí', e);
    }
  };

  const clearMarkers = () => {
    if (!markersRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  };
  const clearPolylines = () => {
    if (!polylinesRef.current) return;
    polylinesRef.current.forEach(p => p.remove());
    polylinesRef.current = [];
  };

  const plotMarkers = async () => {
    if (!window.L || !mapRef.current) return;
    clearMarkers();
    clearPolylines();
    const L = window.L;

    const pinSvg = (color) => `
      <svg width="12" height="20" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5S12.5 41 12.5 41 25 19.404 25 12.5C25 5.596 19.404 0 12.5 0z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="5.5" fill="#fff"/>
      </svg>`;
    const originIcon = window.L.divIcon({ className: 'origin-pin', html: pinSvg('green'), iconSize: [12, 20], iconAnchor: [6, 20], popupAnchor: [1, -18] });
    const destIcon   = window.L.divIcon({ className: 'dest-pin',   html: pinSvg('red'),   iconSize: [12, 20], iconAnchor: [6, 20], popupAnchor: [1, -18] });
    const midIcon    = window.L.divIcon({ className: 'mid-pin',    html: pinSvg('gold'),  iconSize: [12, 20], iconAnchor: [6, 20], popupAnchor: [1, -18] });

    const cities = [
      { name: 'Teresina',         icon: originIcon, label: '<b>Origem</b><br/>Teresina' },
      { name: 'José de Freitas',  icon: midIcon,    label: '<b>Intermediária (ida)</b><br/>José de Freitas' },
      { name: 'Campo Maior',      icon: midIcon,    label: '<b>Intermediária (ida)</b><br/>Campo Maior' },
      { name: 'Parnaíba',         icon: destIcon,   label: '<b>Destino</b><br/>Parnaíba' },
      { name: 'Piracuruca',       icon: midIcon,    label: '<b>Intermediária (volta)</b><br/>Piracuruca' }
    ];
    for (const c of cities) {
      const coord = getCoordsByNome(c.name);
      if (coord) {
        const mk = L.marker([coord.lat, coord.lng], { icon: c.icon }).addTo(mapRef.current);
        mk.bindPopup(c.label);
        markersRef.current.push(mk);
      }
    }

    const idaSeq = ['Teresina', 'José de Freitas', 'Campo Maior', 'Parnaíba']
      .map(n => getCoordsByNome(n)).filter(Boolean).map(c => [c.lat, c.lng]);
    if (idaSeq.length >= 2) {
      const lineI = L.polyline(idaSeq, { color: 'royalblue', weight: 2.5, opacity: 0.9 }).addTo(mapRef.current);
      polylinesRef.current.push(lineI);
    }
    const voltaSeq = ['Parnaíba', 'Piracuruca', 'Teresina']
      .map(n => getCoordsByNome(n)).filter(Boolean).map(c => [c.lat, c.lng]);
    if (voltaSeq.length >= 2) {
      const lineV = L.polyline(voltaSeq, { color: '#7b1fa2', weight: 2.5, opacity: 0.9 }).addTo(mapRef.current);
      polylinesRef.current.push(lineV);
    }

    const exactZoom = mapRef.current.getBoundsZoom(piauiBounds, true);
    const center = window.L.latLngBounds(piauiBounds).getCenter();
    mapRef.current.setView(center, exactZoom, { animate: false });
    mapRef.current.panBy([0, -70], { animate: false });
  };

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(() => {
      if (cancelled) return;
      const L = window.L;
      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = L.map(mapContainerRef.current, { zoomSnap: 0.5, zoomDelta: 0.5 })
          .setView([piauiCenter.lat, piauiCenter.lng], piauiCenter.zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);

        const exactZoomInit = mapRef.current.getBoundsZoom(piauiBounds, true);
        const centerInit = window.L.latLngBounds(piauiBounds).getCenter();
        mapRef.current.setView(centerInit, exactZoomInit, { animate: false });
        mapRef.current.panBy([0, -65], { animate: false });
        mapRef.current.setMaxBounds(piauiBounds);
        mapRef.current.setMaxBounds(mapRef.current.getBounds());
      }
      loadPiauiBorder().then(() => { plotMarkers(); });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!leafletLoadedRef.current || !mapRef.current) return;
    plotMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);

  return (
    <Paper elevation={0} sx={{ p: 2, minHeight: 430, border: 'none', boxShadow: 'none' }}>
      <Box sx={{ position: 'relative', width: '100%', height: 380, borderRadius: 1, overflow: 'hidden', border: 0 }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </Box>
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption">
          {`Fonte: OpenStreetMap • Exibindo rota ${routeId}`}
        </Typography>
      </Box>
    </Paper>
  );
}
