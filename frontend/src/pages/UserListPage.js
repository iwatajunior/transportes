import React, { useState, useEffect } from 'react';
import { useHistory, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container, Typography, Button, CircularProgress, Alert, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Grid, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, TablePagination, Avatar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, History as HistoryIcon, Group as GroupIcon } from '@mui/icons-material';
import { getUsers } from '../services/api';
import { USER_ROLES } from '../utils/userConstants';
// import './UserListPage.css'; // Pode ser removido se não houver estilos personalizados essenciais

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const [searchTerm, setSearchTerm] = useState('');
  const history = useHistory();
  const location = useLocation();

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userid.toString().includes(searchTerm)
  );

  const pagedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data || []); // Garante que users seja sempre um array
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        setError(err.message || 'Falha ao carregar usuários. Verifique o console para mais detalhes.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Atualiza a lista quando o usuário retorna da página de edição
  useEffect(() => {
    if (location.pathname === '/admin/users') {
      fetchUsers();
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Erro: {error}</Alert>
      </Container>
    );
  }

  const resolvePhotoUrl = (value) => {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    // Absolute URL
    if (/^https?:\/\//i.test(s)) return s;
    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
    const backendRoot = process.env.REACT_APP_BACKEND_URL || `http://${host}:3001`;
    // If comes as "/uploads/filename.png" or any absolute path
    if (s.startsWith('/')) return backendRoot + s;
    // If it's a bare filename (common after profile update), prefix with /uploads/
    return `${backendRoot}/uploads/${s}`;
  };

  const getInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : '';
    const second = parts[1] ? parts[1][0] : '';
    return (first + second).toUpperCase() || 'U';
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <GroupIcon sx={{ fontSize: '2rem' }} />
              Painel de Usuários
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <TextField
                fullWidth
                label="Pesquisar"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ maxWidth: 400 }}
              />
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => history.push('/admin/login-attempts')}
                  sx={{ mr: 2 }}
                >
                  Logs de Acesso
                </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                  onClick={() => history.push('/admin/users/new')}
              >
                  Novo Usuário
              </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            {filteredUsers.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                Nenhum usuário encontrado.
              </Typography>
            ) : (
              <>
              <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
                <Table 
                  size="small"
                  sx={{ 
                    minWidth: 800,
                    backgroundColor: '#fff',
                    '& .MuiTableCell-root': {
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                      padding: '8px 16px'
                    }
                  }}
                  aria-label="users table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 70 }}>Foto</TableCell>
                      <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 90 }}>ID</TableCell>
                      <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 190 }}>Nome</TableCell>
                      <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 260 }}>Email</TableCell>
                      <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 140 }}>Perfil</TableCell>
                      <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 160 }}>Setor</TableCell>
                      <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 120 }}>Status</TableCell>
                      <TableCell align="right" sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 90 }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedUsers.map((user) => (
                      <TableRow
                        key={user.userid}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 70 }}>
                          {(() => {
                            const url = resolvePhotoUrl(user.fotoperfilurl);
                            const initials = getInitials(user.nome);
                            return (
                              <Avatar src={url || undefined} alt={user.nome} sx={{ width: 36, height: 36, bgcolor: url ? 'transparent' : 'primary.main', fontSize: 14 }}>
                                {!url ? initials : null}
                              </Avatar>
                            );
                          })()}
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{ whiteSpace:'nowrap', maxWidth: 90 }}>{user.userid}</TableCell>
                        <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 200 }}>{user.nome}</TableCell>
                        <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 260 }}>{user.email}</TableCell>
                        <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 140 }}>{user.perfil}</TableCell>
                        <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 160 }}>{user.setor || 'N/A'}</TableCell>
                        <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 120 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              color: user.status ? 'success.main' : 'error.main',
                              fontWeight: user.status ? 'bold' : 'normal'
                            }}
                          >
                            {user.status ? 'Ativo' : 'Inativo'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => {
                                console.log('[UserListPage] Edit button clicked for userId:', user.userid);
                                history.push(`/admin/edit-user/${user.userid}`);
                              }}
                              size="small"
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display:'flex', justifyContent:'flex-end' }}>
                <TablePagination
                  component="div"
                  count={filteredUsers.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[8]}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserListPage;
