import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 1,
        zIndex: 1000,
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Gerenciado pela Coordenação de Transporte e Manutenção - COTRAM
      </Typography>
    </Box>
  );
};

export default Footer;
