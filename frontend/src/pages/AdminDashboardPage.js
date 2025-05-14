import React from 'react';
import { Typography, Container, Paper } from '@mui/material';

const AdminDashboardPage = () => {
    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Painel do Administrador
                </Typography>
                <Typography variant="body1">
                    Conteúdo do painel do administrador aqui.
                </Typography>
                {/* Funcionalidades do admin como gerenciamento de usuários, veículos, etc. */}
            </Paper>
        </Container>
    );
};

export default AdminDashboardPage;
