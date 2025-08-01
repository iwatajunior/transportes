import React, { useState, useEffect } from 'react';
import { getLoginAttempts } from '../services/api';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Box,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Button,
    TablePagination
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useHistory } from 'react-router-dom';

const LoginAttemptsPage = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAttempts, setFilteredAttempts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [total, setTotal] = useState(0);
    const history = useHistory();

    const fetchAttempts = async (pageNumber = 0) => {
        try {
            console.log('[LoginAttemptsPage] Iniciando busca de tentativas de login...');
            setLoading(true);
            setError(null);
            const data = await getLoginAttempts(pageNumber + 1, rowsPerPage);
            console.log('[LoginAttemptsPage] Dados recebidos:', data);
            
            if (!data || !data.attempts) {
                console.error('[LoginAttemptsPage] Dados recebidos inválidos:', data);
                throw new Error('Formato de dados inválido recebido do servidor');
            }
            
            setAttempts(data.attempts);
            setFilteredAttempts(data.attempts);
            setTotal(data.total);
            console.log('[LoginAttemptsPage] Tentativas de login atualizadas:', data.attempts.length);
        } catch (err) {
            console.error('[LoginAttemptsPage] Erro ao carregar tentativas:', err);
            setError('Erro ao carregar tentativas de login: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[LoginAttemptsPage] Componente montado, buscando tentativas...');
        fetchAttempts(page);
    }, [page, rowsPerPage]);

    useEffect(() => {
        console.log('[LoginAttemptsPage] Filtrando tentativas com termo:', searchTerm);
        const filtered = attempts.filter(attempt => 
            attempt.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('[LoginAttemptsPage] Tentativas filtradas:', filtered.length);
        setFilteredAttempts(filtered);
    }, [searchTerm, attempts]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status) => {
        return status ? 'success' : 'error';
    };

    const getStatusLabel = (status) => {
        return status ? 'Sucesso' : 'Falha';
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR });
        } catch (error) {
            console.error('[LoginAttemptsPage] Erro ao formatar data:', dateString, error);
            return 'Data inválida';
        }
    };

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
                <Alert severity="error">{error}</Alert>
                <Button 
                    variant="contained" 
                    onClick={() => fetchAttempts(page)} 
                    sx={{ mt: 2 }}
                >
                    Tentar Novamente
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Tentativas de Login
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => history.push('/admin/users')}
                    sx={{ mr: 2 }}
                >
                    Voltar para Usuários
                </Button>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Tooltip title="Atualizar">
                        <IconButton onClick={() => fetchAttempts(page)} disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box mb={3}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar por email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Data/Hora</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>IP</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Motivo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAttempts.length > 0 ? (
                                filteredAttempts.map((attempt) => (
                                    <TableRow key={attempt.id}>
                                        <TableCell>
                                            {formatDate(attempt.data_tentativa)}
                                        </TableCell>
                                        <TableCell>{attempt.email}</TableCell>
                                        <TableCell>{attempt.ip_address}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(attempt.status)}
                                                color={getStatusColor(attempt.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{attempt.motivo || '-'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        {searchTerm ? 'Nenhuma tentativa encontrada para o termo de busca' : 'Nenhuma tentativa de login registrada'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[50]}
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>
        </Container>
    );
};

export default LoginAttemptsPage; 