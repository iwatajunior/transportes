import React, { useState } from 'react';
import { Container, Paper, Box, Typography, Button, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import {
  List as ListIcon,
  Explore as ExploreIcon,
  Luggage as LuggageIcon,
  Reviews as ReviewsIcon,
  DirectionsCar as DirectionsCarIcon,
  ManageSearch as ManageSearchIcon,
  ForkRight as ForkRightIcon,
  LocalShipping as LocalShippingIcon,
  StickyNote2 as StickyNote2Icon,
  SupportAgent as SupportAgentIcon
} from '@mui/icons-material';

const AdminDashboardPage = () => {
  const history = useHistory();
  const theme = useTheme();
  const [trips, setTrips] = useState([]);
  const [tripsMonthCount, setTripsMonthCount] = useState(0);
  const [tripsYearCount, setTripsYearCount] = useState(0);
  const [tripsInProgressCount, setTripsInProgressCount] = useState(0);
  const [monthlyCounts, setMonthlyCounts] = useState(Array(12).fill(0));
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(() => {
    try { return localStorage.getItem('sandboxStickyNote') || ''; } catch { return ''; }
  });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleOpenNote = () => setNoteOpen(true);
  const handleCloseNote = () => setNoteOpen(false);
  const handleSaveNote = () => {
    try { localStorage.setItem('sandboxStickyNote', noteValue || ''); } catch {}
    setSnack({ open: true, message: 'Nota atualizada com sucesso.', severity: 'success' });
    setNoteOpen(false);
  };

  // Helpers de datas (versão reduzida da Home)
  const parseToLocalDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) { return isNaN(value.getTime()) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate()); }
    if (typeof value === 'string') { const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return new Date(parseInt(m[1],10), parseInt(m[2],10)-1, parseInt(m[3],10)); }
    const d = new Date(value); return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const getTripConclusionDate = (t) => {
    const candidates = [t?.data_retorno, t?.data_retorno_real, t?.data_retorno_efetiva, t?.data_chegada, t?.data_retorno_prevista, t?.data_saida];
    for (const c of candidates) { const d = parseToLocalDate(c); if (d) return d; }
    return null;
  };
  const norm = (v)=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const isStatusConcluida = (value) => norm(value) === 'concluida';
  const isStatusAndamento = (value) => norm(value) === 'andamento';

  // Buscar trips e calcular contadores
  React.useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/trips');
        const data = r.data || [];
        setTrips(data);
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const monthCount = data.filter((t) => {
          if (!isStatusConcluida(t?.status_viagem)) return false;
          const d = getTripConclusionDate(t); return d && d.getFullYear() === y && d.getMonth() === m;
        }).length;
        const yearCount = data.filter((t) => {
          if (!isStatusConcluida(t?.status_viagem)) return false;
          const d = getTripConclusionDate(t); return d && d.getFullYear() === y;
        }).length;
        const inProgress = data.filter((t)=> isStatusAndamento(t?.status_viagem)).length;
        // Contagem por mês do ano atual baseada em data_saida
        const months = Array(12).fill(0);
        data.forEach((t)=>{
          const d = parseToLocalDate(t?.data_saida);
          if (d && d.getFullYear() === y) { months[d.getMonth()] += 1; }
        });
        setTripsMonthCount(monthCount);
        setTripsYearCount(yearCount);
        setTripsInProgressCount(inProgress);
        setMonthlyCounts(months);
      } catch (e) {
        setTripsMonthCount(0); setTripsYearCount(0); setTripsInProgressCount(0); setMonthlyCounts(Array(12).fill(0));
      }
    })();
  }, []);
  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2} columns={12}>
        {/* Esquerda: Card de botões (Acesso Rápido) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, border: 'none', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Divider textAlign="left" sx={{ width:'100%', mb: 1, '&::before, &::after': { borderColor: 'divider' } }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6 }}>Operações</Typography>
              </Divider>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ListIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/viagens')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Painel de Viagens</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ThumbUpAltIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/avaliacoes')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Pesquisa de Satisfação</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<DirectionsCarIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/veiculos')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Gerenciar Veículos</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ManageSearchIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/gerenciarviagens')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Gerenciar Viagens</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ForkRightIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/rotas')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Gerenciar Rotas e Envios</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<StickyNote2Icon sx={{ fontSize: 28 }} />}
                onClick={handleOpenNote}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Gerenciar Nota/Aviso</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SupportAgentIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/admin/suporte')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Suporte COTRAM</Typography>
              </Button>
              <Divider textAlign="left" sx={{ width:'100%', mt: 0.5, mb: 0.5, '&::before, &::after': { borderColor: 'divider' } }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6 }}>Meus Itens</Typography>
              </Divider>
              <Button
                variant="contained"
                fullWidth
                startIcon={<LuggageIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/minhasviagens')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Minhas Viagens</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<LocalShippingIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/envios')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Meus Envios</Typography>
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Centro: Placeholder */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, border: 'none', boxShadow: 'none' }}>
            <Divider textAlign="left" sx={{ width:'100%', mb: 1, '&::before, &::after': { borderColor: 'divider' } }}>
              <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6 }}>Indicadores</Typography>
            </Divider>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[300], 0.25)} 0%, ${alpha('#FFFFFF', 0.95)} 100%)`,
                  borderLeft: `6px solid #22D3EE`,
                  boxShadow: theme.shadows[2]
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B7280', textTransform: 'none' }}>Viagens/Mês</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: { xs: '2.5rem', sm: '3.25rem' }, fontWeight: 800, lineHeight: 1, color: '#22D3EE' }}>
                      {String(tripsMonthCount ?? 0).padStart(2, '0')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[300], 0.25)} 0%, ${alpha('#FFFFFF', 0.95)} 100%)`,
                  borderLeft: `6px solid #F59E0B`,
                  boxShadow: theme.shadows[2]
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B7280', textTransform: 'none' }}>Viagens/Ano</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: { xs: '2.5rem', sm: '3.25rem' }, fontWeight: 800, lineHeight: 1, color: '#F59E0B' }}>
                      {String(tripsYearCount ?? 0).padStart(2, '0')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[300], 0.25)} 0%, ${alpha('#FFFFFF', 0.95)} 100%)`,
                  borderLeft: `6px solid ${theme.palette.primary.main}`,
                  boxShadow: theme.shadows[2]
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B7280', textTransform: 'none' }}>Viagens em Andamento</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: { xs: '2.5rem', sm: '3.25rem' }, fontWeight: 800, lineHeight: 1, color: theme.palette.primary.main }}>
                      {String(tripsInProgressCount ?? 0).padStart(2, '0')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            {/* Gráfico de linhas: Viagens por mês (saída) */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
                Variação anual
              </Typography>
              {(() => {
                const w = 520; // largura base
                const h = 160; // altura base
                const padX = 24;
                const padY = 18;
                const maxVal = Math.max(1, ...monthlyCounts);
                const stepX = (w - padX * 2) / 11;
                const scaleY = (val) => h - padY - ((h - padY * 2) * (val / maxVal));
                const points = monthlyCounts.map((v, i) => `${padX + i * stepX},${scaleY(v)}`).join(' ');
                const pathD = monthlyCounts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${padX + i * stepX} ${scaleY(v)}`).join(' ');
                const monthsLabels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
                return (
                  <Box sx={{ overflowX: 'auto' }}>
                    <svg width={w} height={h} style={{ maxWidth: '100%' }}>
                      {/* Eixos simples */}
                      <line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke="#ddd" />
                      <line x1={padX} y1={padY} x2={padX} y2={h - padY} stroke="#ddd" />
                      {/* Área sob a linha */}
                      <path d={`${pathD} L ${w - padX} ${h - padY} L ${padX} ${h - padY} Z`} fill={alpha(theme.palette.primary.main, 0.12)} />
                      {/* Linha */}
                      <path d={pathD} fill="none" stroke={theme.palette.primary.main} strokeWidth="2" />
                      {/* Pontos */}
                      {monthlyCounts.map((v, i) => (
                        <circle key={i} cx={padX + i * stepX} cy={scaleY(v)} r={3} fill={theme.palette.primary.main} />
                      ))}
                      {/* Rótulos do eixo X */}
                      {monthsLabels.map((m, i) => (
                        <text key={m} x={padX + i * stepX} y={h - padY + 12} textAnchor="middle" fontSize="10" fill="#666">{m}</text>
                      ))}
                      {/* Valor máximo no eixo Y */}
                      <text x={padX - 6} y={padY + 8} textAnchor="end" fontSize="10" fill="#666">{maxVal}</text>
                    </svg>
                  </Box>
                );
              })()}
            </Box>
          </Paper>
        </Grid>

        {/* Direita: Relatórios */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, minHeight: 200, border: 'none', boxShadow: 'none' }}>
            <Divider textAlign="left" sx={{ width:'100%', mb: 1, "&::before, &::after": { borderColor: 'divider' } }}>
              <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6 }}>Relatórios</Typography>
            </Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ManageSearchIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/relatorios/viagens-por-motorista')}
                sx={{
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: theme.palette.primary.main }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Viagens por Motorista</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<DirectionsCarIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/relatorios/viagens-por-veiculo')}
                sx={{
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: theme.palette.primary.main }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Viagens por Veículo</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ListIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/relatorios/viagens-consolidado')}
                sx={{
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: theme.palette.primary.main }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Viagens Consolidado</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ForkRightIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/relatorios/rotas-consolidado')}
                sx={{
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: theme.palette.primary.main }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Rotas Consolidado</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ReviewsIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/relatorios/viagens-por-requisitante')}
                sx={{
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: theme.palette.primary.main }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Viagens por Requisitante</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<LocalShippingIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/relatorios/materiais-enviados')}
                sx={{
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: theme.palette.primary.main }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Materiais Enviados</Typography>
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Dialogo para Gerenciar Nota/Aviso */}
      <Dialog open={noteOpen} onClose={handleCloseNote} fullWidth maxWidth="sm">
        <DialogTitle>Gerenciar Nota/Aviso</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="Escreva aqui sua nota/aviso que será exibida na Home"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNote}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveNote}>Salvar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboardPage;
