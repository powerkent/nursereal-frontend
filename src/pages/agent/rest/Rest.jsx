import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from '../../../api/axios';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import './Rest.css';

const Rest = () => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [presentChildren, setPresentChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [restingChildren, setRestingChildren] = useState([]);
  const [selectedRestingRows, setSelectedRestingRows] = useState([]);
  const [openRestDialog, setOpenRestDialog] = useState(false);
  const [restTime, setRestTime] = useState(dayjs());
  const [openWakeUpDialog, setOpenWakeUpDialog] = useState(false);
  const [wakeUpTime, setWakeUpTime] = useState(dayjs());
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);
  const [selectedWakeAgentUuid, setSelectedWakeAgentUuid] = useState(null);
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;
  const currentAgentUuid = localStorage.getItem('uuid');
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPresentChildren = async () => {
      if (!selectedNurseryUuid) return;
      setLoading(true);
      try {
        const todayDate = dayjs().format('YYYY-MM-DD');
        const response = await axios.get(
          `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=presence&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59`
        );
        if (response.data['hydra:member']) {
          const actions = response.data['hydra:member'];
          const nonAbsentChildren = actions
            .filter((action) => !action.presence.isAbsent)
            .map((action) => ({
              childUuid: action.child.uuid,
              avatar: action.child.avatar,
              firstname: action.child.firstname,
              lastname: action.child.lastname,
            }));
          setPresentChildren(nonAbsentChildren);
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
    const fetchRestingChildren = async () => {
      if (!selectedNurseryUuid) return;
      setLoading(true);
      try {
        const todayDate = dayjs().format('YYYY-MM-DD');
        const response = await axios.get(
          `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=rest&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59&state=action_in_progress`
        );
        if (response.data['hydra:member']) {
          const actions = response.data['hydra:member'];
          const restingData = actions.map((action) => ({
            actionUuid: action.uuid,
            childUuid: action.child.uuid,
            avatar: action.child.avatar,
            firstname: action.child.firstname,
            lastname: action.child.lastname,
            startDateTime: action.rest.startDateTime,
          }));
          setRestingChildren(restingData);
        }
      } catch (error) {
        console.error('Error fetching resting children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestingChildren();
  }, [selectedNurseryUuid]);

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

  const handleChildClick = (childUuid) => {
    setSelectedChildren((prevSelected) => {
      if (prevSelected.includes(childUuid)) {
        return prevSelected.filter((uuid) => uuid !== childUuid);
      }
      return [...prevSelected, childUuid];
    });
  };

  const handleOpenRestDialog = () => {
    if (selectedChildren.length === 0) {
      alert('Veuillez sélectionner au moins un enfant.');
      return;
    }
    if (!agentLoginWithPhone && !selectedAgentUuid) {
      alert('Veuillez sélectionner un agent pour enregistrer le sommeil.');
      return;
    }
    setRestTime(dayjs());
    setOpenRestDialog(true);
  };

  const handleCloseRestDialog = () => {
    setOpenRestDialog(false);
  };

  const handleSubmitRest = async () => {
    setDialogLoading(true);
    try {
      const todayDate = dayjs().format('YYYY-MM-DD');

      const promises = selectedChildren.map((childUuid) => {
        const restData = {
          childUuid,
          actionType: 'rest',
          rest: {
            startDateTime: restTime.toISOString(),
          },
        };

        if (!agentLoginWithPhone && selectedAgentUuid) {
          restData.agentUuid = selectedAgentUuid;
        }
        return axios.post('/actions', restData);
      });

      await Promise.all(promises);

      setSelectedChildren([]);
      setSelectedAgentUuid(null);

      setSuccessMessage('Sommeil enregistré avec succès.');
      setTimeout(() => {
        setSuccessMessage('');
      }, 6000);

      const response = await axios.get(
        `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=rest&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59&state=action_in_progress`
      );
      if (response.data['hydra:member']) {
        const actions = response.data['hydra:member'];
        const restingData = actions.map((action) => ({
          actionUuid: action.uuid,
          childUuid: action.child.uuid,
          avatar: action.child.avatar,
          firstname: action.child.firstname,
          lastname: action.child.lastname,
          startDateTime: action.rest.startDateTime,
        }));
        setRestingChildren(restingData);
      }

      handleCloseRestDialog();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du sommeil :", error);
      setErrorMessage("Une erreur s'est produite lors de l'enregistrement.");
      setTimeout(() => {
        setErrorMessage('');
      }, 6000);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleRestingRowClick = (childUuid) => {
    setSelectedRestingRows((prevSelected) => {
      if (prevSelected.includes(childUuid)) {
        return prevSelected.filter((uuid) => uuid !== childUuid);
      }
      return [...prevSelected, childUuid];
    });
  };

  const handleOpenWakeUpDialog = () => {
    if (selectedRestingRows.length === 0) {
      alert('Veuillez sélectionner au moins un enfant endormi.');
      return;
    }
    if (!agentLoginWithPhone && !selectedWakeAgentUuid) {
      alert('Veuillez sélectionner un agent pour enregistrer le réveil.');
      return;
    }
    setWakeUpTime(dayjs());
    setOpenWakeUpDialog(true);
  };

  const handleCloseWakeUpDialog = () => {
    setOpenWakeUpDialog(false);
  };

  const handleSubmitWakeUp = async () => {
    setDialogLoading(true);
    try {
      const todayDate = dayjs().format('YYYY-MM-DD');
      const promises = selectedRestingRows.map((childUuid) => {
        const childData = restingChildren.find(
          (c) => c.childUuid === childUuid
        );
        if (!childData) return null;

        const wakeUpData = {
          actionType: 'rest',
          rest: {
            startDateTime: childData.startDateTime,
            endDateTime: wakeUpTime.toISOString(),
          },
        };

        if (!agentLoginWithPhone && selectedWakeAgentUuid) {
          wakeUpData.agentUuid = selectedWakeAgentUuid;
        }
        return axios.put(`/actions/${childData.actionUuid}`, wakeUpData);
      });

      await Promise.all(promises);

      setSelectedRestingRows([]);
      setSelectedWakeAgentUuid(null);

      setSuccessMessage('Réveil enregistré avec succès.');
      setTimeout(() => {
        setSuccessMessage('');
      }, 6000);

      const response = await axios.get(
        `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=rest&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59&state=action_in_progress`
      );
      if (response.data['hydra:member']) {
        const actions = response.data['hydra:member'];
        const restingData = actions.map((action) => ({
          actionUuid: action.uuid,
          childUuid: action.child.uuid,
          avatar: action.child.avatar,
          firstname: action.child.firstname,
          lastname: action.child.lastname,
          startDateTime: action.rest.startDateTime,
        }));
        setRestingChildren(restingData);
      } else {
        setRestingChildren([]);
      }

      handleCloseWakeUpDialog();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du réveil :", error);
      setErrorMessage("Une erreur s'est produite lors de l'enregistrement.");
      setTimeout(() => {
        setErrorMessage('');
      }, 6000);
    } finally {
      setDialogLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className='loading-box'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className='rest-container'>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
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

      {errorMessage && (
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
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

      <Typography variant='h5' className='rest-title'>
        Suivi du Sommeil
      </Typography>

      <Box className='children-selection'>
        <Typography variant='h6'>Enfants présents</Typography>
        {presentChildren.length === 0 ? (
          <Typography>Aucun enfant présent</Typography>
        ) : (
          <Box className='rest-children-list'>
            {presentChildren.map((child) => {
              const isSelected = selectedChildren.includes(child.childUuid);
              return (
                <Box
                  key={child.childUuid}
                  className={`rest-child-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleChildClick(child.childUuid)}
                >
                  <Avatar
                    src={child.avatar}
                    alt={`${child.firstname} ${child.lastname}`}
                    className='rest-child-avatar'
                  />
                  <Typography variant='body1' className='rest-child-name'>
                    {child.firstname} {child.lastname}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

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
                        src={agent.avatar}
                        alt={`${agent.firstname} ${agent.lastname}`}
                        className='rest-child-avatar'
                      />
                      <Typography variant='body1' className='rest-child-name'>
                        {agent.firstname} {agent.lastname}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}

        <Box className='rest-button'>
          <Button
            variant='contained'
            color='primary'
            onClick={handleOpenRestDialog}
            disabled={selectedChildren.length === 0}
          >
            Sommeil
          </Button>
        </Box>
      </Box>

      <Box className='resting-list'>
        <Typography variant='h6' sx={{ marginTop: 3 }}>
          Enfants endormis
        </Typography>
        {restingChildren.length === 0 ? (
          <Typography>Aucun enfant endormi</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding='checkbox'></TableCell>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Heure de début</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {restingChildren.map((child) => {
                  const isSelected = selectedRestingRows.includes(
                    child.childUuid
                  );
                  return (
                    <TableRow
                      key={child.childUuid}
                      onClick={() => handleRestingRowClick(child.childUuid)}
                      selected={isSelected}
                    >
                      <TableCell padding='checkbox'>
                        <Checkbox checked={isSelected} />
                      </TableCell>
                      <TableCell>
                        <Avatar
                          src={child.avatar}
                          alt={`${child.firstname} ${child.lastname}`}
                        />
                      </TableCell>
                      <TableCell>
                        {child.firstname} {child.lastname}
                      </TableCell>
                      <TableCell>
                        {dayjs(child.startDateTime).format('HH:mm')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!agentLoginWithPhone && (
          <Box className='agent-selection' sx={{ marginTop: 2 }}>
            <Typography variant='h6'>Sélectionner un agent (réveil)</Typography>
            <Box className='agent-list'>
              {agents
                .filter((agent) => agent.uuid !== currentAgentUuid)
                .map((agent) => {
                  const isSelected = agent.uuid === selectedWakeAgentUuid;
                  return (
                    <Box
                      key={agent.uuid}
                      className={`agent-box ${
                        isSelected ? 'agent-selected' : ''
                      }`}
                      onClick={() => setSelectedWakeAgentUuid(agent.uuid)}
                    >
                      <Avatar
                        src={agent.avatar}
                        alt={`${agent.firstname} ${agent.lastname}`}
                        className='rest-child-avatar'
                      />
                      <Typography variant='body1' className='rest-child-name'>
                        {agent.firstname} {agent.lastname}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}

        <Box className='wake-button'>
          <Button
            variant='contained'
            color='primary'
            onClick={handleOpenWakeUpDialog}
            disabled={selectedRestingRows.length === 0}
            sx={{ marginTop: 2 }}
          >
            Réveil
          </Button>
        </Box>
      </Box>

      <Dialog open={openRestDialog} onClose={handleCloseRestDialog}>
        <DialogTitle>Confirmer le Sommeil</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label='Heure de début'
              value={restTime}
              onChange={(newValue) => setRestTime(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              ampm={false}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestDialog} color='secondary'>
            Annuler
          </Button>
          <Button
            onClick={handleSubmitRest}
            color='primary'
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Soumettre'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWakeUpDialog} onClose={handleCloseWakeUpDialog}>
        <DialogTitle>Confirmer le Réveil</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label='Heure de fin'
              value={wakeUpTime}
              onChange={(newValue) => setWakeUpTime(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              ampm={false}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWakeUpDialog} color='secondary'>
            Annuler
          </Button>
          <Button
            onClick={handleSubmitWakeUp}
            color='primary'
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Soumettre'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rest;
