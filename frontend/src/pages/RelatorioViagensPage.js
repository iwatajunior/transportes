import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
    Typography,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Box,
    CircularProgress
} from '@mui/material';

const RelatorioViagensPage = () => {
    const { user } = useAuth();
    const history = useHistory();

    // Removido redirecionamento automático pois já temos ProtectedRoute
    const [viagens, setViagens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    console.log('RelatorioViagensPage montado');

    useEffect(() => {

        console.log('Iniciando busca de viagens...');
        const fetchViagens = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Token não encontrado');
                    setLoading(false);
                    return;
                }
                const tripsResponse = await axios.get('http://localhost:3001/api/v1/viagens', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Resposta completa:', tripsResponse);

                if (!tripsResponse.data) {
                    throw new Error('Resposta vazia do servidor');
                }
                console.log('Dados recebidos:', tripsResponse.data);
                console.log('Tipo dos dados:', typeof tripsResponse.data);
                console.log('Array?', Array.isArray(tripsResponse.data));
                if (Array.isArray(tripsResponse.data)) {
                    console.log('Número de viagens:', tripsResponse.data.length);
                    if (tripsResponse.data.length > 0) {
                        console.log('Primeira viagem:', tripsResponse.data[0]);
                    }
                }
                setViagens(tripsResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Erro detalhado:', error.response || error);
                console.error('Erro ao buscar viagens:', error);
                setLoading(false);
            }
        };

        fetchViagens();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'concluida':
                return { bg: '#4caf50', text: 'white' };
            case 'em_andamento':
                return { bg: '#2196f3', text: 'white' };
            case 'pendente':
                return { bg: '#ff9800', text: 'white' };
            default:
                return { bg: '#757575', text: 'white' };
        }
    };

    const formatStatus = (status) => {
        switch (status) {
            case 'concluida':
                return 'Concluída';
            case 'em_andamento':
                return 'Em Andamento';
            case 'pendente':
                return 'Pendente';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    console.log('Estado atual:', { loading, viagens: viagens.length });

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Relatório Geral de Viagens
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : viagens.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>Nenhuma viagem encontrada</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Data</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Origem</TableCell>
                                <TableCell>Destino</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {viagens
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((viagem) => (
                                    <TableRow key={viagem.id}>
                                        <TableCell>{viagem.id}</TableCell>
                                        <TableCell>{formatDate(viagem.data_viagem)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatStatus(viagem.status)}
                                                sx={{
                                                    backgroundColor: getStatusColor(viagem.status).bg,
                                                    color: getStatusColor(viagem.status).text
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{viagem.origem}</TableCell>
                                        <TableCell>{viagem.destino}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={viagens.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Linhas por página"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    />
                </TableContainer>
            )}
        </Container>
    );
};

export default RelatorioViagensPage;
