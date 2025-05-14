import React from 'react';
import { Box } from '@mui/material';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flex: 1, pb: 7 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
