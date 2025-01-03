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
} from '@mui/material';
import { Opacity, Waves, CheckCircle, AcUnit } from '@mui/icons-material';
import axios from '../../../api/axios';
import dayjs from 'dayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';

const EditDiaper = ({ open, onClose, action, onActionUpdated }) => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [childUuid, setChildUuid] = useState('');
  const [comment, setComment] = useState('');
  const [diaperQuality, setDiaperQuality] = useState('');
  const [startDateTime, setStartDateTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;
  const currentAgentUuid = localStorage.getItem('uuid');

  const diaperQualities = [
    { key: 'liquid', label: 'Liquide', icon: <Opacity fontSize='large' /> },
    { key: 'soft', label: 'Mou', icon: <Waves fontSize='large' /> },
    {
      key: 'correct',
      label: 'Correct',
      icon: <CheckCircle fontSize='large' />,
    },
    { key: 'hard', label: 'Dur', icon: <AcUnit fontSize='large' /> },
  ];

  useEffect(() => {
    if (action) {
      setChildUuid(action.childUuid);
      setComment(action.comment || '');
      setDiaperQuality(action.diaperQuality || '');
      setStartDateTime(dayjs(action.startDateTime));
    } else {
      setChildUuid('');
      setComment('');
      setDiaperQuality('');
      setStartDateTime(null);
    }
  }, [action]);

  const handleDiaperQualityClick = (quality) => {
    setDiaperQuality(quality);
  };

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
      // Construisez l'objet mis à jour
      const diaperData = {
        childUuid,
        actionType: 'diaperData',
        comment,
        diaper: {
          diaperQuality: diaperQuality,
        },
        dateTime: startDateTime,
      };

      if (!agentLoginWithPhone && selectedAgentUuid) {
        diaperData.agentUuid = selectedAgentUuid;
      }

      const response = await axios.put(`/actions/${action.uuid}`, diaperData);
      onActionUpdated(response.data);
      setSuccessMessage('Action mise à jour avec succès !');
      onClose(); // Fermer le dialog après la sauvegarde
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'action :", err);
      setErrorMessage("Impossible de mettre à jour l'action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Modifier l&apos;action - Changement de couche</DialogTitle>
      <DialogContent>
        <Box className='diaper-container'>
          <FormControl fullWidth margin='normal'>
            <Box className='diaper-quality-selection'>
              <Typography variant='h6'>État de la couche</Typography>
              <Box className='diaper-quality-buttons'>
                {diaperQualities.map((quality) => (
                  <Button
                    key={quality.key}
                    variant={
                      diaperQuality === quality.key ? 'contained' : 'outlined'
                    }
                    onClick={() => handleDiaperQualityClick(quality.key)}
                    className='diaper-quality-button'
                  >
                    <Box className='diaper-quality-content'>
                      {quality.icon}
                      <Typography variant='body1'>{quality.label}</Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Box>
          </FormControl>

          <Box className='comment-field' sx={{ marginTop: 2 }}>
            <TextField
              label='Commentaire'
              multiline
              rows={4}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Box>
          <Box className='time-field' sx={{ marginTop: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fr'>
              <DateTimePicker
                label='Heure du change'
                value={startDateTime}
                onChange={(newValue) => setStartDateTime(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin='normal' />
                )}
              />
            </LocalizationProvider>
          </Box>
        </Box>
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

export default EditDiaper;
