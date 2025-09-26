import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import { Pagination } from '@mui/material';
import RouteMap from '../components/RouteMap';
import api from '../services/api';

const RotasProgramadasPage = () => {
  const [rotas, setRotas] = useState([]);
  const [rotasFiltradas, setRotasFiltradas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRotas = async () => {
      try {
        setLoading(true);
        const response = await api.get('/routes?home=true');
        const rotasData = response.data || [];
        if (!Array.isArray(rotasData)) throw new Error('Resposta inválida da API');

        const ordenadas = rotasData.sort((a, b) => {
          const statusOrder = { agendada: 1, andamento: 2, concluida: 3, cancelada: 4 };
          const sa = statusOrder[(a.status || '').toLowerCase()] || 99;
          const sb = statusOrder[(b.status || '').toLowerCase()] || 99;
          return sa - sb;
        });

        setRotas(rotasData);
        setRotasFiltradas(ordenadas);
      } catch (err) {
        setError('Erro ao carregar rotas');
      } finally {
        setLoading(false);
      }
    };

    fetchRotas();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando rotas...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ py: 0, px: 0 }}>
        <Box sx={{ textAlign: 'left', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ExploreIcon sx={{ fontSize: '2rem' }} />
            Rotas Programadas
          </Typography>
        </Box>

        <RouteMap rotas={rotasFiltradas} currentPage={currentPage} itemsPerPage={itemsPerPage} hideTitle />

        {rotasFiltradas.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Pagination
              count={Math.ceil(rotasFiltradas.length / itemsPerPage)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
              size="small"
              sx={{
                '& .MuiPaginationItem-root': { minWidth: 24, fontSize: '0.875rem' },
                '& .MuiPaginationItem-page': { padding: '0 4px' }
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default RotasProgramadasPage;
