import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Utilisation de DatePicker pour les dates uniquement
import dayjs from 'dayjs';
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const AddTreatment = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState(dayjs());
  const [endAt, setEndAt] = useState(dayjs());
  const [dosage, setDosage] = useState([{ dose: '', dosingTime: '' }]);
  const [childUuid, setChildUuid] = useState('');
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get('/children');
        setChildren(response.data['member']);
      } catch (error) {
        setError('Échec du chargement des enfants.');
      }
    };
    fetchChildren();
  }, []);

  const handleDosageChange = (index, field, value) => {
    const updatedDosages = [...dosage];
    updatedDosages[index][field] = value;
    setDosage(updatedDosages);
  };

  const addDosageField = () => {
    setDosage([...dosage, { dose: '', dosingTime: '' }]);
  };

  const removeDosageField = (index) => {
    const updatedDosages = dosage.filter((_, i) => i !== index);
    setDosage(updatedDosages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/treatments?childUuid=${childUuid}`, {
        name,
        description,
        startAt: startAt.format('DD-MM-YYYY'),
        endAt: endAt.format('DD-MM-YYYY'),
        dosages: dosage,
      });
      navigate('/treatments');
    } catch (err) {
      setError("Échec de l'ajout du traitement.");
    }
  };

  return (
    <Box
      sx={{
        width: '500px',
        margin: 'auto',
        padding: 4,
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '10px',
        boxShadow: 3,
        marginTop: 6,
      }}
    >
      <Typography variant='h4' gutterBottom>
        Ajouter un Traitement
      </Typography>

      {error && <Typography color='error'>{error}</Typography>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label='Nom'
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin='normal'
          required
        />
        <TextField
          fullWidth
          label='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin='normal'
          required
        />
        <FormControl fullWidth margin='normal'>
          <InputLabel>Enfant</InputLabel>
          <Select
            value={childUuid}
            onChange={(e) => setChildUuid(e.target.value)}
            required
          >
            {children.map((child) => (
              <MenuItem key={child.uuid} value={child.uuid}>
                {child.firstname} {child.lastname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker
              label='Date de début'
              value={startAt}
              onChange={(newValue) => setStartAt(newValue)}
              renderInput={(params) => (
                <TextField fullWidth margin='normal' {...params} />
              )}
            />
            <DatePicker
              label='Date de fin'
              value={endAt}
              onChange={(newValue) => setEndAt(newValue)}
              renderInput={(params) => (
                <TextField fullWidth margin='normal' {...params} />
              )}
            />
          </Box>
        </LocalizationProvider>

        {dosage.map((dosageField, index) => (
          <Box
            key={index}
            sx={{
              marginTop: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              fullWidth
              label='Dose'
              value={dosageField.dose}
              onChange={(e) =>
                handleDosageChange(index, 'dose', e.target.value)
              }
              margin='normal'
              required
            />
            <TextField
              fullWidth
              label='Heure de dosage'
              type='time'
              value={dosageField.dosingTime}
              onChange={(e) =>
                handleDosageChange(index, 'dosingTime', e.target.value)
              }
              margin='normal'
              required
            />
            <IconButton color='error' onClick={() => removeDosageField(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <IconButton onClick={addDosageField} sx={{ marginTop: 2 }}>
          <AddIcon /> Une dose
        </IconButton>

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

export default AddTreatment;
