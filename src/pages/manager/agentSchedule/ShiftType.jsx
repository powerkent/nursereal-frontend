import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  Button,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from '../../../api/axios';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const localTimeZone = 'Europe/Paris';

const ShiftType = () => {
  // Liste des shifts
  const [shifts, setShifts] = useState([]);

  // Champs du formulaire
  const [name, setName] = useState('');
  const [arrivalTime, setArrivalTime] = useState(
    dayjs.utc('08:00', 'HH:mm').tz(localTimeZone)
  );
  const [endOfWorkTime, setEndOfWorkTime] = useState(
    dayjs.utc('16:00', 'HH:mm').tz(localTimeZone)
  );
  const [breakTime, setBreakTime] = useState(dayjs.utc('12:00', 'HH:mm'));
  const [endOfBreakTime, setEndOfBreakTime] = useState(
    dayjs.utc('12:30', 'HH:mm').tz(localTimeZone)
  );

  // Liste de toutes les crèches disponibles (pour le multi-select)
  const [allNurseries, setAllNurseries] = useState([]);

  // Les crèches sélectionnées dans le formulaire
  const [selectedNurseries, setSelectedNurseries] = useState([]);

  // Récupération des shifts et des crèches à l'initialisation
  useEffect(() => {
    fetchShifts();
    fetchNurseries();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await axios.get('/shift_types');
      setShifts(response.data.member || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des shifts:', error);
    }
  };

  const fetchNurseries = async () => {
    try {
      // Appel pour récupérer la liste de toutes les crèches
      const response = await axios.get('/nursery_structures');
      // On stocke le tableau dans allNurseries
      setAllNurseries(response.data.member || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des crèches:', error);
    }
  };

  const handleAddShift = async () => {
    // Construction du payload (format "HH:mm" pour les TimePicker)
    console.log(selectedNurseries);
    const payload = {
      name: name.trim(),
      arrivalTime: arrivalTime.utc().format('HH:mm'),
      endOfWorkTime: endOfWorkTime.utc().format('HH:mm'),
      breakTime: breakTime.utc().format('HH:mm'),
      endOfBreakTime: endOfBreakTime.utc().format('HH:mm'),
      nurseryStructures: selectedNurseries.map((nursery) => ({
        uuid: nursery,
      })),
    };

    // Vérifier qu'on a bien un nom
    if (!payload.name) {
      alert('Veuillez saisir un nom pour le type de poste.');
      return;
    }

    try {
      await axios.post('/shift_types', payload);

      // Réinitialiser le formulaire
      setName('');
      setArrivalTime(dayjs('08:00', 'HH:mm').tz(localTimeZone, true));
      setEndOfWorkTime(dayjs('16:00', 'HH:mm').tz(localTimeZone, true));
      setBreakTime(dayjs('12:00', 'HH:mm').tz(localTimeZone, true));
      setEndOfBreakTime(dayjs('12:30', 'HH:mm').tz(localTimeZone, true));
      setSelectedNurseries([]);

      // Recharger la liste
      fetchShifts();
    } catch (error) {
      console.error('Erreur lors de la création du shift:', error);
      alert("Impossible d'ajouter ce type de poste.");
    }
  };

  // Gestion de la sélection multiple de crèches
  const handleNurseriesChange = (event) => {
    const {
      target: { value },
    } = event;
    // On stocke les UUID sélectionnés (value sera un array)
    setSelectedNurseries(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4 }}>
        <Typography variant='h4' gutterBottom>
          Gérer les types de poste
        </Typography>

        {/* Liste des shifts existants */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Liste des Shifts
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Heure d&apos;arrivée</TableCell>
                <TableCell>Heure de fin</TableCell>
                <TableCell>Début de pause</TableCell>
                <TableCell>Fin de pause</TableCell>
                <TableCell>Crèches</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.uuid}>
                  <TableCell>{shift.name}</TableCell>
                  <TableCell>
                    {dayjs
                      .utc(shift.arrivalTime, 'HH:mm')
                      .tz(localTimeZone)
                      .format('HH:mm')}
                  </TableCell>
                  <TableCell>
                    {dayjs
                      .utc(shift.endOfWorkTime, 'HH:mm')
                      .tz(localTimeZone)
                      .format('HH:mm')}
                  </TableCell>
                  <TableCell>
                    {dayjs
                      .utc(shift.breakTime, 'HH:mm')
                      .tz(localTimeZone)
                      .format('HH:mm')}
                  </TableCell>
                  <TableCell>
                    {dayjs
                      .utc(shift.endOfBreakTime, 'HH:mm')
                      .tz(localTimeZone)
                      .format('HH:mm')}
                  </TableCell>
                  <TableCell>
                    {shift.nurseryStructures
                      ? shift.nurseryStructures
                          .map((nursery) => nursery.name)
                          .join(', ')
                      : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Formulaire d'ajout d'un nouveau Shift */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100vh',
            gap: 2,
            padding: 0,
            marginTop: 0,
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
            <Typography variant='h6' sx={{ mb: 2, textAlign: 'center' }}>
              Ajouter un type de poste
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: 400,
              }}
            >
              <TextField
                label='Nom du poste'
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />

              <TimePicker
                label="Heure d'arrivée"
                value={arrivalTime}
                onChange={(newValue) => setArrivalTime(newValue)}
                ampm={false}
              />

              <TimePicker
                label='Heure de fin'
                value={endOfWorkTime}
                onChange={(newValue) => setEndOfWorkTime(newValue)}
                ampm={false}
              />

              <TimePicker
                label='Début de pause'
                value={breakTime}
                onChange={(newValue) => setBreakTime(newValue)}
                ampm={false}
              />

              <TimePicker
                label='Fin de pause'
                value={endOfBreakTime}
                onChange={(newValue) => setEndOfBreakTime(newValue)}
                ampm={false}
              />

              {/* Sélecteur à choix multiple pour les crèches */}
              <FormControl fullWidth>
                <InputLabel id='select-multiple-nurseries-label'>
                  Crèches
                </InputLabel>
                <Select
                  labelId='select-multiple-nurseries-label'
                  multiple
                  value={selectedNurseries}
                  onChange={handleNurseriesChange}
                  input={<OutlinedInput label='Crèches' />}
                  renderValue={(selected) => {
                    // selected est un tableau d'UUID de crèches
                    const names = selected
                      .map((uuid) => {
                        const found = allNurseries.find((n) => n.uuid === uuid);
                        return found ? found.name : '';
                      })
                      .filter((name) => name) // on enlève les vides
                      .join(', ');
                    return names || 'Aucune sélection';
                  }}
                >
                  {allNurseries.map((nursery) => (
                    <MenuItem key={nursery.uuid} value={nursery.uuid}>
                      {/* On peut afficher une case à cocher pour chaque item */}
                      <Checkbox
                        checked={selectedNurseries.includes(nursery.uuid)}
                      />
                      <ListItemText primary={nursery.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button variant='contained' onClick={handleAddShift}>
                Ajouter
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ShiftType;
