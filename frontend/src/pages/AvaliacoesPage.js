import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Rating,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import api from '../services/api';

const AvaliacoesPage = () => {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const resp = await api.get('/evaluations');
        const base = resp.data?.evaluations || [];

        // Identificar usuários que precisam de enriquecimento
        const missing = base.filter(e => !e.user_name || !e.user_setor);
        const uniqueUserIds = Array.from(new Set(missing.map(e => e.user_id).filter(Boolean)));

        const userMap = {};
        // Buscar dados de usuários (ignorar erros para rotas protegidas)
        await Promise.all(uniqueUserIds.map(async (uid) => {
          try {
            const u = await api.get(`/users/${uid}`);
            const data = u.data || {};
            userMap[String(uid)] = {
              nome: data.nome || data.name || '',
              setor: data.setor || data.departamento || data.department || data.setor_nome || ''
            };
          } catch (e) {
            // silencioso
          }
        }));

        const merged = base.map(e => {
          if ((!e.user_name || !e.user_setor) && userMap[String(e.user_id)]) {
            const u = userMap[String(e.user_id)];
            return {
              ...e,
              user_name: e.user_name || u.nome || e.user_id,
              user_setor: e.user_setor || u.setor || ''
            };
          }
          return e;
        });

        setItems(merged);
      } catch (err) {
        setError(err.response?.data?.error || 'Falha ao carregar avaliações');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, textAlign: 'left' }}>
            Pesquisa de Satisfação
          </Typography>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 800, backgroundColor: theme.palette.background.paper }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Viagem</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Usuário</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Setor</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Avaliação da Viagem</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Avaliação do Motorista</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Condições do veículo</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Feedback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>#{row.tripid}</TableCell>
                    <TableCell>{row.user_name || row.user_id}</TableCell>
                    <TableCell>{row.user_setor || '-'}</TableCell>
                    <TableCell><Rating value={Number(row.trip_rating) || 0} readOnly /></TableCell>
                    <TableCell><Rating value={Number(row.driver_rating) || 0} readOnly /></TableCell>
                    <TableCell><Rating value={Number(row.vehicle_rating) || 0} readOnly /></TableCell>
                    <TableCell>{row.feedback}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={items.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default AvaliacoesPage;
