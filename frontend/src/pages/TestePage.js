import React from 'react';
import { Box } from '@mui/material';
import HomeSandboxPage from './HomeSandboxPage';

const TestePage = () => {
  return (
    <Box sx={{ p: 0 }}>
      <HomeSandboxPage hideRotasProgramadas={true} hidePainelViagens={true} />
    </Box>
  );
};

export default TestePage;
