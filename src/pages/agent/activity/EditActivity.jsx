import React, { useEffect, useState, useContext } from 'react';
import {
  Avatar,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from '../../../api/axios';
import dayjs from 'dayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';

const EditActivity = ({ open, onClose, action, onActionUpdated }) => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [childUuid, setChildUuid] = useState('');
  const [comment, setComment] = useState('');
  const [selectedActivityUuid, setSelectedActivityUuid] = useState([]);
  const [activities, setActivities] = useState([]);
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;
  const currentAgentUuid = localStorage.getItem('uuid');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('/activities');
        if (response.data['member']) {
          setActivities(response.data['member']);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    if (action) {
      setChildUuid(action.childUuid || '');
      setComment(action.comment || '');
      setSelectedActivityUuid(action.activityUuid || '');
      setStartDateTime(dayjs(action.startDateTime));
      setEndDateTime(action.endDateTime ? dayjs(action.endDateTime) : null);
    } else {
      setComment('');
      setSelectedActivityUuid('');
      setStartDateTime(null);
      setEndDateTime(null);
    }
  }, [action]);

  useEffect(() => {
    const getAgents = async () => {
      if (agentLoginWithPhone || !selectedNurseryUuid) return;

      try {
        const response = await axios.get(
          `/agents?nursery_structure_uuid=${selectedNurseryUuid}`
        );
        if (response.data['member']) {
          setAgents(response.data['member']);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    getAgents();
  }, [agentLoginWithPhone, selectedNurseryUuid]);

  const handleSave = async () => {
    if (!action) {
      setErrorMessage('Action non définie.');
      return;
    }
    setLoading(true);
    try {
      const activityData = {
        childUuid,
        actionType: 'activity',
        comment,
        activity: {
          uuid: selectedActivityUuid,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        },
        dateTime: startDateTime,
      };

      if (!agentLoginWithPhone && selectedAgentUuid) {
        activityData.agentUuid = selectedAgentUuid;
      }

      const response = await axios.put(`/actions/${action.uuid}`, activityData);
      onActionUpdated(response.data);
      setSuccessMessage('Action mise à jour avec succès !');
      onClose();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'action :", err);
      setErrorMessage("Impossible de mettre à jour l'action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Modifier l&apos;action - Activité</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin='normal'>
          <InputLabel>Type d&apos;activité</InputLabel>
          <Select
            labelId='activity-select-label'
            id='activity-select'
            value={selectedActivityUuid}
            label='Activité'
            onChange={(e) => setSelectedActivityUuid(e.target.value)}
          >
            {activities.map((activity) => (
              <MenuItem key={activity.uuid} value={activity.uuid}>
                {activity.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fr'>
          <DateTimePicker
            label='Heure de début'
            value={startDateTime}
            onChange={(newValue) => setStartDateTime(newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin='normal' />
            )}
          />
          <DateTimePicker
            label='Heure de fin'
            value={endDateTime}
            onChange={(newValue) => setEndDateTime(newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin='normal' />
            )}
          />
        </LocalizationProvider>
        <TextField
          label='Commentaire'
          multiline
          rows={4}
          fullWidth
          margin='normal'
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {!agentLoginWithPhone && (
          <Box className='agent-selection' sx={{ marginTop: 2 }}>
            <Typography variant='h6'>Sélectionner un agent (début)</Typography>
            <Box className='agent-list'>
              {agents
                .filter((agent) => agent.uuid !== currentAgentUuid)
                .map((agent) => {
                  const isSelected = agent.uuid === selectedAgentUuid;
                  return (
                    <Box
                      key={agent.uuid}
                      className={`agent-box ${
                        isSelected ? 'agent-selected' : ''
                      }`}
                      onClick={() => setSelectedAgentUuid(agent.uuid)}
                    >
                      <Avatar
                        src={`${agent.avatar}`}
                        alt={`${agent.firstname} ${agent.lastname}`}
                        className='child-avatar'
                      />
                      <Typography variant='body1' className='child-name'>
                        {agent.firstname} {agent.lastname}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSave} variant='contained' disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Sauvegarder'}
        </Button>
      </DialogActions>

      {/* Notifications */}
      {successMessage && (
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity='success'
            variant='filled'
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      )}
      {errorMessage && (
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={3000}
          onClose={() => setErrorMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity='error'
            variant='filled'
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
    </Dialog>
  );
};

export default EditActivity;
