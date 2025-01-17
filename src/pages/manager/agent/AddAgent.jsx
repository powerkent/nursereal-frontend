import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';

const AddAgent = () => {
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;
  const [agent, setAgent] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    roles: [],
    nurseryStructures: [],
  });
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

  const handleChange = (e) => {
    setAgent({ ...agent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/agents', agent);
      navigate('/agents');
    } catch (error) {
      console.error('Failed to add agent', error);
    }
  };

  return (
    <Box
      sx={{
        width: '400px',
        margin: 'auto',
        padding: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant='h4' gutterBottom>
        Ajouter un Agent
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label='Prénom'
          name='firstname'
          value={agent.firstname}
          onChange={handleChange}
          margin='normal'
          required
        />
        <TextField
          fullWidth
          label='Nom'
          name='lastname'
          value={agent.lastname}
          onChange={handleChange}
          margin='normal'
          required
        />
        <TextField
          fullWidth
          label='Email'
          name='email'
          type='email'
          value={agent.email}
          onChange={handleChange}
          margin='normal'
          required
        />
        {agentLoginWithPhone && (
          <TextField
            fullWidth
            label='Mot de passe'
            name='password'
            type='password'
            value={agent.password}
            onChange={handleChange}
            margin='normal'
            required
          />
        )}
        <FormControl fullWidth margin='normal'>
          <InputLabel>Rôles</InputLabel>
          <Select
            name='roles'
            multiple
            value={agent.roles}
            onChange={handleChange}
          >
            <MenuItem value='ROLE_MANAGER'>ROLE_MANAGER</MenuItem>
            <MenuItem value='ROLE_AGENT'>ROLE_AGENT</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <InputLabel>Crèches</InputLabel>
          <Select
            name='nurseryStructures'
            multiple
            value={agent.nurseryStructures}
            onChange={handleChange}
          >
            {nurseries.map((nursery) => (
              <MenuItem key={nursery.uuid} value={nursery.uuid}>
                {nursery.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type='submit'
          variant='contained'
          color='primary'
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Ajouter
        </Button>
      </form>
    </Box>
  );
};

export default AddAgent;
