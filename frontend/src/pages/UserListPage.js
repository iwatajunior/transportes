import React, { useState, useEffect } from 'react';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Button, CircularProgress, Alert, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { getUsers } from '../services/api';
// import './UserListPage.css'; // Pode ser removido se não houver estilos personalizados essenciais

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

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
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Lista de Usuários
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={RouterLink} 
          to="/admin/create-user"
        >
          Criar Novo Usuário
        </Button>
      </Box>

      {users.length === 0 ? (
        <Typography>Nenhum usuário encontrado.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
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
              {users.map((user) => (
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
                  <TableCell>{user.ativo ? 'Sim' : 'Não'}</TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => {
                        console.log('[UserListPage] Edit button clicked for userId:', user.userid);
                        history.push(`/admin/edit-user/${user.userid}`);
                      }}
                    >
                      Editar
                    </Button>
                    {/* Futuramente, um botão de excluir pode ser adicionado aqui */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default UserListPage;
