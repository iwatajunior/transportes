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
    Button
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
    const history = useHistory();

    const fetchAttempts = async () => {
        try {
            setLoading(true);
            const data = await getLoginAttempts();
            setAttempts(data);
            setFilteredAttempts(data);
        } catch (err) {
            setError('Erro ao carregar tentativas de login: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttempts();
    }, []);

    useEffect(() => {
        const filtered = attempts.filter(attempt => 
            attempt.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredAttempts(filtered);
    }, [searchTerm, attempts]);

    const getStatusColor = (status) => {
        return status ? 'success' : 'error';
    };

    const getStatusLabel = (status) => {
        return status ? 'Sucesso' : 'Falha';
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR });
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
                        <IconButton onClick={fetchAttempts} disabled={loading}>
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
                            {filteredAttempts.map((attempt) => (
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
                            ))}
                            {filteredAttempts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Nenhuma tentativa de login encontrada
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default LoginAttemptsPage; 