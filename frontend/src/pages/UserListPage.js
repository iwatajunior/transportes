import React, { useState, useEffect } from 'react';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Button, CircularProgress, Alert, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Grid, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getUsers } from '../services/api';
import { USER_ROLES } from '../utils/userConstants';
// import './UserListPage.css'; // Pode ser removido se não houver estilos personalizados essenciais

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const history = useHistory();

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userid.toString().includes(searchTerm)
  );



  useEffect(() => {
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

    fetchUsers();
  }, []);

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

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 'bold',
              color: 'primary.main'
            }}>
              Gerenciar Usuários
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField
                fullWidth
                label="Pesquisar"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ maxWidth: 400 }}
              />
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/admin/create-user"
                sx={{ textTransform: 'none' }}
              >
                Criar Novo Usuário
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            {filteredUsers.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                Nenhum usuário encontrado.
              </Typography>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Perfil</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Setor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ativo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.userid}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {user.userid}
                        </TableCell>
                        <TableCell>{user.nome}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.perfil}</TableCell>
                        <TableCell>{user.setor || 'N/A'}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body1"
                            sx={{
                              color: user.ativo ? 'success.main' : 'error.main',
                              fontWeight: user.ativo ? 'bold' : 'normal'
                            }}
                          >
                            {user.ativo ? 'Sim' : 'Não'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
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
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserListPage;
