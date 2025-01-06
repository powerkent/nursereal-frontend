import React, { useEffect, useState, useContext } from 'react';
import {
  Avatar,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from '../../../api/axios';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';
import './Presence.css';

const formatTime = (dateTime) => dayjs(dateTime).format('HH:mm');

const Presence = () => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);

  const [contractDates, setContractDates] = useState([]);
  const [presentChildren, setPresentChildren] = useState([]);
  const [absentChildren, setAbsentChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [editingChild, setEditingChild] = useState(null);

  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);

  // --- Nouveaux états pour la gestion des agents ---
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState('');

  // Récupération de l'agent actuel / mode de login
  const currentAgentUuid = localStorage.getItem('uuid');
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;

  /* ──────────────────────────────────────────────────────────────────────────
     1) Récupération de contractDates du jour 
  ───────────────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    if (!selectedNurseryUuid) return;

    const fetchContractDates = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/contract_dates?nursery_structure_uuid=${selectedNurseryUuid}&is_today=1`
        );
        setContractDates(res.data['member'] ?? []);
      } catch (error) {
        console.error('Error fetching contract dates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractDates();
  }, [selectedNurseryUuid]);

  /* ──────────────────────────────────────────────────────────────────────────
     2) Récupération des actions (présences) -> enfants présents / absents 
  ───────────────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    if (!selectedNurseryUuid) return;

    const fetchPresenceActions = async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD');
        const res = await axios.get(
          `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=presence&start_date_time=${today} 00:00:00&end_date_time=${today} 23:59:59`
        );
        const actions = res.data['member'] ?? [];
        const present = [];
        const absent = [];

        actions.forEach((a) => {
          const data = {
            childUuid: a.child.uuid,
            avatar: a.child.avatar,
            firstname: a.child.firstname,
            lastname: a.child.lastname,
            startDateTime: a.presence.startDateTime,
            endDateTime: a.presence.endDateTime,
            actionUuid: a.uuid,
          };
          a.presence.isAbsent ? absent.push(data) : present.push(data);
        });

        setPresentChildren(present);
        setAbsentChildren(absent);
        setRefetch(false);
      } catch (error) {
        console.error('Error fetching presence actions:', error);
      }
    };

    fetchPresenceActions();
  }, [selectedNurseryUuid, refetch]);

  /* ──────────────────────────────────────────────────────────────────────────
     3) Récupération des agents (SI agentLoginWithPhone === false) 
  ───────────────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    if (agentLoginWithPhone || !selectedNurseryUuid) return;

    const fetchAgents = async () => {
      try {
        const res = await axios.get(
          `/agents?nursery_structure_uuid=${selectedNurseryUuid}`
        );
        setAgents(res.data['member'] ?? []);
      } catch (error) {
        console.error('Erreur lors de la récupération des agents:', error);
      }
    };

    fetchAgents();
  }, [selectedNurseryUuid, agentLoginWithPhone]);

  /* ──────────────────────────────────────────────────────────────────────────
     4) Sélection d'enfant (click avatar)
  ───────────────────────────────────────────────────────────────────────────*/
  const toggleChildSelection = (childUuid) => {
    setSelectedChildren((prev) =>
      prev.includes(childUuid)
        ? prev.filter((uuid) => uuid !== childUuid)
        : [...prev, childUuid]
    );
  };

  /* ──────────────────────────────────────────────────────────────────────────
     5) Créer les actions (Présent / Absent)
     - Désactivé si aucun agent n'est sélectionné et agentLoginWithPhone = false
  ───────────────────────────────────────────────────────────────────────────*/
  const handleSubmitPresence = async (isAbsent) => {
    try {
      setDialogLoading(true);

      const today = dayjs().format('YYYY-MM-DD');
      await Promise.all(
        selectedChildren.map(async (uuid) => {
          const startDateTimeISO = isAbsent
            ? null
            : dayjs(`${today}T${dayjs().format('HH:mm')}`).toISOString();

          // On choisit l'agentUuid selon le mode
          const agentUuidToUse = agentLoginWithPhone
            ? currentAgentUuid
            : selectedAgentUuid; // => vient du dropdown

          const data = {
            agentUuid: agentUuidToUse,
            childUuid: uuid,
            actionType: 'presence',
            presence: { startDateTime: startDateTimeISO, isAbsent },
          };

          const response = await axios.post('/actions', data, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          const newData = {
            childUuid: uuid,
            avatar: getChild(uuid)?.avatar,
            firstname: getChild(uuid)?.firstname,
            lastname: getChild(uuid)?.lastname,
            startDateTime: response.data.presence.startDateTime,
            endDateTime: response.data.presence.endDateTime,
            actionUuid: response.data.uuid,
          };

          isAbsent
            ? setAbsentChildren((prev) => [...prev, newData])
            : setPresentChildren((prev) => [...prev, newData]);
        })
      );

      setSelectedChildren([]);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la présence :", error);
    } finally {
      setDialogLoading(false);
    }
  };

  /* ──────────────────────────────────────────────────────────────────────────
     6) Retrouver un enfant par UUID (dans contractDates)
  ───────────────────────────────────────────────────────────────────────────*/
  const getChild = (uuid) => contractDates.find((c) => c.childUuid === uuid);

  /* ──────────────────────────────────────────────────────────────────────────
     7) Enfant présent -> Éditer 
  ───────────────────────────────────────────────────────────────────────────*/
  const handleEditChild = (child) => {
    setEditingChild(child);
    setDialogType('editPresent');
    setOpenDialog(true);

    setStartTime(dayjs(child.startDateTime));
    setEndTime(child.endDateTime ? dayjs(child.endDateTime) : dayjs());
  };

  // L'enfant quitte la crèche
  const handleLeaveDaycare = async (child) => {
    try {
      const data = {
        actionType: 'presence',
        presence: {
          startDateTime: dayjs(child.startDateTime).toISOString(),
          endDateTime: dayjs().toISOString(),
          isAbsent: false,
        },
      };
      await axios.put(`/actions/${child.actionUuid}`, data);
      setRefetch(true);
    } catch (error) {
      console.error("Erreur lorsque l'enfant quitte la crèche :", error);
    }
  };

  // Marquer absent un enfant qui était présent
  const handleMarkAbsentFromPresent = async () => {
    if (!editingChild) return;
    try {
      setDialogLoading(true);
      await axios.put(`/actions/${editingChild.actionUuid}`, {
        actionType: 'presence',
        presence: { isAbsent: true },
      });

      // Retrait de la liste présents, ajout à la liste absents
      setPresentChildren((prev) =>
        prev.filter((c) => c.childUuid !== editingChild.childUuid)
      );
      setAbsentChildren((prev) => [...prev, editingChild]);

      closeDialog();
    } catch (error) {
      console.error('Erreur marquer absent:', error);
    } finally {
      setDialogLoading(false);
    }
  };

  // Modifier la plage horaire
  const handleModification = async () => {
    if (!editingChild) return;
    try {
      setDialogLoading(true);
      await axios.put(`/actions/${editingChild.actionUuid}`, {
        actionType: 'presence',
        presence: {
          startDateTime: startTime.toISOString(),
          endDateTime: endTime?.toISOString() || null,
          isAbsent: false,
        },
      });
      setRefetch(true);
      closeDialog();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la présence:', error);
    } finally {
      setDialogLoading(false);
    }
  };

  /* ──────────────────────────────────────────────────────────────────────────
     8) Enfant absent -> présent
  ───────────────────────────────────────────────────────────────────────────*/
  const handleMarkPresentFromAbsent = async (child) => {
    try {
      // On choisit l'agentUuid selon le mode
      const agentUuidToUse = agentLoginWithPhone
        ? currentAgentUuid
        : selectedAgentUuid;

      const startDateTimeISO = dayjs().toISOString();

      const data = {
        actionType: 'presence',
        presence: {
          startDateTime: startDateTimeISO,
          isAbsent: false,
        },
        agentUuid: agentUuidToUse,
      };
      await axios.put(`/actions/${child.actionUuid}`, data);
      setRefetch(true);
    } catch (error) {
      console.error('Erreur marquer présent:', error);
    }
  };

  /* ──────────────────────────────────────────────────────────────────────────
     9) Dialog : fermer / nettoyer
  ───────────────────────────────────────────────────────────────────────────*/
  const closeDialog = () => {
    setOpenDialog(false);
    setEditingChild(null);
    setDialogType(null);
    setEndTime(null);
  };

  /* ──────────────────────────────────────────────────────────────────────────
     10) Préparer l'affichage
  ───────────────────────────────────────────────────────────────────────────*/
  const presentChildrenUuids = new Set(presentChildren.map((c) => c.childUuid));
  const absentChildrenUuids = new Set(absentChildren.map((c) => c.childUuid));

  const remainingChildren = contractDates.filter(
    (c) =>
      !presentChildrenUuids.has(c.childUuid) &&
      !absentChildrenUuids.has(c.childUuid)
  );

  if (loading) {
    return (
      <Box className='loading-box'>
        <CircularProgress />
      </Box>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Désactivation des boutons "Marquer Présent/Absent" si pas d'agent sélectionné
  // quand agentLoginWithPhone === false
  const isAgentSelectedOrPhoneLogin =
    agentLoginWithPhone || (selectedAgentUuid && selectedAgentUuid !== '');

  return (
    <Box className='presence-container'>
      <Typography variant='h5' className='presence-title'>
        Présence d&apos;aujourd&apos;hui
      </Typography>

      {/* Sélection d'agent si agentLoginWithPhone = false */}
      {!agentLoginWithPhone && (
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Agent</InputLabel>
            <Select
              value={selectedAgentUuid}
              label='Agent'
              onChange={(e) => setSelectedAgentUuid(e.target.value)}
            >
              <MenuItem value=''>-- Sélectionnez un agent --</MenuItem>
              {agents.map((agent) => (
                <MenuItem key={agent.uuid} value={agent.uuid}>
                  {agent.firstname} {agent.lastname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {remainingChildren.length === 0 ? (
        <Typography variant='body1' className='no-data-text'>
          Aucune donnée disponible pour aujourd&apos;hui.
        </Typography>
      ) : (
        <Box className='children-selection'>
          <Box className='presence-list'>
            {remainingChildren.map((child) => {
              const isSelected = selectedChildren.includes(child.childUuid);
              return (
                <Box
                  key={child.childUuid}
                  className={`presence-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleChildSelection(child.childUuid)}
                >
                  <Avatar
                    src={child.avatar}
                    alt={`${child.firstname} ${child.lastname}`}
                    className='presence-avatar'
                  />
                  <Typography variant='h6' className='presence-name'>
                    {child.firstname} {child.lastname}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Box className='buttons-container'>
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleSubmitPresence(false)}
              disabled={
                selectedChildren.length === 0 ||
                dialogLoading ||
                !isAgentSelectedOrPhoneLogin
              }
            >
              {dialogLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Marquer Présent'
              )}
            </Button>
            <Button
              variant='contained'
              sx={{ ml: 2, bgcolor: 'red' }}
              onClick={() => handleSubmitPresence(true)}
              disabled={
                selectedChildren.length === 0 ||
                dialogLoading ||
                !isAgentSelectedOrPhoneLogin
              }
            >
              {dialogLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Marquer Absent'
              )}
            </Button>
          </Box>
        </Box>
      )}

      {/* Enfants présents / absents */}
      <Box className='presence-content'>
        {/* ENFANTS PRÉSENTS */}
        <Box className='present-children'>
          <Typography variant='h6'>Enfants présents</Typography>
          {presentChildren.length === 0 ? (
            <Typography>Aucun enfant présent</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Avatar</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Heure d&apos;arrivée</TableCell>
                    <TableCell>Heure de fin</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {presentChildren.map((child) => (
                    <TableRow key={child.childUuid}>
                      <TableCell>
                        <Avatar
                          src={child.avatar}
                          alt={`${child.firstname} ${child.lastname}`}
                        />
                      </TableCell>
                      <TableCell>
                        {child.firstname} {child.lastname}
                      </TableCell>
                      <TableCell>{formatTime(child.startDateTime)}</TableCell>
                      <TableCell>
                        {child.endDateTime ? formatTime(child.endDateTime) : ''}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditChild(child)}>
                          <Edit />
                        </IconButton>
                        {child.endDateTime === undefined && (
                          <IconButton onClick={() => handleLeaveDaycare(child)}>
                            <LogoutIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* ENFANTS ABSENTS */}
        <Box className='absent-children'>
          <Typography variant='h6'>Enfants absents</Typography>
          {absentChildren.length === 0 ? (
            <Typography>Aucun enfant absent</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Avatar</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {absentChildren.map((child) => (
                    <TableRow key={child.childUuid}>
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
                        <IconButton
                          onClick={() => handleMarkPresentFromAbsent(child)}
                          disabled={!isAgentSelectedOrPhoneLogin}
                        >
                          <ArrowBackIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* DIALOG : Éditer un enfant présent */}
      <Dialog open={openDialog} onClose={closeDialog}>
        {dialogType === 'editPresent' && (
          <>
            <DialogTitle>Modifier la présence</DialogTitle>
            <DialogContent>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Heure d'arrivée"
                  ampm={false}
                  value={startTime}
                  onChange={(val) => val && setStartTime(val)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <TimePicker
                  label='Heure de fin'
                  ampm={false}
                  value={endTime}
                  onChange={(val) => setEndTime(val)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth sx={{ mt: 2 }} />
                  )}
                />
              </LocalizationProvider>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleModification} disabled={dialogLoading}>
                {dialogLoading ? <CircularProgress size={24} /> : 'Modifier'}
              </Button>
              <Button
                onClick={handleMarkAbsentFromPresent}
                disabled={dialogLoading}
              >
                {dialogLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Marquer absent'
                )}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Presence;
