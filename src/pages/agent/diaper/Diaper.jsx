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
} from '@mui/material';
import axios from '../../../api/axios';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';
import dayjs from 'dayjs';
import { Opacity, Waves, CheckCircle, AcUnit } from '@mui/icons-material'; // Import des icônes
import './Diaper.css';

const Diaper = () => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [presentChildren, setPresentChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [diaperQuality, setDiaperQuality] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);

  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;
  const currentAgentUuid = localStorage.getItem('uuid');

  useEffect(() => {
    const fetchPresentChildren = async () => {
      if (!selectedNurseryUuid) return;
      setLoading(true);
      try {
        const todayDate = dayjs().format('YYYY-MM-DD');
        const response = await axios.get(
          `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=presence&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59`
        );
        if (response.data['member']) {
          const actions = response.data['member'];
          const presentChildrenData = actions
            .filter((action) => !action.presence.isAbsent)
            .map((action) => ({
              childUuid: action.child.uuid,
              avatar: action.child.avatar,
              firstname: action.child.firstname,
              lastname: action.child.lastname,
            }));
          setPresentChildren(presentChildrenData);
        }
      } catch (error) {
        console.error('Error fetching present children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresentChildren();
  }, [selectedNurseryUuid]);

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

  const handleChildClick = (childUuid) => {
    setSelectedChildren((prevSelected) => {
      if (prevSelected.includes(childUuid)) {
        return prevSelected.filter((uuid) => uuid !== childUuid);
      }
      return [...prevSelected, childUuid];
    });
  };

  const handleDiaperQualityClick = (quality) => {
    setDiaperQuality(quality);
  };

  const handleSubmit = async () => {
    if (!diaperQuality || selectedChildren.length === 0) {
      alert(
        'Veuillez sélectionner au moins un enfant et une qualité de couche.'
      );
      return;
    }

    if (!agentLoginWithPhone && !selectedAgentUuid) {
      alert('Veuillez sélectionner un agent.');
      return;
    }

    setLoading(true);
    try {
      const promises = selectedChildren.map((childUuid) => {
        const diaperData = {
          childUuid,
          actionType: 'diaper',
          comment,
          diaper: {
            diaperQuality: diaperQuality,
          },
        };

        if (!agentLoginWithPhone && selectedAgentUuid) {
          diaperData.agentUuid = selectedAgentUuid;
        }

        return axios.post('/actions', diaperData);
      });
      await Promise.all(promises);

      setSelectedChildren([]);
      setDiaperQuality('');
      setComment('');
      setSelectedAgentUuid(null);

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 6000);
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
      setErrorMessage("Une erreur s'est produite lors de l'envoi des données.");
      setTimeout(() => {
        setErrorMessage('');
      }, 6000);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Box className='loading-box'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className='diaper-container'>
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessMessage(false)}
          severity='success'
          variant='filled'
        >
          Les données ont été enregistrées avec succès.
        </Alert>
      </Snackbar>

      {errorMessage && (
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setErrorMessage('')}
            severity='error'
            variant='filled'
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      )}

      <Typography variant='h5' className='diaper-title'>
        Suivi des changes
      </Typography>

      <Box className='children-selection'>
        <Typography variant='h6'>Enfants présents</Typography>
        <Box className='children-list'>
          {presentChildren.length === 0 ? (
            <Typography>Aucun enfant présent</Typography>
          ) : (
            presentChildren.map((child) => (
              <Box
                key={child.childUuid}
                className={`child-item ${
                  selectedChildren.includes(child.childUuid) ? 'selected' : ''
                }`}
                onClick={() => handleChildClick(child.childUuid)}
              >
                <Avatar
                  src={`${child.avatar}`}
                  alt={`${child.firstname} ${child.lastname}`}
                  className='child-avatar'
                />
                <Typography variant='body1' className='child-name'>
                  {child.firstname} {child.lastname}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box className='diaper-quality-selection'>
        <Typography variant='h6'>État de la couche</Typography>
        <Box className='diaper-quality-buttons'>
          {diaperQualities.map((quality) => (
            <Button
              key={quality.key}
              variant={diaperQuality === quality.key ? 'contained' : 'outlined'}
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

      <Box className='comment-field'>
        <TextField
          label='Commentaire'
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
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

      <Box className='submit-button'>
        <Button
          variant='contained'
          color='primary'
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Soumettre'}
        </Button>
      </Box>
    </Box>
  );
};

export default Diaper;
