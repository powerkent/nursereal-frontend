import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Button } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get('/agents');
        setAgents(response.data['member']);
      } catch (error) {
        console.error('Failed to fetch agents', error);
      }
    };
    fetchAgents();
  }, []);

  const handleSelect = (uuid) => {
    navigate(`/agents/${uuid}`);
  };

  const handleEdit = (uuid) => {
    navigate(`/agents/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/agents/${uuid}`);
      setAgents(agents.filter((agent) => agent.uuid !== uuid));
    } catch (error) {
      console.error('Failed to delete agent', error);
    }
  };

  const handleAddAgent = () => {
    navigate('/agents/add');
  };

  return (
    <Box sx={{ padding: 4, position: 'relative' }}>
      <Typography variant='h4' gutterBottom align='center'>
        Liste des Agents
      </Typography>

      <Box
        sx={{
          maxWidth: '800px',
          margin: 'auto',
        }}
      >
        {agents.map((agent) => (
          <Paper
            key={agent.uuid}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 2,
              marginBottom: 2,
              backgroundColor: '#f5f5f5',
              boxShadow: 3,
            }}
          >
            <Box>
              <Typography variant='h6'>
                {agent.firstname} {agent.lastname}
              </Typography>
              <Typography>Email: {agent.email}</Typography>
              <Typography>Rôle: {agent.roles.join(', ')}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color='primary'
                onClick={() => handleSelect(agent.uuid)}
              >
                <Visibility />
              </IconButton>
              <IconButton
                sx={{ color: 'orange' }}
                onClick={() => handleEdit(agent.uuid)}
              >
                <Edit />
              </IconButton>
              <IconButton
                color='error'
                onClick={() => handleDelete(agent.uuid)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Button variant='contained' color='success' onClick={handleAddAgent}>
          Ajouter un Agent
        </Button>
      </Box>
    </Box>
  );
};

export default Agents;
