// src/App.js
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppBar, Toolbar, Typography, Box, Container, Button, Paper } from '@mui/material';
import senacLogo from './Senac_logo.png'; 
 
import ExploreIcon from '@mui/icons-material/Explore';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt'; 
import './App.css';
import AddVehiclePage from './pages/AddVehiclePage';
import LoginPage from './pages/LoginPage';
import VehicleListPage from './pages/VehicleListPage';
import EditVehiclePage from './pages/EditVehiclePage';
import RegisterTripPage from './pages/RegisterTripPage';
import TripListPage from './pages/TripListPage';
import CreateUserPage from './pages/CreateUserPage';
import UserListPage from './pages/UserListPage';
import EditUserPage from './pages/EditUserPage';
import EditProfilePage from './pages/EditProfilePage';
import RequisitarViagemPage from './pages/RequisitarViagemPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/Navbar';
import { USER_ROLES } from './utils/userConstants';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RelatorioViagensPage from './pages/RelatorioViagensPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TripDetailPage from './pages/TripDetailPage';

const ALL_AUTHENTICATED_ROLES = Object.values(USER_ROLES);

const HomePage = () => {
  const { user, loading } = useAuth();
  console.log('HomePage - user:', user);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 'bold' }}>
          {loading ? 'Carregando...' : user ? `Bem-vindo, ${user.nome.split(' ')[0]}!` : 'Bem-vindo ao Rotas e Viagens!'}
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: "'Exo 2', sans-serif" }}>
          Requisite e Gerencie Suas Viagens Aqui!
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, 
        gap: 1.5,
        mb: 3
      }}>
            <Link to="/registrar-viagem" style={{ textDecoration: 'none' }}>
              <Paper sx={{
                p: 1.5,
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#1976d2',
                color: 'white',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#1565c0',
                  transform: 'scale(1.02)'
                }
              }}>
                <AddIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>Nova Viagem</Typography>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>Solicite uma nova viagem</Typography>
              </Paper>
            </Link>

            <Link to="/viagens" style={{ textDecoration: 'none' }}>
              <Paper sx={{
                p: 1.5,
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#9c27b0',
                color: 'white',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#7b1fa2',
                  transform: 'scale(1.02)'
                }
              }}>
                <ListAltIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>Painel de Viagens</Typography>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>Visualize e gerencie viagens</Typography>
              </Paper>
            </Link>

            <Link to="/admin/users" style={{ textDecoration: 'none' }}>
              <Paper sx={{
                p: 1.5,
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#0288d1',
                color: 'white',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#0277bd',
                  transform: 'scale(1.02)'
                }
              }}>
                <GroupIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>Usuários</Typography>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>Gerenciar usuários</Typography>
              </Paper>
            </Link>

            <Link to="/veiculos" style={{ textDecoration: 'none' }}>
              <Paper sx={{
                p: 1.5,
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#ed6c02',
                color: 'white',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#e65100',
                  transform: 'scale(1.02)'
                }
              }}>
                <DirectionsCarIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>Veículos</Typography>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>Gerenciar frota</Typography>
              </Paper>
            </Link>

            <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <Paper sx={{
                p: 1.5,
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#2e7d32',
                color: 'white',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#1b5e20',
                  transform: 'scale(1.02)'
                }
              }}>
                <DashboardIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>Dashboard</Typography>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>Estatísticas e relatórios</Typography>
              </Paper>
            </Link>
      </Box>


    </Container>
  );
};

const AppContent = () => {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedUser = JSON.parse(jsonPayload);
        setUser(decodedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao decodificar token ou token inválido:", error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleLogin = (userData) => {
    if (userData && userData.token) {
      localStorage.setItem('token', userData.token);
      try {
        const base64Url = userData.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedUser = JSON.parse(jsonPayload);
        setUser(decodedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao decodificar token no login:", error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      console.error('[AppContent] handleLogin error: Invalid userData received', userData);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    history.replace({ pathname: '/login', state: { navigatedFromLogout: true } });
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Box component="img" sx={{ height: 40, marginRight: 2, display: 'flex' }} alt="Senac Logo" src={senacLogo} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: "'Exo 2', sans-serif", fontSize: '1.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <ExploreIcon sx={{ mr: 1, fontSize: '2.25rem' }} />
              Rotas e Viagens
            </Link>
          </Typography>
          {isAuthenticated && (
            <Navbar 
              onLogout={handleLogout} 
              userRole={user?.perfil} 
              userName={user?.nome} 
              userPhotoUrl={user?.fotoperfilurl} 
            />
          )}
        </Toolbar>
      </AppBar>
      <main style={{ padding: '20px', marginTop: '20px', flexGrow: 1 }}>
        <Switch>
          <Route path="/login" render={(props) => <LoginPage {...props} onLoginSuccess={handleLogin} />} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password/:token" component={ResetPasswordPage} />
          
          <ProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} allowedRoles={[USER_ROLES.ADMINISTRADOR]} />
          <ProtectedRoute path="/relatorio-viagens" component={RelatorioViagensPage} allowedRoles={[USER_ROLES.ADMINISTRADOR]} />
          <ProtectedRoute exact path="/" component={HomePage} allowedRoles={ALL_AUTHENTICATED_ROLES} />
          <ProtectedRoute path="/cadastrar-veiculo" component={AddVehiclePage} allowedRoles={ALL_AUTHENTICATED_ROLES} />
          <ProtectedRoute path="/veiculos" component={VehicleListPage} allowedRoles={ALL_AUTHENTICATED_ROLES} />
          <ProtectedRoute path="/editar-veiculo/:id" component={EditVehiclePage} allowedRoles={ALL_AUTHENTICATED_ROLES} />
          <ProtectedRoute exact path="/viagens" component={TripListPage} allowedRoles={ALL_AUTHENTICATED_ROLES} />
          <ProtectedRoute path="/viagens/:id" component={TripDetailPage} allowedRoles={[USER_ROLES.REQUISITANTE, USER_ROLES.GESTOR, USER_ROLES.ADMINISTRADOR, USER_ROLES.MOTORISTA]} />
          <ProtectedRoute path="/registrar-viagem" component={RegisterTripPage} allowedRoles={ALL_AUTHENTICATED_ROLES} />
          <ProtectedRoute
            path="/admin/create-user"
            component={CreateUserPage}
            allowedRoles={[USER_ROLES.ADMINISTRADOR]}
          />
          <ProtectedRoute
            path="/admin/users"
            component={UserListPage}
            isAuthenticated={isAuthenticated}
            allowedRoles={[USER_ROLES.ADMINISTRADOR]}
          />
          <ProtectedRoute
            path="/admin/edit-user/:userId"
            component={EditUserPage}
            isAuthenticated={isAuthenticated}
            allowedRoles={[USER_ROLES.ADMINISTRADOR]}
          />
          <ProtectedRoute
            path="/editar-perfil"
            component={EditProfilePage}
            isAuthenticated={isAuthenticated}
            allowedRoles={ALL_AUTHENTICATED_ROLES}
          />
        </Switch>
      </main>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Gerenciado pela Coordenação de Transportes - COTRAN
        </Typography>
      </Box>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
