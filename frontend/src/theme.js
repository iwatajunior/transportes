import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3', // Azul mais claro
      dark: '#1976d2', // Azul médio
      light: '#BBDEFB', // Azul mais claro
    },
    secondary: {
      main: '#FFA726', // Laranja principal
      dark: '#FF8F00', // Laranja mais escuro
      light: '#FFE082', // Laranja mais claro
    },
    neutral: {
      main: '#e0e0e0',
      dark: '#cccccc',
      light: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: "'Exo 2', sans-serif",
  },
});

export default theme;
