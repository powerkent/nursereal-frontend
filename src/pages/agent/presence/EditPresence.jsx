// src/components/presence/EditPresence.jsx
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import axios from '../../../api/axios';
import dayjs from 'dayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';

const EditPresence = ({ open, onClose, action, onActionUpdated }) => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [childUuid, setChildUuid] = useState('');
  const [comment, setComment] = useState('');
  const [isAbsent, setIsAbsent] = useState(false);
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
    if (action) {
      setChildUuid(action.childUuid);
      setComment(action.comment || '');
      setIsAbsent(action.isAbsent || false);
      setStartDateTime(dayjs(action.startDateTime));
      setEndDateTime(action.endDateTime ? dayjs(action.endDateTime) : null);
    } else {
      setChildUuid('');
      setComment('');
      setIsAbsent(false);
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
        if (response.data['hydra:member']) {
          setAgents(response.data['hydra:member']);
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
      const presenceData = {
        childUuid,
        actionType: 'presence',
        comment,
        presence: {
          isAbsent: isAbsent,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        },
        dateTime: startDateTime,
      };

      if (!agentLoginWithPhone && selectedAgentUuid) {
        presenceData.agentUuid = selectedAgentUuid;
      }

      const response = await axios.put(`/actions/${action.uuid}`, presenceData);
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
      <DialogTitle>Modifier l&apos;action - Présence</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAbsent}
                onChange={(e) => setIsAbsent(e.target.checked)}
                color='primary'
              />
            }
            label='Absent'
          />
        </Box>
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
        {!agentLoginWithPhone &&
          agents.map((agent) => {
            if (agent.uuid === currentAgentUuid) return null;

            const isSelected = agent.uuid === selectedAgentUuid;

            return (
              <Box
                key={agent.uuid}
                className={`agent-box ${isSelected ? 'agent-selected' : ''}`}
                onClick={() => setSelectedAgentUuid(agent.uuid)}
              >
                <Avatar
                  src={`${agent.avatar}`}
                  alt={`${agent.firstname} ${agent.lastname}`}
                  className='presence-avatar'
                />
                <Typography variant='h6' className='presence-name'>
                  {agent.firstname} {agent.lastname}
                </Typography>
              </Box>
            );
          })}
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

export default EditPresence;
