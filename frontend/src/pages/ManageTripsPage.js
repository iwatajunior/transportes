import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Paper, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { getStatusColor } from '../utils/statusUtils';

const ManageTripsPage = () => {
    const { id } = useParams();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/trips');
            // Definindo a ordem dos status
            const statusOrder = {
                'Pendente': 1,
                'Agendada': 2,
                'Em Andamento': 3,
                'Concluida': 4,
                'Recusada': 5,
                'Cancelada': 6
            };
            
            // Ordenando os dados pelo status usando a ordem definida
            const orderedTrips = [...response.data].sort((a, b) => {
                return (statusOrder[a.status_viagem] || 7) - (statusOrder[b.status_viagem] || 7);
            });
            
            setTrips(orderedTrips);
            console.log('Dados retornados pela API:', response.data);
        } catch (err) {
            setError('Erro ao carregar as viagens');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrip = async (tripId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta viagem?')) return;

        try {
            await api.delete(`/trips/${tripId}`);
            setTrips(trips.filter(trip => trip.viagemid !== tripId));
        } catch (err) {
            setError('Erro ao excluir a viagem');
            console.error('Erro:', err);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Typography color="error" variant="h6" align="center">{error}</Typography>
            </Container>
        );
    }

    if (!trips || trips.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                        Nenhuma viagem encontrada
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        component={RouterLink}
                        to="/viagens/novo"
                        sx={{ textTransform: 'none' }}
                    >
                        Criar Nova Viagem
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                        Gerenciar Viagens
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        component={RouterLink}
                        to="/viagens/novo"
                        sx={{ textTransform: 'none' }}
                    >
                        Nova Viagem
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Finalidade</TableCell>
                                <TableCell>Data Saída</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trips.map((trip) => (
                                <TableRow key={trip.viagemid}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{trip.tripid}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: getStatusColor(trip.status_viagem) }}>{trip.status_viagem}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{trip.finalidade}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {trip.data_saida ? new Date(trip.data_saida).toLocaleDateString() : 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            component={RouterLink}
                                            to={`/viagens/${trip.viagemid}`}
                                            color="primary"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDeleteTrip(trip.viagemid)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default ManageTripsPage;
