import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Paper,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import axios from '../../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const EditNursery = () => {
  const { uuid } = useParams();
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openings, setOpenings] = useState([
    {
      openingHour: dayjs('08:00', 'HH:mm'),
      closingHour: dayjs('19:00', 'HH:mm'),
      openingDay: '',
    },
  ]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const daysOfWeek = [
    { french: 'Lundi', english: 'Monday' },
    { french: 'Mardi', english: 'Tuesday' },
    { french: 'Mercredi', english: 'Wednesday' },
    { french: 'Jeudi', english: 'Thursday' },
    { french: 'Vendredi', english: 'Friday' },
    { french: 'Samedi', english: 'Saturday' },
    { french: 'Dimanche', english: 'Sunday' },
  ];

  useEffect(() => {
    const fetchNursery = async () => {
      try {
        const response = await axios.get(`/nursery_structures/${uuid}`);
        setName(response.data.name);
        setAddress(response.data.address);
        setOpenings(
          response.data.openings.map((opening) => ({
            openingHour: dayjs(opening.openingHour, 'HH:mm'),
            closingHour: dayjs(opening.closingHour, 'HH:mm'),
            openingDay: opening.openingDay,
          }))
        );
      } catch (err) {
        setError('Failed to load nursery details.');
      }
    };
    fetchNursery();
  }, [uuid]);

  const handleOpeningsChange = (index, field, value) => {
    const updatedOpenings = [...openings];
    updatedOpenings[index][field] = value;
    setOpenings(updatedOpenings);
  };

  const addOpeningField = () => {
    setOpenings([
      ...openings,
      {
        openingHour: dayjs('08:00', 'HH:mm'),
        closingHour: dayjs('19:00', 'HH:mm'),
        openingDay: '',
      },
    ]);
  };

  const removeOpeningField = (index) => {
    const updatedOpenings = openings.filter((_, i) => i !== index);
    setOpenings(updatedOpenings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      address,
      openings: openings.map((opening) => ({
        openingHour: opening.openingHour.format('HH:mm'),
        closingHour: opening.closingHour.format('HH:mm'),
        openingDay: opening.openingDay,
      })),
    };

    if (!agentLoginWithPhone) {
      payload.user = user;
      payload.password = password;
    }

    try {
      await axios.put(`/nursery_structures/${uuid}`, payload);
      navigate('/nurseries');
    } catch (err) {
      setError('Failed to update the nursery. Please try again.');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '32%',
        margin: 'auto',
        padding: 6,
        textAlign: 'center',
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        marginTop: 8,
      }}
    >
      <Typography variant='h4' gutterBottom>
        Modifier une Crèche
      </Typography>

      {error && <Typography color='error'>{error}</Typography>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label='Nom de la Crèche'
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin='normal'
          required
        />
        <TextField
          fullWidth
          label='Adresse'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          margin='normal'
          required
        />

        {!agentLoginWithPhone && (
          <>
            <TextField
              label='User'
              variant='outlined'
              fullWidth
              margin='normal'
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
            <TextField
              label='Password'
              type='password'
              variant='outlined'
              fullWidth
              margin='normal'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}

        {openings.map((opening, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, marginTop: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Heure d'ouverture"
                value={opening.openingHour}
                onChange={(newValue) =>
                  handleOpeningsChange(index, 'openingHour', newValue)
                }
                ampm={false}
                renderInput={(params) => <TextField {...params} />}
              />
              <TimePicker
                label='Heure de fermeture'
                value={opening.closingHour}
                onChange={(newValue) =>
                  handleOpeningsChange(index, 'closingHour', newValue)
                }
                ampm={false}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel>Jour</InputLabel>
              <Select
                value={opening.openingDay}
                onChange={(e) =>
                  handleOpeningsChange(index, 'openingDay', e.target.value)
                }
                required
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day.english} value={day.english}>
                    {day.french}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton color='error' onClick={() => removeOpeningField(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <IconButton onClick={addOpeningField} sx={{ marginTop: 4 }}>
          <AddIcon /> Ajouter un créneau
        </IconButton>

        <Button
          type='submit'
          variant='contained'
          color='primary'
          fullWidth
          sx={{ marginTop: 4 }}
        >
          Modifier
        </Button>
      </form>
    </Paper>
  );
};

export default EditNursery;
