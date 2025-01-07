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

  // ----- ÉTATS GLOBAUX -----
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState('');
  const [clockingData, setClockingData] = useState([]);
  const [isManager, setIsManager] = useState(false);

  // Coordonnées de la nursery et vérification de la proximité
  const [nurseryCoordinates, setNurseryCoordinates] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);

  // Cette variable indique si l'agent s'est logué via son téléphone
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem('AGENT_LOGIN_WITH_PHONE')) ?? false;

  // ----- USE EFFECT : Vérification du rôle manager -----
  useEffect(() => {
    const roles = localStorage.getItem('roles') || '[]';
    try {
      const parsedRoles = JSON.parse(roles);
      setIsManager(
        Array.isArray(parsedRoles) && parsedRoles.includes('ROLE_MANAGER')
      );
    } catch {
      // Fallback si `roles` n'est pas un JSON valide
      setIsManager(roles.includes('ROLE_MANAGER'));
    }
  }, []);

  // ----- USE EFFECT : Charger la nursery sélectionnée (coordonnées GPS) -----
  useEffect(() => {
    if (!selectedNurseryUuid) return;
    const fetchNurseryCoordinates = async () => {
      try {
        const res = await axios.get(
          `/nursery_structures/${selectedNurseryUuid}`
        );
        const latitude = res.data['latitude'];
        const longitude = res.data['longitude'];
        setNurseryCoordinates({ latitude, longitude });
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des coordonnées de la nursery :',
          error
        );
      }
    };
    fetchNurseryCoordinates();
  }, [selectedNurseryUuid]);

  // ----- USE EFFECT : Charger les agents S'IL N'Y A PAS agentLoginWithPhone -----
  useEffect(() => {
    if (!selectedNurseryUuid) return;
    // Si c'est un agent qui s'est logué avec le téléphone,
    // on NE charge pas toute la liste des agents.
    if (agentLoginWithPhone) {
      return;
    }

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

  // ----- USE EFFECT : Charger l'historique de pointage du jour -----
  useEffect(() => {
    if (!selectedNurseryUuid) return;
    reloadClockingData();
  }, [selectedNurseryUuid]);

  const reloadClockingData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // format yyyy-mm-dd
      const res = await axios.get(
        `/clocking_ins?nursery_structures[]=${selectedNurseryUuid}&start_date_time=${today}`
      );
      setClockingData(res.data['member'] ?? []);
    } catch (error) {
      console.error('Erreur lors de la récupération du clocking data :', error);
    }
  };

  // ----- Sélection / Désélection d'un agent (mode manager ou agent sur PC) -----
  const handleSelectAgent = (agentUuid) => {
    if (selectedAgentUuid === agentUuid) {
      // Déselection
      setSelectedAgentUuid('');
    } else {
      // Sélection
      setSelectedAgentUuid(agentUuid);
    }
  };

  // ----- Rechercher la présence de l'agent sélectionné dans le clockingData -----
  const agentClockingEntry = clockingData.find(
    (entry) => entry.agent.uuid === selectedAgentUuid
  );
  const hasClockedIn = !!agentClockingEntry && !agentClockingEntry.endDateTime;

  // ============================
  // GÉOLOCALISATION
  // ============================
  // 1) Récupérer la position de l'agent
  const fetchAgentPosition = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n’est pas supportée par votre appareil.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        checkProximity(latitude, longitude);
      },
      (error) => {
        console.error(
          'Erreur lors de la récupération de la géolocalisation :',
          error
        );
        alert('Impossible d’obtenir votre position.');
      },
      { enableHighAccuracy: true }
    );
  };

  // 2) Calculer la distance entre la position de l’agent et la nursery
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Rayon de la Terre (mètres)
    const toRad = (angle) => (angle * Math.PI) / 180;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  };

  // 3) Vérifier la proximité (1000 m)
  const checkProximity = (latitude, longitude) => {
    if (!nurseryCoordinates) return;
    const distance = calculateDistance(
      latitude,
      longitude,
      nurseryCoordinates.latitude,
      nurseryCoordinates.longitude
    );
    setIsWithinRange(distance <= 1000);
  };

  // 4) Lorsqu'on est en mode phone, on tente de récupérer la position
  useEffect(() => {
    if (agentLoginWithPhone && selectedNurseryUuid) {
      // Important : on attend que la nurseryCoordinates soit chargée
      if (!nurseryCoordinates) return;
      fetchAgentPosition();
    }
  }, [agentLoginWithPhone, nurseryCoordinates, selectedNurseryUuid]);

  // ============================
  // POINTAGE / DÉPOINTAGE
  // ============================
  // Pointer
  const handlePointer = async () => {
    // En mode téléphone, vérifier la proximité
    if (agentLoginWithPhone && !isWithinRange) {
      alert('Vous êtes trop loin de la nursery pour pointer.');
      return;
    }

    // Si on est en mode web, s'assurer qu'un agent est bien sélectionné
    if (!selectedAgentUuid) {
      alert('Veuillez sélectionner un agent avant de pointer.');
      return;
    }

    try {
      const payload = {
        startDateTime: new Date().toISOString(),
        agentUuid: selectedAgentUuid,
      };
      await axios.post(
        `/clocking_ins?nursery_structure_uuid=${selectedNurseryUuid}`,
        payload
      );
      reloadClockingData();
    } catch (error) {
      console.error('Erreur lors du pointage :', error);
    }
  };

  // Dépointer
  const handleDepointer = async () => {
    if (!agentClockingEntry?.uuid) {
      alert("Aucun pointage en cours pour l'agent sélectionné.");
      return;
    }

    try {
      const payload = {
        startDateTime: agentClockingEntry.startDateTime,
        endDateTime: new Date().toISOString(),
        agentUuid: agentClockingEntry.agent.uuid,
      };
      await axios.put(
        `/clocking_ins/${agentClockingEntry.uuid}?nursery_structure_uuid=${selectedNurseryUuid}`,
        payload
      );
      reloadClockingData();
    } catch (error) {
      console.error('Erreur lors du dépointage :', error);
    }
  };

  // Éditer (pour manager)
  const handleEditClocking = (uuid) => {
    if (!isManager) return;
    console.log(`Éditer l'entrée clocking_ins avec uuid : ${uuid}`);
    // logiques d'édition (modal, etc.) à implémenter
  };

  // ============================
  // AFFICHAGE
  // ============================
  // Helper format heure 24h
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // 1) Mode agentLoginWithPhone = TRUE
  //    => un seul agent, pas de liste, pointage basé sur la géolocalisation
  if (agentLoginWithPhone) {
    // Vous pouvez, si besoin, récupérer l’agent en cours via localStorage
    // ou via un endpoint type /me pour ensuite remplir selectedAgentUuid automatiquement.
    // Exemple :
    useEffect(() => {
      const agentUuid = localStorage.getItem('uuid');
      if (agentUuid) {
        setSelectedAgentUuid(agentUuid);
      }
    }, []);

    // Chercher la ligne existante si l'agent a pointé
    const phoneAgentClocking = clockingData.find(
      (entry) => entry.agent.uuid === selectedAgentUuid
    );
    const phoneHasClockedIn =
      !!phoneAgentClocking && !phoneAgentClocking.endDateTime;

    return (
      <Box className='clocking-in-container' textAlign='center'>
        <Typography variant='h5' marginBottom={2} textAlign='center'>
          Pointage
        </Typography>

        {!agentLoginWithPhone && !selectedAgentUuid && (
          <Typography variant='body1' color='gray'>
            Aucune information sur l&apos;agent connecté.
          </Typography>
        )}

        {selectedAgentUuid && (
          <>
            {phoneHasClockedIn ? (
              <Button
                variant='contained'
                color='error'
                onClick={handleDepointer}
                sx={{ minWidth: 120, marginBottom: 2 }}
              >
                Dépointer
              </Button>
            ) : (
              <Button
                variant='contained'
                color='primary'
                onClick={handlePointer}
                sx={{ minWidth: 120, marginBottom: 2 }}
              >
                Pointer
              </Button>
            )}
            {!isWithinRange && (
              <Typography variant='body1' color='error'>
                Vous êtes hors du périmètre autorisé.
              </Typography>
            )}
          </>
        )}

        {/* Historique du jour (facultatif) */}
        <Typography variant='h6' marginTop={4} marginBottom={1}>
          Historique du jour
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f2f2f2' }}>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Heure de pointage</TableCell>
                <TableCell>Heure de dépointage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clockingData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align='center'>
                    Aucun pointage pour aujourd&apos;hui.
                  </TableCell>
                </TableRow>
              ) : (
                clockingData.map((entry) => (
                  <TableRow key={entry.uuid}>
                    <TableCell>
                      {entry.agent?.firstname} {entry.agent?.lastname}
                    </TableCell>
                    <TableCell>{formatTime(entry.startDateTime)}</TableCell>
                    <TableCell>
                      {entry.endDateTime ? formatTime(entry.endDateTime) : ''}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // 2) Mode agentLoginWithPhone = FALSE
  //    => L’affichage manager ou agent sur PC (liste des agents, etc.)
  return (
    <Box className='clocking-in-container'>
      <Typography variant='h5' marginBottom={2} textAlign='center'>
        Pointage des agents
      </Typography>

      {/* Liste d'agents */}
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

      {/* Tableau des pointages du jour */}
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
