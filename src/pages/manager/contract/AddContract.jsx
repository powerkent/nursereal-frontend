import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import fr from 'date-fns/locale/fr';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../../api/axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const localTimeZone = 'Europe/Paris';

const locales = { fr: fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const messages = {
  today: "Aujourd'hui",
  previous: 'Précédent',
  next: 'Suivant',
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  noEventsInRange: 'Aucun événement à cette période.',
  showMore: (total) => `+ ${total} plus`,
};

const AddContract = () => {
  const [events, setEvents] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [startHour, setStartHour] = useState(dayjs().hour(8).minute(0));
  const [endHour, setEndHour] = useState(dayjs().hour(18).minute(0));
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');
  const [openings, setOpenings] = useState([]);

  const navigate = useNavigate();

  const fetchChildren = async () => {
    try {
      const response = await axios.get('/children');
      setChildren(response.data['member']);
    } catch (err) {
      setError('Erreur lors de la récupération des enfants.');
    }
  };

  const fetchChildContracts = async (childId) => {
    try {
      const response = await axios.get(
        `/contract_dates?page=1&childId=${childId}`
      );
      const contracts = response.data['member'];
      const childEvents = contracts.flatMap((contract) =>
        contract.childDates.map((date) => ({
          title: `${contract.firstname} ${contract.lastname.charAt(0)}`,
          start: dayjs.utc(date.contractTimeStart).tz(localTimeZone).toDate(),
          end: dayjs.utc(date.contractTimeEnd).tz(localTimeZone).toDate(),
          id: date.id,
        }))
      );
      setEvents(childEvents);
    } catch (err) {
      console.error('Erreur lors de la récupération des contrats.');
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    const nurseryOpenings = child.nurseryStructure.opening.map((opening) => ({
      day: opening.openingDay,
      startHour: opening.openingHour,
      endHour: opening.closingHour,
    }));
    setOpenings(nurseryOpenings);
    fetchChildContracts(child.id);
  };

  const isOpenDay = (date) => {
    const dayName = format(date, 'EEEE');
    return openings.some((opening) => opening.day === dayName);
  };

  const dayPropGetter = (date) => {
    if (!isOpenDay(date)) {
      return {
        style: {
          backgroundColor: 'rgba(255, 0, 0, 0.3)',
        },
      };
    }
    return {};
  };

  const handleSelectSlot = ({ slots }) => {
    const validSlots = slots.filter((slot) => isOpenDay(slot));
    if (validSlots.length > 0) {
      setSelectedDates(validSlots);
      setOpenPopup(true);
    } else {
      alert('La crèche est fermée à ces dates.');
    }
  };

  const handleSaveEvent = () => {
    const newEvents = selectedDates.map((date) => ({
      start: new Date(date.setHours(startHour.hour(), startHour.minute())),
      end: new Date(date.setHours(endHour.hour(), endHour.minute())),
      title: `${selectedChild.firstname} ${selectedChild.lastname.charAt(0)}`,
    }));

    setEvents([...events, ...newEvents]);
    setSelectedDates([]);
    setOpenPopup(false);
  };

  const handleDeleteEvent = (eventIndex) => {
    if (events[eventIndex].id !== undefined) {
      const requestBody = {
        contractDateIds: [events[eventIndex].id],
      };

      try {
        axios({
          method: 'delete',
          url: '/contract_dates',
          data: requestBody,
        });
      } catch (err) {
        setError('Erreur lors de la récupération des enfants.');
      }
    }

    setEvents(events.filter((_, index) => index !== eventIndex));
  };

  const handleEditEvent = (eventIndex) => {
    setCurrentEvent(eventIndex);
    setStartHour(dayjs(events[eventIndex].start));
    setEndHour(dayjs(events[eventIndex].end));
    setOpenPopup(true);
  };

  const handleSaveEdit = () => {
    const updatedEvents = [...events];
    updatedEvents[currentEvent] = {
      ...updatedEvents[currentEvent],
      start: new Date(
        updatedEvents[currentEvent].start.setHours(
          startHour.hour(),
          startHour.minute()
        )
      ),
      end: new Date(
        updatedEvents[currentEvent].end.setHours(
          endHour.hour(),
          endHour.minute()
        )
      ),
    };
    setEvents(updatedEvents);
    setOpenPopup(false);
  };

  const handleSubmitContracts = async () => {
    const contractDates = events.map((event) => ({
      contractTimeStart: dayjs(event.start).utc().format('YYYY-MM-DD HH:mm:ss'),
      contractTimeEnd: dayjs(event.end).utc().format('YYYY-MM-DD HH:mm:ss'),
    }));

    const requestBody = {
      childUuid: selectedChild.uuid,
      contractDates,
    };

    try {
      await axios.post('/contract_dates', requestBody);
      navigate('/contracts');
    } catch (error) {
      setError("Erreur lors de l'ajout des contrats");
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '60%',
        margin: 'auto',
        padding: 6,
        textAlign: 'center',
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        marginTop: 8,
      }}
    >
      <Typography variant='h4' gutterBottom>
        Ajouter un contrat
      </Typography>

      {error && <Typography color='error'>{error}</Typography>}

      <FormControl
        sx={{ width: '50%', marginBottom: 10 }}
        disabled={events.length > 0}
      >
        <InputLabel>Choisissez un enfant</InputLabel>
        <Select
          value={selectedChild?.uuid || ''}
          onChange={(e) => {
            const selected = children.find(
              (child) => child.uuid === e.target.value
            );
            handleSelectChild(selected);
          }}
          required
        >
          {children.length > 0 ? (
            children.map((child) => (
              <MenuItem key={child.uuid} value={child.uuid}>
                {child.firstname} {child.lastname}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Pas d&apos;enfants disponibles</MenuItem>
          )}
        </Select>
      </FormControl>

      <Calendar
        localizer={localizer}
        culture='fr'
        messages={messages}
        events={events}
        startAccessor='start'
        endAccessor='end'
        style={{ height: 500, cursor: 'pointer' }}
        selectable
        onSelectSlot={handleSelectSlot}
        dayPropGetter={dayPropGetter}
        className='custom-calendar'
      />

      <Typography variant='h6' gutterBottom sx={{ marginTop: 2 }}>
        Contrats ajoutés :
      </Typography>

      {events.map((event, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 1,
          }}
        >
          <Typography>
            {format(event.start, 'dd/MM/yyyy')} de{' '}
            {format(event.start, 'HH:mm')} à {format(event.end, 'HH:mm')} pour{' '}
            {event.title}
          </Typography>
          <Box>
            <IconButton onClick={() => handleEditEvent(index)} color='primary'>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteEvent(index)} color='error'>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}

      <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
        <Box sx={{ padding: 3 }}>
          <Typography variant='h6'>Ajouter un horaire</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label='Heure de début'
              value={startHour}
              onChange={(newValue) => setStartHour(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              ampm={false}
            />
            <TimePicker
              label='Heure de fin'
              value={endHour}
              onChange={(newValue) => setEndHour(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              ampm={false}
            />
          </LocalizationProvider>
          <Button
            variant='contained'
            color='primary'
            onClick={currentEvent !== null ? handleSaveEdit : handleSaveEvent}
            sx={{ marginTop: 2 }}
            fullWidth
          >
            {currentEvent !== null ? 'Modifier' : 'Ajouter'}
          </Button>
        </Box>
      </Dialog>

      <Button
        variant='contained'
        color='primary'
        onClick={handleSubmitContracts}
        sx={{ marginTop: 4 }}
        disabled={!selectedChild || events.length === 0}
      >
        Soumettre les contrats
      </Button>
    </Paper>
  );
};

export default AddContract;
