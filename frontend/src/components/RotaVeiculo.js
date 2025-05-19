import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, useTheme, Button, Collapse } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const RotaLinha = styled(Box)(({ theme, cor }) => ({
  position: 'absolute',
  top: '50%',
  left: '0',
  width: '100%',
  height: 1.5,
  background: cor || theme.palette.primary.main,
  zIndex: 1,
  transform: 'translateY(-50%)'
}));

const RotaContainer = styled(Box)(({ theme, cor }) => ({
  position: 'relative',
  padding: theme.spacing(0.5),
  height: 'auto',
  overflow: 'visible',
  minWidth: '100%',
  backgroundColor: 'transparent',
  border: `1px solid ${cor || theme.palette.primary.main}`,
  borderRadius: 2,
  boxShadow: 'none',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'transparent',
    pointerEvents: 'none'
  }
}));

const CidadeContainer = styled(Box)(({ theme, cor }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  minWidth: 120,
  height: '120px',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${cor || theme.palette.primary.main}`,
  borderRadius: 2,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const CidadeIcon = styled(LocationOnIcon)(({ theme, cor }) => ({
  color: cor || theme.palette.primary.main,
  fontSize: 24,
  position: 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 2
}));

const CidadeNome = styled(Typography)(({ theme, cor }) => ({
  position: 'absolute',
  bottom: '30%',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: cor || theme.palette.primary.main,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
}));

const RotaVeiculo = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const cidades = [
    { nome: 'Teresina', cor: '#2196F3' },
    { nome: 'José de Freitas', cor: '#2196F3' },
    { nome: 'Picos', cor: '#2196F3' },
    { nome: 'São Raimundo Nonato', cor: '#2196F3' },
    { nome: 'Parnaíba', cor: '#2196F3' }
  ];

  return (
    <Button
      variant="contained"
      onClick={handleExpandClick}
      startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      endIcon={<LocalShippingIcon />}
      fullWidth
      sx={{
        mb: 2,
        bgcolor: theme.palette.primary.main,
        color: 'white',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        borderRadius: 0,
        '&:hover': {
          bgcolor: theme.palette.primary.dark,
        },
      }}
    >
      ROTAS ATIVAS
    </Button>
  );
};

export default RotaVeiculo;
