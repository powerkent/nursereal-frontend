import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  TextField,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import fr from 'date-fns/locale/fr';

import axios from '../../../api/axios';

dayjs.extend(utc);
dayjs.extend(timezone);

// Configuration react-big-calendar
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
};

const AgentSchedule = () => {
  // -- States de base
  const [nurseries, setNurseries] = useState([]);
  const [selectedNurseryUuid, setSelectedNurseryUuid] = useState('');

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [shiftRotation, setShiftRotation] = useState(false);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [selectedShiftType, setSelectedShiftType] = useState('');

  // rawSchedules : chaque objet = {
  //   date, arrivalTime, breakStartTime, breakEndTime, endTime, agentUuid, uuid
  // }
  const [rawSchedules, setRawSchedules] = useState([]);

  // Ouvertures de la crèche
  const [openings, setOpenings] = useState([]);

  // Popups
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);

  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);

  // TimePickers (pour l'ajout)
  const [arrivalTime, setArrivalTime] = useState(dayjs().hour(8).minute(0));
  const [endTime, setEndTime] = useState(dayjs().hour(16).minute(0));
  const [breakStartTime, setBreakStartTime] = useState(
    dayjs().hour(12).minute(0)
  );
  const [endOfBreakTime, setEndOfBreakTime] = useState(
    dayjs().hour(12).minute(30)
  );

  // Vue courante du calendrier
  const [currentView, setCurrentView] = useState('month');

  // ----------------------------------------------------------------------
  // 1) Récupérer la liste des nurseries et shiftTypes
  // ----------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const nurseriesRes = await axios.get('/nursery_structures');
        setNurseries(nurseriesRes.data['member'] || []);

        const shiftsRes = await axios.get('/shift_types');
        setShiftTypes(shiftsRes.data['member'] || []);
      } catch (error) {
        console.error('Erreur initiale:', error);
      }
    };
    fetchData();
  }, []);

  // ----------------------------------------------------------------------
  // 2) Récupère la liste des agents d’une crèche + openings
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!selectedNurseryUuid) {
      setAgents([]);
      setSelectedAgent(null);
      setRawSchedules([]);
      return;
    }

    const fetchAgentsAndOpenings = async () => {
      try {
        // 1) Agents
        const agentRes = await axios.get(
          `/agents?nursery_structure_uuid=${selectedNurseryUuid}`
        );
        const agentsData = agentRes.data['member'] || [];
        setAgents(agentsData);

        // 2) Crèche (pour openings)
        const nurseryRes = await axios.get(
          `/nursery_structures/${selectedNurseryUuid}`
        );
        setOpenings(nurseryRes.data['openings'] || []);

        // 3) Tous les agent_schedules pour la crèche
        const scheduleRes = await axios.get(
          `/agent_schedules?nursery_structure_uuid=${selectedNurseryUuid}`
        );
        const schedulesData = scheduleRes.data['member'] || [];

        // On convertit les champs date/heure + on récupère le prénom/nom depuis "agent"
        const mappedSchedules = schedulesData.map((sch) => {
          const arr = dayjs(sch.arrivalDateTime);
          const brk = dayjs(sch.breakDateTime);
          const brkEnd = dayjs(sch.endOfBreakDateTime);
          const end = dayjs(sch.endOfWorkDateTime);

          // Le back inclut agent: { firstname, lastname, ... }
          // On enregistre ces infos pour le display
          const agentView = sch.agent || {};
          const firstname = agentView.firstname || '???';
          const lastname = agentView.lastname || '';

          return {
            uuid: sch.uuid, // ID planning
            agentUuid: agentView.uuid || null, // si besoin
            agentFirstname: firstname, // <-- pour l'affichage direct
            agentLastname: lastname, // <-- pour l'affichage direct

            date: arr.format('YYYY-MM-DD'),
            arrivalTime: arr.format('HH:mm'),
            breakStartTime: brk.format('HH:mm'),
            breakEndTime: brkEnd.format('HH:mm'),
            endTime: end.format('HH:mm'),
          };
        });

        setRawSchedules(mappedSchedules);
      } catch (error) {
        console.error('Erreur fetching agents/openings/schedules:', error);
      }
    };
    fetchAgentsAndOpenings();
  }, [selectedNurseryUuid]);

  // ----------------------------------------------------------------------
  // 3) Lorsque l’agent est sélectionné, charger SES schedules
  // ----------------------------------------------------------------------
  /*useEffect(() => {
    if (!selectedAgent) {
      // Si on n'a pas d'agent, on laisse rawSchedules tel quel
      // => ça veut dire qu’on affiche "tous les plannings" de la crèche
      return;
    }

    const { schedules } = selectedAgent;
    if (!schedules || schedules.length === 0) {
      setRawSchedules([]);
      return;
    }

    const fromAPI = schedules.map((sch) => {
      const arr = dayjs(sch.arrivalDateTime);
      const brk = dayjs(sch.breakDateTime);
      const brkEnd = dayjs(sch.endOfBreakDateTime);
      const end = dayjs(sch.endOfWorkDateTime);

      return {
        uuid: sch.uuid,
        agentUuid: selectedAgent.uuid,
        date: arr.format('YYYY-MM-DD'),
        arrivalTime: arr.format('HH:mm'),
        breakStartTime: brk.format('HH:mm'),
        breakEndTime: brkEnd.format('HH:mm'),
        endTime: end.format('HH:mm'),
      };
    });

    setRawSchedules(fromAPI);
  }, [selectedAgent]);*/

  const refetchSchedulesForNursery = async (nurseryUuid) => {
    try {
      const scheduleRes = await axios.get(
        `/agent_schedules?nursery_structure_uuid=${nurseryUuid}`
      );
      const schedulesData = scheduleRes.data['member'] || [];

      // On mappe l’agent + heures, comme fait dans l’effet #2
      const mapped = schedulesData.map((sch) => {
        const arr = dayjs(sch.arrivalDateTime);
        const brk = dayjs(sch.breakDateTime);
        const brkEnd = dayjs(sch.endOfBreakDateTime);
        const end = dayjs(sch.endOfWorkDateTime);

        const agentView = sch.agent || {};
        return {
          uuid: sch.uuid,
          agentUuid: agentView.uuid || null,
          agentFirstname: agentView.firstname || '???',
          agentLastname: agentView.lastname || '',
          date: arr.format('YYYY-MM-DD'),
          arrivalTime: arr.format('HH:mm'),
          breakStartTime: brk.format('HH:mm'),
          breakEndTime: brkEnd.format('HH:mm'),
          endTime: end.format('HH:mm'),
        };
      });

      setRawSchedules(mapped);
    } catch (error) {
      console.error('Erreur refetchSchedulesForNursery:', error);
    }
  };

  // ----------------------------------------------------------------------
  // 4) dayPropGetter : colorer les jours fermés
  // ----------------------------------------------------------------------
  const isOpenDay = (date) => {
    if (!openings || openings.length === 0) return true;
    const dayName = format(date, 'EEEE');
    return openings.some((o) => o.openingDay === dayName);
  };
  const dayPropGetter = (date) => {
    if (!isOpenDay(date)) {
      return {
        style: { backgroundColor: 'rgba(255, 0, 0, 0.3)' },
      };
    }
    return {};
  };

  // ----------------------------------------------------------------------
  // 5) handleSelectSlot : Ajout ponctuel (uni-agent)
  // ----------------------------------------------------------------------
  const handleSelectSlot = ({ slots }) => {
    if (shiftRotation) return;

    const valid = slots.filter((slot) => isOpenDay(slot));
    if (!valid.length) {
      alert('La crèche est fermée aux dates choisies.');
      return;
    }
    setSelectedSlots(valid);
    setOpenPopup(true);
  };

  // ----------------------------------------------------------------------
  // 6) handleSaveEvent : Post immédiat (ponctuel)
  // ----------------------------------------------------------------------
  const handleSaveEvent = async () => {
    if (!selectedAgent) {
      alert('Veuillez sélectionner un agent.');
      return;
    }

    const newItems = selectedSlots.map((date) => ({
      agentUuid: selectedAgent.uuid,
      date: dayjs(date).format('YYYY-MM-DD'),
      arrivalTime: arrivalTime.format('HH:mm'),
      breakStartTime: breakStartTime.format('HH:mm'),
      breakEndTime: endOfBreakTime.format('HH:mm'),
      endTime: endTime.format('HH:mm'),
    }));

    const isPonctuel = !shiftRotation && !selectedShiftType;

    for (const item of newItems) {
      if (isPonctuel) {
        try {
          const response = await postScheduleToBackend(item);
          item.uuid = response.data['uuid'];
          setRawSchedules((prev) => [...prev, item]);
        } catch (err) {
          console.error('Erreur POST agent_schedules:', err);
          alert("Impossible d'enregistrer ce planning ponctuel.");
        }
      } else {
        setRawSchedules((prev) => [...prev, item]);
      }
    }

    setOpenPopup(false);
    setSelectedSlots([]);
    setArrivalTime(dayjs().hour(8).minute(0));
    setEndTime(dayjs().hour(16).minute(0));
    setBreakStartTime(dayjs().hour(12).minute(0));
    setEndOfBreakTime(dayjs().hour(12).minute(30));
  };

  // ----------------------------------------------------------------------
  // 7) postScheduleToBackend
  // ----------------------------------------------------------------------
  const postScheduleToBackend = async (item) => {
    const baseDayjs = dayjs(item.date, 'YYYY-MM-DD');
    const arr = baseDayjs
      .hour(parseInt(item.arrivalTime.split(':')[0], 10))
      .minute(parseInt(item.arrivalTime.split(':')[1], 10));
    const brkStart = baseDayjs
      .hour(parseInt(item.breakStartTime.split(':')[0], 10))
      .minute(parseInt(item.breakStartTime.split(':')[1], 10));
    const brkEnd = baseDayjs
      .hour(parseInt(item.breakEndTime.split(':')[0], 10))
      .minute(parseInt(item.breakEndTime.split(':')[1], 10));
    const end = baseDayjs
      .hour(parseInt(item.endTime.split(':')[0], 10))
      .minute(parseInt(item.endTime.split(':')[1], 10));

    const payload = {
      agentUuid: item.agentUuid,
      nurseryStructureUuid: selectedNurseryUuid || null,
      shiftRotation: false,
      shiftTypeUuid: null,
      arrivalDateTime: arr.utc().format('YYYY-MM-DD HH:mm:ss'),
      breakDateTime: brkStart.utc().format('YYYY-MM-DD HH:mm:ss'),
      endOfBreakDateTime: brkEnd.utc().format('YYYY-MM-DD HH:mm:ss'),
      endOfWorkDateTime: end.utc().format('YYYY-MM-DD HH:mm:ss'),
    };

    const response = await axios.post('/agent_schedules', payload);
    await refetchSchedulesForNursery(selectedNurseryUuid);
    return response;
  };

  // ----------------------------------------------------------------------
  // 8) displayEvents
  // ----------------------------------------------------------------------
  const displayEvents = useMemo(() => {
    const result = [];
    rawSchedules.forEach((item) => {
      const base = dayjs(item.date, 'YYYY-MM-DD');

      const arr = base
        .hour(item.arrivalTime.split(':')[0])
        .minute(item.arrivalTime.split(':')[1]);
      const brkStart = base
        .hour(item.breakStartTime.split(':')[0])
        .minute(item.breakStartTime.split(':')[1]);
      const brkEnd = base
        .hour(item.breakEndTime.split(':')[0])
        .minute(item.breakEndTime.split(':')[1]);
      const end = base
        .hour(item.endTime.split(':')[0])
        .minute(item.endTime.split(':')[1]);

      const firstname = item.agentFirstname || '???';
      const lastname = item.agentLastname || '';
      const title = `${firstname} ${lastname ? lastname.charAt(0) : ''}`;

      if (currentView === 'month') {
        result.push({
          title,
          start: arr.toDate(),
          end: end.toDate(),
          scheduleUuid: item.uuid,
        });
      } else {
        if (brkStart.isAfter(arr)) {
          result.push({
            title,
            start: arr.toDate(),
            end: brkStart.toDate(),
            scheduleUuid: item.uuid,
          });
        }
        if (end.isAfter(brkEnd)) {
          result.push({
            title,
            start: brkEnd.toDate(),
            end: end.toDate(),
            scheduleUuid: item.uuid,
          });
        }
      }
    });
    return result;
  }, [rawSchedules, currentView, agents]);

  // ----------------------------------------------------------------------
  // 9) handleSubmitSchedules (rotation ou shiftType)
  // ----------------------------------------------------------------------
  const handleSubmitSchedules = async () => {
    if (shiftRotation) {
      // Cas rotation
      const payload = {
        shiftRotation: true,
        nurseryStructureUuid: selectedNurseryUuid || null,
      };
      try {
        await axios.post('/agent_schedules', payload);

        // On recharge tous les plannings de la crèche
        await refetchSchedulesForNursery(selectedNurseryUuid);
      } catch (error) {
        console.error('Erreur planning rotation:', error);
      }
      return;
    }

    if (!shiftRotation && selectedShiftType && rawSchedules.length > 0) {
      // shiftType sans horaires => POST
      const payload = {
        agentUuid: selectedAgent?.uuid,
        nurseryStructureUuid: selectedNurseryUuid || null,
        shiftRotation: false,
        shiftTypeUuid: selectedShiftType,
      };
      try {
        await axios.post('/agent_schedules', payload);
        // => On recharge tous les plannings de la crèche
        await refetchSchedulesForNursery(selectedNurseryUuid);
      } catch (error) {
        console.error('Erreur planning shiftType:', error);
      }
      return;
    }

    alert('Rien à soumettre ici ou configuration incompatible.');
  };

  // ----------------------------------------------------------------------
  // 10) handleRotationChange
  // ----------------------------------------------------------------------
  const handleRotationChange = (e) => {
    const val = e.target.checked;
    setShiftRotation(val);
    if (val) {
      setSelectedAgent(null);
      setRawSchedules([]);
      setSelectedShiftType('');
    }
  };

  // ----------------------------------------------------------------------
  // 11) Edition/Suppression
  // ----------------------------------------------------------------------
  const handleSelectEvent = (event) => {
    const found = rawSchedules.find((rs) => rs.uuid === event.scheduleUuid);
    if (!found) return;

    setEditSchedule({ ...found });
    setOpenEditPopup(true);
  };

  const handleUpdateSchedule = async () => {
    if (!editSchedule) return;

    const idx = rawSchedules.findIndex((r) => r.uuid === editSchedule.uuid);
    if (idx === -1) return;

    const isPonctuel = !shiftRotation && !selectedShiftType;
    if (isPonctuel) {
      try {
        await updateScheduleOnBackend(editSchedule);
      } catch (error) {
        console.error('Erreur update schedule backend:', error);
        alert('Impossible de mettre à jour ce planning.');
        return;
      }
    }

    const newArr = [...rawSchedules];
    newArr[idx] = editSchedule;
    setRawSchedules(newArr);

    setOpenEditPopup(false);
    setEditSchedule(null);
  };

  const updateScheduleOnBackend = async (item) => {
    const baseDayjs = dayjs(item.date, 'YYYY-MM-DD');
    const arr = baseDayjs
      .hour(parseInt(item.arrivalTime.split(':')[0], 10))
      .minute(parseInt(item.arrivalTime.split(':')[1], 10));
    const brkStart = baseDayjs
      .hour(parseInt(item.breakStartTime.split(':')[0], 10))
      .minute(parseInt(item.breakStartTime.split(':')[1], 10));
    const brkEnd = baseDayjs
      .hour(parseInt(item.breakEndTime.split(':')[0], 10))
      .minute(parseInt(item.breakEndTime.split(':')[1], 10));
    const end = baseDayjs
      .hour(parseInt(item.endTime.split(':')[0], 10))
      .minute(parseInt(item.endTime.split(':')[1], 10));

    const arrivalDateTime = dayjs.utc(arr).format('YYYY-MM-DD HH:mm:ss');
    const breakDateTime = dayjs.utc(brkStart).format('YYYY-MM-DD HH:mm:ss');
    const endOfBreakDateTime = dayjs.utc(brkEnd).format('YYYY-MM-DD HH:mm:ss');
    const endOfWorkDateTime = dayjs.utc(end).format('YYYY-MM-DD HH:mm:ss');

    const payload = {
      agentUuid: item.agentUuid,
      nurseryStructureUuid: selectedNurseryUuid || null,
      shiftRotation: false,
      shiftTypeUuid: null,
      arrivalDateTime,
      breakDateTime,
      endOfBreakDateTime,
      endOfWorkDateTime,
    };

    await axios.put(`/agent_schedules/${item.uuid}`, payload);
  };

  const handleDeleteSchedule = async () => {
    if (!editSchedule) return;
    const idx = rawSchedules.findIndex((r) => r.uuid === editSchedule.uuid);
    if (idx === -1) return;

    const isPonctuel = !shiftRotation && !selectedShiftType;
    if (isPonctuel) {
      try {
        await axios.delete(`/agent_schedules/${editSchedule.uuid}`);
      } catch (error) {
        console.error('Erreur delete schedule:', error);
        alert('Impossible de supprimer ce planning.');
        return;
      }
    }

    const newArr = [...rawSchedules];
    newArr.splice(idx, 1);
    setRawSchedules(newArr);

    setOpenEditPopup(false);
    setEditSchedule(null);
  };

  // ----------------------------------------------------------------------
  // Rendu
  // ----------------------------------------------------------------------
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={3}
        sx={{
          width: '80%',
          margin: 'auto',
          padding: 6,
          textAlign: 'center',
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          marginTop: 8,
        }}
      >
        <Typography variant='h4' gutterBottom>
          Planifier un Agent
        </Typography>

        {/* Sélecteur de crèche */}
        <Box sx={{ marginBottom: 4 }}>
          <FormControl sx={{ width: '50%' }}>
            <InputLabel>Crèche</InputLabel>
            <Select
              value={selectedNurseryUuid}
              label='Crèche'
              onChange={(e) => {
                setSelectedNurseryUuid(e.target.value);
                setRawSchedules([]);
                setSelectedAgent(null);
                setShiftRotation(false);
                setSelectedShiftType('');
              }}
            >
              {nurseries.map((nursery) => (
                <MenuItem key={nursery.uuid} value={nursery.uuid}>
                  {nursery.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Check rotation */}
        <Box sx={{ marginBottom: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={shiftRotation}
                onChange={handleRotationChange}
              />
            }
            label='Rotation'
          />
          {shiftRotation && (
            <Box
              sx={{
                backgroundColor: '#f7d69c',
                color: '#a37729',
                padding: 2,
                borderRadius: 2,
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '400px',
                width: '100%',
                margin: 'auto',
                textAlign: 'center',
              }}
            >
              Cela effectuera un roulement...
            </Box>
          )}
        </Box>

        {/* Sélecteur d'Agent (disable si rotation) */}
        <Box sx={{ marginBottom: 4 }}>
          <FormControl sx={{ width: '50%' }} disabled={shiftRotation}>
            <InputLabel>Agent</InputLabel>
            <Select
              value={selectedAgent?.uuid || ''}
              label='Agent'
              onChange={(e) => {
                const ag = agents.find((a) => a.uuid === e.target.value);
                setSelectedAgent(ag);
              }}
            >
              {agents.map((agent) => (
                <MenuItem key={agent.uuid} value={agent.uuid}>
                  {agent.firstname} {agent.lastname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Sélecteur de shiftType (si rotation = false) */}
        <Box sx={{ marginBottom: 4 }}>
          <FormControl sx={{ width: '50%' }} disabled={shiftRotation}>
            <InputLabel>Type de poste</InputLabel>
            <Select
              value={selectedShiftType}
              label='Type de poste'
              onChange={(e) => setSelectedShiftType(e.target.value)}
            >
              <MenuItem value=''>Aucun (pas de type pré-défini)</MenuItem>
              {shiftTypes.map((shift) => (
                <MenuItem key={shift.uuid} value={shift.uuid}>
                  {shift.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Calendrier */}
        <Box sx={{ position: 'relative' }}>
          <Calendar
            localizer={localizer}
            culture='fr'
            messages={messages}
            events={displayEvents}
            startAccessor='start'
            endAccessor='end'
            style={{ height: 500, cursor: 'pointer' }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            dayPropGetter={dayPropGetter}
            onView={(view) => setCurrentView(view)}
            view={currentView}
          />
          {shiftRotation && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(200,200,200,0.5)',
                pointerEvents: 'none',
              }}
            />
          )}
        </Box>

        {/* Popup "Ajout" */}
        <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
          <Box sx={{ padding: 3, width: 300 }}>
            <Typography variant='h6' gutterBottom>
              Définir l’horaire
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label='Heure d’arrivée'
                ampm={false}
                value={arrivalTime}
                onChange={(newValue) => setArrivalTime(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
              <TimePicker
                label='Heure de fin'
                ampm={false}
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
              <TimePicker
                label='Début de pause'
                ampm={false}
                value={breakStartTime}
                onChange={(newValue) => setBreakStartTime(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
              <TimePicker
                label='Fin de pause'
                ampm={false}
                value={endOfBreakTime}
                onChange={(newValue) => setEndOfBreakTime(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
            </LocalizationProvider>

            <Button
              variant='contained'
              color='primary'
              onClick={handleSaveEvent}
              fullWidth
            >
              Enregistrer
            </Button>
          </Box>
        </Dialog>

        {/* Popup "Modification/Suppression" */}
        <Dialog open={openEditPopup} onClose={() => setOpenEditPopup(false)}>
          {editSchedule && (
            <Box sx={{ padding: 3, width: 300 }}>
              <Typography variant='h6' gutterBottom>
                Modifier l’horaire
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label='Heure d’arrivée'
                  ampm={false}
                  value={dayjs(editSchedule.arrivalTime, 'HH:mm')}
                  onChange={(newValue) =>
                    setEditSchedule((prev) => ({
                      ...prev,
                      arrivalTime: newValue.format('HH:mm'),
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth sx={{ mb: 2 }} />
                  )}
                />
                <TimePicker
                  label='Heure de fin'
                  ampm={false}
                  value={dayjs(editSchedule.endTime, 'HH:mm')}
                  onChange={(newValue) =>
                    setEditSchedule((prev) => ({
                      ...prev,
                      endTime: newValue.format('HH:mm'),
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth sx={{ mb: 2 }} />
                  )}
                />
                <TimePicker
                  label='Début de pause'
                  ampm={false}
                  value={dayjs(editSchedule.breakStartTime, 'HH:mm')}
                  onChange={(newValue) =>
                    setEditSchedule((prev) => ({
                      ...prev,
                      breakStartTime: newValue.format('HH:mm'),
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth sx={{ mb: 2 }} />
                  )}
                />
                <TimePicker
                  label='Fin de pause'
                  ampm={false}
                  value={dayjs(editSchedule.breakEndTime, 'HH:mm')}
                  onChange={(newValue) =>
                    setEditSchedule((prev) => ({
                      ...prev,
                      breakEndTime: newValue.format('HH:mm'),
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth sx={{ mb: 2 }} />
                  )}
                />
              </LocalizationProvider>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleUpdateSchedule}
                  fullWidth
                >
                  Mettre à jour
                </Button>
                <Button
                  variant='contained'
                  color='error'
                  onClick={handleDeleteSchedule}
                  fullWidth
                >
                  Supprimer
                </Button>
              </Box>
            </Box>
          )}
        </Dialog>

        {/* Bouton final : seulement si rotation ou shiftType (sans rawSchedules) */}
        <Button
          variant='contained'
          color='primary'
          onClick={handleSubmitSchedules}
          sx={{ marginTop: 4 }}
        >
          Enregistrer le planning
        </Button>
      </Paper>
    </LocalizationProvider>
  );
};

export default AgentSchedule;
