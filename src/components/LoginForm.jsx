import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const LoginForm = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get('/configs');
      const configs = data['hydra:member'] || [];
      const agentConfig = configs.find(
        (configItem) => configItem.name === 'AGENT_LOGIN_WITH_PHONE'
      );

      if (agentConfig) {
        localStorage.setItem(
          'AGENT_LOGIN_WITH_PHONE',
          JSON.stringify(agentConfig.value)
        );
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la config :', error);
    }
    try {
      const response = await axios.post('/login/agent', { user, password });
      localStorage.setItem('token', response.data.token);
      const decodedToken = jwtDecode(response.data.token);
      localStorage.setItem('roles', decodedToken['roles']);
      localStorage.setItem('id', decodedToken['id']);
      localStorage.setItem('uuid', decodedToken['uuid']);
      navigate('/');
    } catch (error) {
      setError('Invalid user or password');
    }
  };

  return (
    <Box sx={{ width: 300, margin: 'auto', mt: 5, textAlign: 'center' }}>
      <Typography variant='h4' gutterBottom>
        Login
      </Typography>
      {error && <Typography color='error'>{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label='User'
          variant='outlined'
          fullWidth
          margin='normal'
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <TextField
          label='Password'
          type='password'
          variant='outlined'
          fullWidth
          margin='normal'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type='submit' variant='contained' color='primary' fullWidth>
          Login
        </Button>
      </form>
    </Box>
  );
};

export default LoginForm;
