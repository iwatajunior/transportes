import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Typography, Container, Paper, Grid, Box, Button } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboardPage = () => {
    const history = useHistory();
    const [vehicleData, setVehicleData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                // Buscar veículos
                const vehiclesResponse = await axios.get('http://localhost:3000/api/veiculos', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Buscar viagens
                const tripsResponse = await axios.get('http://localhost:3000/api/viagens', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Contar viagens por veículo
                console.log('Viagens:', tripsResponse.data);
                // Inicializar contagem por veículo e status
                const vehicleTripCount = {};
                
                tripsResponse.data.forEach(trip => {
                    if (trip.veiculo && trip.veiculo.id) {
                        if (!vehicleTripCount[trip.veiculo.id]) {
                            vehicleTripCount[trip.veiculo.id] = {
                                total: 0,
                                concluidas: 0,
                                emAndamento: 0,
                                pendentes: 0
                            };
                        }
                        
                        vehicleTripCount[trip.veiculo.id].total++;
                        
                        if (trip.status === 'concluida') {
                            vehicleTripCount[trip.veiculo.id].concluidas++;
                        } else if (trip.status === 'em_andamento') {
                            vehicleTripCount[trip.veiculo.id].emAndamento++;
                        } else {
                            vehicleTripCount[trip.veiculo.id].pendentes++;
                        }
                    }
                });
                
                console.log('Contagem detalhada de viagens por veículo:', vehicleTripCount);

                console.log('Veículos:', vehiclesResponse.data);
                // Combinar dados de veículos com contagem de viagens
                const vehicleStats = vehiclesResponse.data.map(vehicle => {
                    const stats = {
                        veiculo: `${vehicle.marca} ${vehicle.modelo}`,
                        viagens: (vehicleTripCount[vehicle.id] && vehicleTripCount[vehicle.id].total) || 0,
                        viagensConcluidas: (vehicleTripCount[vehicle.id] && vehicleTripCount[vehicle.id].concluidas) || 0,
                        viagensEmAndamento: (vehicleTripCount[vehicle.id] && vehicleTripCount[vehicle.id].emAndamento) || 0,
                        viagensPendentes: (vehicleTripCount[vehicle.id] && vehicleTripCount[vehicle.id].pendentes) || 0,
                        modelo: vehicle.modelo,
                        placa: vehicle.placa,
                        id: vehicle.id
                    };
                    console.log(`Estatísticas para veículo ${vehicle.id}:`, stats);
                    return stats;
                });

                // Ordenar por número de viagens (decrescente)
                vehicleStats.sort((a, b) => b.viagens - a.viagens);

                setVehicleData(vehicleStats);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AssessmentIcon />}
                    onClick={() => {
                        console.log('Navegando para /relatorio-viagens');
                        history.push('/relatorio-viagens');
                    }}
                    sx={{
                        backgroundColor: '#1976d2',
                        '&:hover': {
                            backgroundColor: '#115293'
                        }
                    }}
                >
                    Relatório Geral de Viagens
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Gráfico de Viagens por Veículo */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Viagens por Veículo</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={vehicleData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="veiculo" type="category" width={150} />
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        `${value} viagens`,
                                        `${props.payload.modelo} (${props.payload.placa})`
                                    ]}
                                />
                                <Legend />
                                <Bar dataKey="viagens" fill="#2196f3" name="Número de Viagens" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Outros Gráficos */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Viagens por Mês</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={[
                                    { mes: 'Jan', viagens: 65 },
                                    { mes: 'Fev', viagens: 45 },
                                    { mes: 'Mar', viagens: 78 },
                                    { mes: 'Abr', viagens: 90 },
                                    { mes: 'Mai', viagens: 85 },
                                ]}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="viagensConcluidas" fill="#4caf50" name="Viagens Concluídas" />
                                <Bar dataKey="viagensEmAndamento" fill="#2196f3" name="Viagens em Andamento" />
                                <Bar dataKey="viagensPendentes" fill="#ff9800" name="Viagens Pendentes" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Status das Viagens</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Em Andamento', value: 35, color: '#2196f3' },
                                        { name: 'Concluídas', value: 45, color: '#4caf50' },
                                        { name: 'Pendentes', value: 20, color: '#ff9800' },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'Em Andamento', value: 35, color: '#2196f3' },
                                        { name: 'Concluídas', value: 45, color: '#4caf50' },
                                        { name: 'Pendentes', value: 20, color: '#ff9800' },
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboardPage;
