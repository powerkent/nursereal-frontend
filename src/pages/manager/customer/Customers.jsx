import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Button } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material'; // Import des icônes
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/customers');
        setCustomers(response.data['member']);
      } catch (error) {
        console.error('Failed to fetch customers', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleSelect = (uuid) => {
    navigate(`/customers/${uuid}`);
  };

  const handleEdit = (uuid) => {
    navigate(`/customers/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/customers/${uuid}`);
      setCustomers(customers.filter((customer) => customer.uuid !== uuid));
    } catch (error) {
      console.error('Failed to delete customer', error);
    }
  };

  const handleAddCustomer = () => {
    navigate('/customers/add');
  };

  return (
    <Box sx={{ padding: 4, position: 'relative' }}>
      <Typography variant='h4' gutterBottom align='center'>
        Liste des Parents
      </Typography>

      <Box
        sx={{
          maxWidth: '800px',
          margin: 'auto',
        }}
      >
        {customers.map((customer) => (
          <Paper
            key={customer.uuid}
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
                {customer.firstname} {customer.lastname}
              </Typography>
              <Typography>Email: {customer.email}</Typography>
              <Typography>Téléphone: {customer.phoneNumber}</Typography>
              <Typography>
                Enfants:{' '}
                {customer.children.length > 0
                  ? customer.children
                      .map((child) => `${child.firstname} ${child.lastname}`)
                      .join(', ')
                  : 'Aucun enfant'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color='primary'
                onClick={() => handleSelect(customer.uuid)}
              >
                <Visibility />
              </IconButton>
              <IconButton
                sx={{ color: 'orange' }}
                onClick={() => handleEdit(customer.uuid)}
              >
                <Edit />
              </IconButton>
              <IconButton
                color='error'
                onClick={() => handleDelete(customer.uuid)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Button variant='contained' color='success' onClick={handleAddCustomer}>
          Ajouter un Parent
        </Button>
      </Box>
    </Box>
  );
};

export default Customers;
