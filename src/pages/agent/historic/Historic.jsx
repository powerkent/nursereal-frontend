import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from '../../../api/axios';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';
import { Delete } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import qs from 'qs';
import './Historic.css';
import EditCare from '../care/EditCare';
import EditDiaper from '../diaper/EditDiaper';
import EditPresence from '../presence/EditPresence';
import EditRest from '../rest/EditRest';
import EditActivity from '../activity/EditActivity';
import EditTreatment from '../treatment/EditTreatment';

const Historic = () => {
  dayjs.extend(customParseFormat);
  dayjs.locale('fr');

  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);

  // ===============================
  // States pour le dialog
  // ===============================
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState(''); // Nouvel état pour le type d'action

  // ===============================
  // States pour le tableau
  // ===============================
  const [actions, setActions] = useState([]); // Liste globale d'actions
  const [displayedActions, setDisplayedActions] = useState([]);
  // Liste des actions actuellement affichées (pour pagination infinie)

  // Indique la page ou offset actuel pour la pagination
  const [page, setPage] = useState(1);
  const pageSize = 20; // nombre d'éléments par "page" ou batch

  // Pour savoir si on est en train de charger (scroll infini)
  const [loading, setLoading] = useState(false);

  // ===============================
  // States pour les filtres
  // ===============================
  const [childrenList, setChildrenList] = useState([]); // Liste des enfants disponibles
  const [selectedChildren, setSelectedChildren] = useState([]); // multi-sélection

  const [actionTypes, setActionTypes] = useState([]); // Liste des types d'action disponibles
  const [selectedTypes, setSelectedTypes] = useState([]); // multi-sélection

  const [agents, setAgents] = useState([]); // Liste des agents (début)
  const [selectedAgents, setSelectedAgents] = useState([]); // multi-sélection

  const [startDateTime, setStartDateTime] = useState(dayjs());
  const [endDateTime, setEndDateTime] = useState(null);

  // ===============================
  // States pour le tri
  // ===============================
  // On stocke pour chaque colonne la direction : 'asc', 'desc' ou null
  const [sortConfig, setSortConfig] = useState({
    child: null,
    type: null,
    startDateTime: null,
    endDateTime: null,
    agent: null,
  });

  // ===============================
  // States pour notifications
  // ===============================
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ===============================
  // Dictionnaires de Mappage
  // ===============================
  const childrenDict = useMemo(() => {
    const dict = {};
    childrenList.forEach((ch) => {
      dict[ch.uuid] = `${ch.firstname} ${ch.lastname}`;
    });
    return dict;
  }, [childrenList]);

  const agentsDict = useMemo(() => {
    const dict = {};
    agents.forEach((ag) => {
      dict[ag.uuid] = `${ag.firstname} ${ag.lastname}`;
    });
    return dict;
  }, [agents]);

  const findProperty = (obj, propName) => {
    if (obj == null || typeof obj !== 'object') return null;
    if (Object.prototype.hasOwnProperty.call(obj, propName))
      return obj[propName];

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const result = findProperty(obj[key], propName);
        if (result !== null) return result;
      }
    }

    return null;
  };

  // ===============================
  // Récupération initiale
  // ===============================
  useEffect(() => {
    if (!selectedNurseryUuid) return;
    fetchFiltersData(selectedNurseryUuid);
    fetchActionsData();
  }, [selectedNurseryUuid]);

  const fetchFiltersData = async (selectedNurseryUuid) => {
    try {
      const childrenResp = await axios.get(
        `/children?nursery_structure_uuid=${selectedNurseryUuid}`
      );
      const agentsResp = await axios.get(
        `/agents?nursery_structure_uuid=${selectedNurseryUuid}`
      );
      const actionTypesResp = await axios.get('/action_types');

      setChildrenList(childrenResp.data['member'] || []);
      setAgents(agentsResp.data['member'] || []);

      setActionTypes(
        actionTypesResp.data['member'].flatMap((item) =>
          Object.keys(item.actionTypes)
        )
      );
    } catch (err) {
      console.error('Erreur récupération filtres:', err);
      setErrorMessage('Impossible de récupérer les filtres.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const fetchActionsData = async () => {
    try {
      setLoading(true);
      const query = qs.stringify(
        {
          nursery_structures: selectedNurseryUuid
            ? [selectedNurseryUuid]
            : undefined,
          children: selectedChildren.length > 0 ? selectedChildren : undefined,
          actions: selectedTypes.length > 0 ? selectedTypes : undefined,
          agents: selectedAgents.length > 0 ? selectedAgents : undefined,
          start_date_time: startDateTime
            ? `${dayjs(startDateTime).format('YYYY-MM-DD')} 00:00:00`
            : undefined,
          end_date_time: endDateTime
            ? `${dayjs(endDateTime).format('YYYY-MM-DD')} 23:59:59`
            : undefined,
        },
        { arrayFormat: 'brackets', skipNulls: true }
      );

      let url = `/actions?${query}`;
      const actionsResp = await axios.get(url);

      const mappedActions = actionsResp.data['member'].map((action) => ({
        uuid: action.uuid,
        childAvatar: action.child?.avatar || '',
        childFirstname: action.child?.firstname || '',
        childLastname: action.child?.lastname || '',
        startDateTime:
          findProperty(action, 'startDateTime') ||
          findProperty(action, 'updatedAt') ||
          findProperty(action, 'createdAt') ||
          null,
        endDateTime: findProperty(action, 'endDateTime') || null,
        agentBeginAvatar: action.agent?.avatar || '',
        agentBeginFirstname: action.agent?.firstname || '',
        agentBeginLastname: action.agent?.lastname || '',
        agentEndAvatar: findProperty(action, 'completedAgent')?.avatar || '',
        agentEndFirstname:
          findProperty(action, 'completedAgent')?.firstname || '',
        agentEndLastname:
          findProperty(action, 'completedAgent')?.lastname || '',
        actionType: action.actionType || '',
        comment: action.comment || '',
        // Assurez-vous que les données spécifiques à chaque action sont bien mappées
        ...mapSpecificActionFields(action),
      }));

      setActions(mappedActions);
      // On initialise l'affichage (page=1)
      setPage(1);
      setDisplayedActions(mappedActions.slice(0, pageSize));
    } catch (err) {
      console.error('Erreur récupération actions:', err);
      setErrorMessage('Impossible de récupérer les actions.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  function truncateString(str, maxLength) {
    if (!str) return '';
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength) + '...';
  }

  const mapSpecificActionFields = (action) => {
    switch (action.actionType) {
      case 'care':
        return {
          careTypes: action.care.careTypes,
        };
      case 'diaper':
        return {
          diaperQuality: action.diaper.diaperQuality || '',
        };
      case 'activity':
        return {
          activityUuid: action.activity.uuid || '',
        };
      case 'presence':
        return {
          isAbsent: action.presence.isAbsent || false,
        };
      case 'treatment':
        return {
          treatmentUuid: action.treatment.uuid || '',
          dose: action.treatment.dose || '',
          dosingTime: action.treatment.dosingTime || '',
          temperature: action.treatment.temperature || '',
        };
      default:
        return {};
    }
  };

  // ===============================
  // Gestion du scroll infini
  // ===============================
  const containerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      // Condition: si on est proche du bas
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
        // Charger la page suivante
        loadMoreData();
      }
    };

    const currentRef = containerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', onScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', onScroll);
      }
    };
  }, [displayedActions, loading]);

  const loadMoreData = () => {
    // On a page, pageSize, actions (toutes)
    const newPage = page + 1;
    const startIndex = (newPage - 1) * pageSize;
    const endIndex = newPage * pageSize;

    if (startIndex >= actions.length) return;

    setLoading(true);
    setTimeout(() => {
      // on simule un petit délai
      const newItems = actions.slice(startIndex, endIndex);
      setDisplayedActions((prev) => [...prev, ...newItems]);
      setPage(newPage);
      setLoading(false);
    }, 1000);
  };

  // ===============================
  // Gestion des filtres
  // ===============================
  const handleChildrenChange = (event) => {
    const { value } = event.target;
    setSelectedChildren(typeof value === 'string' ? value.split(',') : value);
  };

  const handleTypeChange = (event) => {
    const { value } = event.target;
    setSelectedTypes(typeof value === 'string' ? value.split(',') : value);
  };

  const handleAgentsChange = (event) => {
    const { value } = event.target;
    setSelectedAgents(typeof value === 'string' ? value.split(',') : value);
  };

  const handleStartDateChange = (newValue) => {
    setStartDateTime(newValue);
    if (!newValue) {
      // reset endDate si startDate est cleared
      setEndDateTime(null);
    }
  };

  const handleEndDateChange = (newValue) => {
    if (!startDateTime && newValue) {
      alert('Veuillez choisir une date de début avant la date de fin.');
      return;
    }
    setEndDateTime(newValue);
  };

  const handleApplyFilters = () => {
    setPage(1);
    setDisplayedActions([]);
    fetchActionsData();
  };

  // ===============================
  // Gestion du tri
  // ===============================
  const handleSort = (columnKey) => {
    // cycle = null -> 'asc' -> 'desc' -> null
    const currentDir = sortConfig[columnKey];
    let nextDir = null;
    if (currentDir === null) nextDir = 'asc';
    else if (currentDir === 'asc') nextDir = 'desc';
    else if (currentDir === 'desc') nextDir = null;

    setSortConfig((prev) => ({
      ...prev,
      [columnKey]: nextDir,
    }));

    // tri local (optionnel) :
    if (nextDir) {
      const sorted = [...displayedActions].sort((a, b) => {
        let valA = '';
        let valB = '';
        switch (columnKey) {
          case 'child':
            valA = (a.childFirstname + a.childLastname).toLowerCase();
            valB = (b.childFirstname + b.childLastname).toLowerCase();
            break;
          case 'type':
            valA = a.actionType.toLowerCase();
            valB = b.actionType.toLowerCase();
            break;
          case 'startDateTime':
            valA = a.startDateTime || '';
            valB = b.startDateTime || '';
            break;
          case 'endDateTime':
            valA = a.endDateTime || '';
            valB = b.endDateTime || '';
            break;
          case 'agentBegin':
            valA = (a.agentBeginFirstname + a.agentBeginLastname).toLowerCase();
            valB = (b.agentBeginFirstname + b.agentBeginLastname).toLowerCase();
            break;
          case 'agentEnd':
            valA = (a.agentEndFirstname + a.agentEndLastname).toLowerCase();
            valB = (b.agentEndFirstname + b.agentEndLastname).toLowerCase();
            break;
          default:
            break;
        }
        if (valA < valB) return nextDir === 'asc' ? -1 : 1;
        if (valA > valB) return nextDir === 'asc' ? 1 : -1;
        return 0;
      });
      setDisplayedActions(sorted);
    } else {
      // re-fetch ou reset
      // On peut re-lire la liste de base
      setDisplayedActions(actions.slice(0, page * pageSize));
    }
  };

  // ===============================
  // Gestion de la suppression
  // ===============================
  const handleDeleteAction = async (actionItem) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
      return;
    }

    try {
      await axios.delete(`/actions/${actionItem.uuid}`);

      setActions((prevActions) =>
        prevActions.filter((action) => action.uuid !== actionItem.uuid)
      );

      setDisplayedActions((prevDisplayed) =>
        prevDisplayed.filter((action) => action.uuid !== actionItem.uuid)
      );

      setSuccessMessage('Action supprimée avec succès !');
    } catch (err) {
      console.error("Erreur lors de la suppression de l'action :", err);
      setErrorMessage("Impossible de supprimer l'action.");
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // ===============================
  // Gestion de la modification
  // ===============================
  const handleEditClick = (action) => {
    console.log('Action sélectionnée pour édition:', action);
    setSelectedAction(action);
    setSelectedActionType(action.actionType); // Définir le type d'action sélectionné
    setDialogOpen(true);
  };

  const handleActionUpdated = () => {
    fetchActionsData();
  };

  // ===============================
  // Rendu
  // ===============================
  return (
    <Box className='historic-container'>
      {/* Notifications */}
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
      <Typography
        variant='h6'
        className='historic-title'
        sx={{ mb: 2, mt: -5 }}
      >
        Historique des actions
      </Typography>
      {/* Filtres */}
      <Box className='filters-container'>
        {/* Enfant (multi) */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Enfant</InputLabel>
          <Select
            multiple
            value={selectedChildren}
            onChange={handleChildrenChange}
            input={<OutlinedInput label='Enfant' />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((uuid) => (
                  <Chip key={uuid} label={childrenDict[uuid] || uuid} />
                ))}
              </Box>
            )}
          >
            {childrenList.map((ch) => (
              <MenuItem key={ch.uuid} value={ch.uuid}>
                {ch.firstname} {ch.lastname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Type (multi) */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Type d&apos;action</InputLabel>
          <Select
            multiple
            value={selectedTypes}
            onChange={handleTypeChange}
            input={<OutlinedInput label="Type d'action" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip
                    key={val}
                    label={val.charAt(0).toUpperCase() + val.slice(1)}
                  />
                ))}
              </Box>
            )}
          >
            {actionTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Agent début (multi) */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Agent</InputLabel>
          <Select
            multiple
            value={selectedAgents}
            onChange={handleAgentsChange}
            input={<OutlinedInput label='Agent' />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((uuid) => (
                  <Chip key={uuid} label={agentsDict[uuid] || uuid} />
                ))}
              </Box>
            )}
          >
            {agents.map((ag) => (
              <MenuItem key={ag.uuid} value={ag.uuid}>
                {ag.firstname} {ag.lastname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date début + date fin */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fr'>
          <DatePicker
            label='Date début'
            value={startDateTime}
            onChange={(newValue) => handleStartDateChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} sx={{ minWidth: 220 }} />
            )}
            inputFormat='DD/MM/YYYY'
          />
          <DatePicker
            label='Date fin'
            value={endDateTime}
            onChange={(newValue) => handleEndDateChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} sx={{ minWidth: 220 }} />
            )}
            inputFormat='DD/MM/YYYY'
          />
        </LocalizationProvider>

        <Button
          variant='contained'
          color='primary'
          onClick={handleApplyFilters}
          sx={{ height: 56 }}
        >
          Appliquer
        </Button>
      </Box>
      {/* Tableau (scrollable) */}
      <Box
        className='historic-table-container'
        ref={containerRef}
        sx={{
          maxHeight: '500px',
          overflowY: 'auto',
          marginTop: 2,
          border: '1px solid #ccc',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {/* Enfant */}
              <TableCell
                onClick={() => handleSort('child')}
                sx={{ cursor: 'pointer' }}
              >
                Enfant
                {sortConfig.child === 'asc' && ' ▲'}
                {sortConfig.child === 'desc' && ' ▼'}
              </TableCell>

              {/* Type */}
              <TableCell
                onClick={() => handleSort('type')}
                sx={{ cursor: 'pointer' }}
              >
                Type
                {sortConfig.type === 'asc' && ' ▲'}
                {sortConfig.type === 'desc' && ' ▼'}
              </TableCell>

              {/* Heure début */}
              <TableCell
                onClick={() => handleSort('startDateTime')}
                sx={{ cursor: 'pointer' }}
              >
                Heure de début
                {sortConfig.startDateTime === 'asc' && ' ▲'}
                {sortConfig.startDateTime === 'desc' && ' ▼'}
              </TableCell>

              {/* Heure fin */}
              <TableCell
                onClick={() => handleSort('endDateTime')}
                sx={{ cursor: 'pointer' }}
              >
                Heure de fin
                {sortConfig.endDateTime === 'asc' && ' ▲'}
                {sortConfig.endDateTime === 'desc' && ' ▼'}
              </TableCell>

              {/* Agent début */}
              <TableCell
                onClick={() => handleSort('agent')}
                sx={{ cursor: 'pointer' }}
              >
                Agent de début
                {sortConfig.agentBegin === 'asc' && ' ▲'}
                {sortConfig.agentBegin === 'desc' && ' ▼'}
              </TableCell>

              {/* Agent fin */}
              <TableCell
                onClick={() => handleSort('agentEnd')}
                sx={{ cursor: 'pointer' }}
              >
                Agent de fin
                {sortConfig.agentEnd === 'asc' && ' ▲'}
                {sortConfig.agentEnd === 'desc' && ' ▼'}
              </TableCell>

              {/* Comment */}
              <TableCell>Commentaire</TableCell>

              {/* Actions */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedActions.map((item) => (
              <TableRow
                key={item.uuid}
                hover
                onClick={() => handleEditClick(item)}
                sx={{ cursor: 'pointer' }}
              >
                {/* Enfant */}
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={item.childAvatar || ''}
                      alt={
                        (item.childFirstname || '') +
                        ' ' +
                        (item.childLastname || '')
                      }
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography variant='body2'>
                      {item.childFirstname} {item.childLastname}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Type */}
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  {item.actionType.charAt(0).toUpperCase() +
                    item.actionType.slice(1)}
                </TableCell>

                {/* Heure debut */}
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  {item.startDateTime
                    ? dayjs(item.startDateTime).format('DD/MM/YYYY HH:mm')
                    : ''}
                </TableCell>

                {/* Heure fin */}
                <TableCell
                  sx={{
                    backgroundImage: item.endDateTime
                      ? 'none'
                      : 'repeating-linear-gradient(45deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.1) 10px, transparent 10px, transparent 20px)',
                    backgroundColor: item.endDateTime ? 'inherit' : '#f8f8f8',
                    border: '1px solid #ccc',
                  }}
                >
                  {item.endDateTime
                    ? dayjs(item.endDateTime).format('DD/MM/YYYY HH:mm')
                    : ''}
                </TableCell>

                {/* Agent début */}
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={item.agentBeginAvatar || ''}
                      alt={
                        (item.agentBeginFirstname || '') +
                        ' ' +
                        (item.agentBeginLastname || '')
                      }
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography variant='body2'>
                      {item.agentBeginFirstname} {item.agentBeginLastname}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Agent fin */}
                <TableCell
                  sx={{
                    backgroundImage: item.agentEndFirstname
                      ? 'none'
                      : 'repeating-linear-gradient(45deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.1) 10px, transparent 10px, transparent 20px)',
                    backgroundColor: item.agentEndFirstname
                      ? 'inherit'
                      : '#f8f8f8',
                    border: '1px solid #ccc',
                  }}
                >
                  {item.agentEndFirstname && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={item.agentEndAvatar || ''}
                        alt={
                          (item.agentEndFirstname || '') +
                          ' ' +
                          (item.agentEndLastname || '')
                        }
                        sx={{ width: 32, height: 32 }}
                      />
                      <Typography variant='body2'>
                        {item.agentEndFirstname} {item.agentEndLastname}
                      </Typography>
                    </Box>
                  )}
                </TableCell>

                {/* Commentaire */}
                <TableCell
                  sx={{
                    backgroundImage: item.comment
                      ? 'none'
                      : 'repeating-linear-gradient(45deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.1) 10px, transparent 10px, transparent 20px)',
                    backgroundColor: item.comment ? 'inherit' : '#f8f8f8',
                    border: '1px solid #ccc',
                  }}
                >
                  {truncateString(item.comment, 25)}
                </TableCell>

                {/* Actions */}
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche le clic de déclencher onClick du TableRow
                      handleDeleteAction(item);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {displayedActions.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  <Typography>Aucune action trouvée.</Typography>
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Composants EditCare, EditDiaper, EditPresence, EditRest, EditActivity, EditTreatment en dehors de la boucle */}
      {selectedAction && selectedActionType === 'care' && (
        <EditCare
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          action={selectedAction}
          onActionUpdated={handleActionUpdated}
        />
      )}
      {selectedAction && selectedActionType === 'diaper' && (
        <EditDiaper
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          action={selectedAction}
          onActionUpdated={handleActionUpdated}
        />
      )}
      {selectedAction && selectedActionType === 'presence' && (
        <EditPresence
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          action={selectedAction}
          onActionUpdated={handleActionUpdated}
        />
      )}
      {selectedAction && selectedActionType === 'rest' && (
        <EditRest
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          action={selectedAction}
          onActionUpdated={handleActionUpdated}
        />
      )}
      {selectedAction && selectedActionType === 'activity' && (
        <EditActivity
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          action={selectedAction}
          onActionUpdated={handleActionUpdated}
        />
      )}
      {selectedAction && selectedActionType === 'treatment' && (
        <EditTreatment
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          action={selectedAction}
          onActionUpdated={handleActionUpdated}
        />
      )}
    </Box>
  );
};

export default Historic;
