import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import axios from '../../../api/axios';
import { SelectedNurseryContext } from '../../../contexts/SelectedNurseryContext';

import './ClockingIn.css';

export default function ClockingIn() {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);

  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState('');
  const [clockingData, setClockingData] = useState([]);
  const [isManager, setIsManager] = useState(false);

  // Récupération de la variable agentLoginWithPhone
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;

  // Vérifier le rôle manager
  useEffect(() => {
    const roles = localStorage.getItem('roles') || '[]';
    try {
      const parsedRoles = JSON.parse(roles);
      setIsManager(
        Array.isArray(parsedRoles) && parsedRoles.includes('ROLE_MANAGER')
      );
    } catch {
      setIsManager(roles.includes('ROLE_MANAGER'));
    }
  }, []);

  // Récupérer la liste des agents
  useEffect(() => {
    if (!selectedNurseryUuid) return;

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
  }, [selectedNurseryUuid]);

  // Récupérer les données de pointage
  useEffect(() => {
    if (!selectedNurseryUuid) return;
    reloadClockingData();
  }, [selectedNurseryUuid]);

  const reloadClockingData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
      const res = await axios.get(
        `/clocking_ins?nursery_structure_uuid=${selectedNurseryUuid}&start_date_time=${today}`
      );
      setClockingData(res.data['member'] ?? []);
    } catch (error) {
      console.error('Erreur lors de la récupération du clocking data :', error);
    }
  };

  /**
   * Sélection / Désélection d'un agent
   * Si on reclique sur l'agent déjà sélectionné, on le désélectionne.
   */
  const handleSelectAgent = (agentUuid) => {
    if (selectedAgentUuid === agentUuid) {
      // Déselection
      setSelectedAgentUuid('');
    } else {
      // Sélection
      setSelectedAgentUuid(agentUuid);
    }
  };

  /**
   * Vérifier si l'agent sélectionné a déjà pointé ou pas
   */
  const agentClockingEntry = clockingData.find(
    (entry) => entry.agent.uuid === selectedAgentUuid
  );
  const hasClockedIn = !!agentClockingEntry && !agentClockingEntry.endDateTime;

  /**
   * Pointer (POST)
   */
  const handlePointer = async () => {
    if (!selectedAgentUuid) return;
    try {
      const payload = {
        startDateTime: new Date().toISOString(),
        agentUuid: selectedAgentUuid,
      };
      await axios.post('/clocking_ins', payload);
      reloadClockingData();
    } catch (error) {
      console.error('Erreur lors du pointage :', error);
    }
  };

  /**
   * Dépointer (PUT)
   */
  const handleDepointer = async () => {
    if (!agentClockingEntry?.uuid) return;
    try {
      const payload = {
        startDateTime: agentClockingEntry.startDateTime,
        endDateTime: new Date().toISOString(),
        agentUuid: agentClockingEntry.agent.uuid,
      };
      await axios.put(`/clocking_ins/${agentClockingEntry.uuid}`, payload);
      reloadClockingData();
    } catch (error) {
      console.error('Erreur lors du dépointage :', error);
    }
  };

  /**
   * Éditer (pour manager)
   */
  const handleEditClocking = (uuid) => {
    if (!isManager) return;
    console.log(`Éditer l'entrée clocking_ins avec uuid : ${uuid}`);
    // logiques d'édition (modal, etc.) à implémenter
  };

  // Si l'agent s'est déjà logué avec le téléphone, on n'affiche pas ce composant
  if (agentLoginWithPhone) {
    return (
      <Box className='clocking-in-container' textAlign='center'>
        <Typography variant='h6' sx={{ color: 'gray' }}>
          L&apos;agent s&apos;est déjà logué avec le téléphone. Aucun pointage
          manuel nécessaire.
        </Typography>
      </Box>
    );
  }

  /**
   * Helper pour format d'heure 24h
   */
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <Box className='clocking-in-container'>
      <Typography variant='h5' marginBottom={2} textAlign='center'>
        Pointage des agents
      </Typography>

      {/* Liste d'agents  */}
      <Box className='presence-list'>
        {agents.map((agent) => {
          const isSelected = selectedAgentUuid === agent.uuid;
          return (
            <Box
              key={agent.uuid}
              className={`presence-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectAgent(agent.uuid)}
            >
              <Avatar
                src={agent.avatar}
                alt={`${agent.firstname} ${agent.lastname}`}
                className='presence-avatar'
              />
              <Typography variant='h6' className='presence-name'>
                {agent.firstname} {agent.lastname}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Bouton pointer / dépointer */}
      <Box textAlign='center' marginBottom={4}>
        {/** Si on n'a pas d'agent sélectionné => pas de bouton */}
        {!selectedAgentUuid ? null : !hasClockedIn ? (
          <Button
            variant='contained'
            color='primary'
            onClick={handlePointer}
            sx={{ marginRight: 2, minWidth: 120 }}
          >
            Pointer
          </Button>
        ) : (
          <Button
            variant='contained'
            color='error'
            onClick={handleDepointer}
            sx={{ marginRight: 2, minWidth: 120 }}
          >
            Dépointer
          </Button>
        )}
      </Box>

      {/* Tableau des pointages */}
      <Typography variant='h6' marginBottom={1}>
        Historique du jour
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f2f2f2' }}>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Heure de pointage</TableCell>
              <TableCell>Heure de dépointage</TableCell>
              {isManager && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {clockingData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isManager ? 4 : 3} align='center'>
                  Aucun pointage pour aujourd&apos;hui.
                </TableCell>
              </TableRow>
            ) : (
              clockingData.map((entry) => (
                <TableRow key={entry.uuid}>
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      {entry.agent?.avatar ? (
                        <Avatar
                          src={entry.agent.avatar}
                          alt='avatar'
                          sx={{ width: 24, height: 24, marginRight: 1 }}
                        />
                      ) : (
                        <Avatar sx={{ width: 24, height: 24, marginRight: 1 }}>
                          ?
                        </Avatar>
                      )}
                      <Typography>
                        {entry.agent?.firstname} {entry.agent?.lastname}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatTime(entry.startDateTime)}</TableCell>
                  <TableCell>
                    {entry.endDateTime ? formatTime(entry.endDateTime) : ''}
                  </TableCell>
                  {isManager && (
                    <TableCell>
                      <IconButton
                        onClick={() => handleEditClocking(entry.uuid)}
                        size='small'
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
