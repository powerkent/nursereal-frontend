import React from 'react';
import { Box, Grid, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const sections = [
    { title: 'Crèches', path: '/nurseries' },
    { title: 'Agents', path: '/agents' },
    { title: 'Enfants', path: '/children' },
    { title: 'Parents', path: '/parents' },
    { title: 'Traitements', path: '/treatments' },
    { title: 'Activités', path: '/activities' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Dashboard
      </Typography>

      <Grid 
        container 
        spacing={1} 
        justifyContent="center" 
        alignItems="center"
        sx={{ gap: 2 }} 
      >
        {sections.map((section) => (
          <Grid item key={section.title} xs="auto">
            <Paper
              sx={{
                width: '100px',
                height: '80px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#3498db',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
              }}
              onClick={() => navigate(section.path)}
            >
              <Typography variant="body1">{section.title}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Déconnexion
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
