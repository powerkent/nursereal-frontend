import React, { useEffect, useState, useContext } from 'react';
import {
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import axios from '../../../api/axios';
import dayjs from 'dayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';

const EditTreatment = ({ open, onClose, action, onActionUpdated }) => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [childUuid, setChildUuid] = useState('');
  const [treatmentUuid, setTreatmentUuid] = useState('');
  const [comment, setComment] = useState('');
  const [dose, setDose] = useState('');
  const [dosingTime, setDosingTime] = useState(dayjs());
  const [temperature, setTemperature] = useState('');
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
      setTreatmentUuid(action.treatmentUuid);
      setComment(action.comment || '');
      setDose(action.dose || '');
      setDosingTime(action.dosingTime ? dayjs(action.dosingTime) : dayjs());
      setTemperature(action.temperature || '');
    } else {
      setChildUuid('');
      setTreatmentUuid('');
      setComment('');
      setDose('');
      setDosingTime(dayjs());
      setTemperature('');
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
      const treatmentData = {
        childUuid,
        actionType: 'treatment',
        comment,
        treatment: {
          uuid: treatmentUuid,
          dose: dose,
          dosingTime: dosingTime,
          temperature: temperature,
        },
        dateTime: dosingTime,
      };

      if (!agentLoginWithPhone && selectedAgentUuid) {
        treatmentData.agentUuid = selectedAgentUuid;
      }

      const response = await axios.put(
        `/actions/${action.uuid}`,
        treatmentData
      );
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
      <DialogTitle>Modifier l&apos;action - Traitement</DialogTitle>
      <DialogContent>
        <TextField
          label='Dose'
          fullWidth
          margin='normal'
          value={dose}
          onChange={(e) => setDose(e.target.value)}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label='Heure de prise'
            ampm={false}
            value={dosingTime}
            onChange={(newValue) => setDosingTime(newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth sx={{ marginTop: 2 }} />
            )}
          />
        </LocalizationProvider>
        <TextField
          label='Température'
          fullWidth
          margin='normal'
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
        />
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
            <Typography variant='h6'>Sélectionner un agent</Typography>
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
                        src={agent.avatar}
                        alt={`${agent.firstname} ${agent.lastname}`}
                        className='treatment-child-avatar'
                      />
                      <Typography
                        variant='body1'
                        className='treatment-child-name'
                      >
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

export default EditTreatment;
