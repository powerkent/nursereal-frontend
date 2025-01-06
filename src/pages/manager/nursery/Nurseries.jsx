import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Button } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';

const Nurseries = () => {
  const [nurseries, setNurseries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const response = await axios.get('/nursery_structures');
        setNurseries(response.data['member']);
      } catch (error) {
        console.error('Failed to fetch nurseries', error);
      }
    };
    fetchNurseries();
  }, []);

  const handleSelect = (uuid) => {
    navigate(`/nurseries/${uuid}`);
  };

  const handleEdit = (uuid) => {
    navigate(`/nurseries/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/nursery_structures/${uuid}`);
      setNurseries(nurseries.filter((nursery) => nursery.uuid !== uuid));
    } catch (error) {
      console.error('Failed to delete nursery', error);
    }
  };

  const handleAddNursery = () => {
    navigate('/nurseries/add');
  };

  return (
    <Box sx={{ padding: 4, position: 'relative' }}>
      <Typography variant='h4' gutterBottom align='center'>
        Liste des Crèches
      </Typography>

      <Box
        sx={{
          maxWidth: '800px', // Limite la largeur maximale
          margin: 'auto', // Centre le contenu
        }}
      >
        {nurseries.map((nursery) => (
          <Paper
            key={nursery.uuid}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 2,
              marginBottom: 2,
              backgroundColor: '#f5f5f5',
              boxShadow: 3, // Ajoute une ombre légère
            }}
          >
            {/* Informations sur la crèche à gauche */}
            <Box>
              <Typography variant='h6'>{nursery.name}</Typography>
              <Typography>{nursery.address}</Typography>
            </Box>

            {/* Icônes à droite */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color='primary'
                onClick={() => handleSelect(nursery.uuid)}
              >
                <Visibility />
              </IconButton>
              <IconButton
                color='warning'
                onClick={() => handleEdit(nursery.uuid)}
              >
                <Edit />
              </IconButton>
              <IconButton
                color='error'
                onClick={() => handleDelete(nursery.uuid)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Button variant='contained' color='success' onClick={handleAddNursery}>
          Ajouter une Crèche
        </Button>
      </Box>
    </Box>
  );
};

export default Nurseries;
