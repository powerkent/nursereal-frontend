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
} from '@mui/material';
import axios from '../../../api/axios';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';
import { Visibility, Healing, Face, Hearing } from '@mui/icons-material';
import dayjs from 'dayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const EditCare = ({ open, onClose, action, onActionUpdated }) => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [childUuid, setChildUuid] = useState('');
  const [comment, setComment] = useState('');
  const [selectedCareTypes, setSelectedCareTypes] = useState([]);
  const [startDateTime, setStartDateTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;
  const currentAgentUuid = localStorage.getItem('uuid');

  const careTypes = [
    { key: 'eye_care', label: 'Yeux', icon: <Visibility fontSize='large' /> },
    { key: 'nose_care', label: 'Nez', icon: <Healing fontSize='large' /> },
    { key: 'mouth_care', label: 'Bouche', icon: <Face fontSize='large' /> },
    { key: 'ear_care', label: 'Oreilles', icon: <Hearing fontSize='large' /> },
  ];

  useEffect(() => {
    if (action) {
      setComment(action.comment || '');
      const careTypesFromAction = Array.isArray(action.careTypes)
        ? action.careTypes
        : [];
      setSelectedCareTypes(careTypesFromAction);
      setStartDateTime(dayjs(action.startDateTime));
      setChildUuid(action.childUuid);
    }
  }, [action]);

  const handleCareTypeClick = (careType) => {
    setSelectedCareTypes((prevSelected) => {
      if (Array.isArray(prevSelected)) {
        if (prevSelected.includes(careType)) {
          return prevSelected.filter((type) => type !== careType);
        }
        return [...prevSelected, careType];
      } else {
        console.warn("prevSelected n'est pas un tableau :", prevSelected);
        return [careType];
      }
    });
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
      const careData = {
        childUuid,
        actionType: 'care',
        comment,
        care: {
          careTypes: selectedCareTypes,
        },
        dateTime: startDateTime,
      };

      if (!agentLoginWithPhone && selectedAgentUuid) {
        careData.agentUuid = selectedAgentUuid;
      }

      const response = await axios.put(`/actions/${action.uuid}`, careData);
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
      <DialogTitle>Modifier l&apos;action</DialogTitle>
      <DialogContent>
        <Box className='care-container'>
          <Box className='care-type-selection'>
            <Typography variant='h6'>Types de soin</Typography>
            <Box className='care-type-buttons'>
              {careTypes.map((type) => (
                <Button
                  key={type.key}
                  variant={
                    Array.isArray(selectedCareTypes) &&
                    selectedCareTypes.includes(type.key)
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() => handleCareTypeClick(type.key)}
                  className='care-type-button'
                >
                  <Box
                    className='care-type-content'
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    {type.icon}
                    <Typography variant='body1'>{type.label}</Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          </Box>

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
                label='Heure du soin'
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

export default EditCare;
