import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Badge, // Pour la puce rouge
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
} from '@mui/material';
import axios from '../../api/axios';
import Channel from './Channel';
import './Channels.css';

const Channels = () => {
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState(null);
  const [notifications, setNotifications] = useState({}); // État pour gérer les notifications

  // Fetching channels from API
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const memberId = localStorage.getItem('id');
        const response = await axios.get(`/channels?memberId=${memberId}`);
        setChannels(response.data['member']);
      } catch (error) {
        console.error('Failed to fetch channels', error);
      }
    };
    fetchChannels();
  }, []);

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(`/agents`);
        setAgents(response.data['member']);
      } catch (error) {
        console.error('Failed to fetch agents', error);
      }
    };
    fetchAgents();
  }, []);

  // Gestion des notifications via Mercure à chaque nouveau message reçu
  useEffect(() => {
    channels.forEach((channel) => {
      const url = new URL('http://localhost:8001/.well-known/mercure');
      url.searchParams.append('topic', `/channels/${channel.id}`);

      const eventSource = new EventSource(url, { withCredentials: true });

      eventSource.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);

        // Si le message vient d'un autre utilisateur et que le canal n'est pas ouvert
        if (
          newMessage.author.memberId !== parseInt(localStorage.getItem('id')) &&
          currentChannelId !== channel.id
        ) {
          setNotifications((prev) => ({
            ...prev,
            [channel.id]: (prev[channel.id] || 0) + 1, // Incrémente la notification
          }));
        }
      };

      return () => {
        eventSource.close();
      };
    });
  }, [channels, currentChannelId]);

  // Fonction pour créer un nouveau channel
  const handleCreateChannel = async () => {
    try {
      const myId = parseInt(localStorage.getItem('id'));
      const members = [
        ...selectedAgents.map((agentId) => ({
          memberType: 'Agent',
          memberId: agentId,
        })),
        {
          memberType: 'Agent',
          memberId: myId,
        },
      ];

      const newChannel = {
        name: newChannelName,
        members: members,
      };

      const response = await axios.post('/channels', newChannel);
      setChannels([...channels, response.data]);
      handleOpenDialog(response.data.id);
    } catch (error) {
      console.error('Failed to create channel', error);
    }
  };

  // Ouvrir un channel et réinitialiser les notifications
  const handleOpenDialog = (channelId) => {
    setCurrentChannelId(channelId);
    setOpenDialog(true);

    // Réinitialiser les notifications pour ce canal
    setNotifications((prev) => ({ ...prev, [channelId]: 0 }));
  };

  // Fermer le dialogue de channel
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentChannelId(null);
  };

  // Gestion de la sélection des agents pour créer un nouveau channel
  const handleAgentSelect = (event) => {
    setSelectedAgents(event.target.value);
  };

  return (
    <Box className='container' sx={{ padding: 2 }}>
      {/* Liste des channels */}
      <Box className='channel-list'>
        {channels.length === 0 ? (
          <Typography>Aucun channel disponible.</Typography>
        ) : (
          channels.map((channel) => (
            <Paper
              key={channel.id}
              className='channel-item'
              onClick={() => handleOpenDialog(channel.id)}
            >
              <Box>
                <Typography className='channel-name'>
                  <Badge
                    color='error'
                    badgeContent={notifications[channel.id] || 0}
                    invisible={notifications[channel.id] === 0}
                  >
                    {channel.name}
                  </Badge>
                </Typography>
                <Typography className='channel-members'>
                  {channel.members
                    .map((member) => `${member.firstname} ${member.lastname}`)
                    .join(', ')}
                </Typography>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* Formulaire pour créer un nouveau channel */}
      <Box className='create-channel-form'>
        <input
          type='text'
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          placeholder='Nom du Channel'
        />

        <FormControl fullWidth>
          <InputLabel id='agent-select-label'>
            Sélectionner des agents
          </InputLabel>
          <Select
            labelId='agent-select-label'
            multiple
            value={selectedAgents}
            onChange={handleAgentSelect}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const agent = agents.find((agent) => agent.id === id);
                  return agent ? `${agent.firstname} ${agent.lastname}` : '';
                })
                .join(', ')
            }
          >
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                {agent.firstname} {agent.lastname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant='contained'
          color='success'
          onClick={handleCreateChannel}
        >
          Créer une discussion
        </Button>
      </Box>

      {/* Popup avec le contenu du channel */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth='md'
        fullWidth
      >
        {currentChannelId ? (
          <Channel channelId={currentChannelId} onClose={handleCloseDialog} />
        ) : (
          <Typography>Chargement du channel...</Typography>
        )}
      </Dialog>
    </Box>
  );
};

export default Channels;
