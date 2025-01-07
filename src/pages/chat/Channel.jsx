import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';
import axios from '../../api/axios';
import './Channel.css';

const Channel = ({ channelId, onClose }) => {
  // Si vos channelId en base sont de type int, convertissez-le :
  const channelIdNumber = parseInt(channelId, 10); // ou direct channelId si c'est un UUID
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('id');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Faites attention si channelId est un UUID (ne pas parseInt)
        const response = await axios.get(
          `/messages?channelId=${channelIdNumber}`
        );
        setMessages(response.data['member'] ?? []);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setLoading(false);
      }
    };

    // Éviter l'appel si channelIdNumber est NaN
    if (!Number.isNaN(channelIdNumber)) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [channelIdNumber]);

  useEffect(() => {
    if (!Number.isNaN(channelIdNumber)) {
      const url = new URL('http://localhost:8083/.well-known/mercure');
      url.searchParams.append('topic', `/channels/${channelIdNumber}`);

      const eventSource = new EventSource(url, { withCredentials: true });

      eventSource.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);

        setMessages((prev) => {
          // Vérifie si le message est déjà dans la liste
          const messageExists = prev.some((msg) => msg.id === newMessage.id);
          if (!messageExists) {
            return [...prev, newMessage];
          }
          return prev;
        });
      };

      return () => {
        eventSource.close();
      };
    }
  }, [channelIdNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const messagePayload = {
        channelId: channelIdNumber,
        content: newMessage,
        author: {
          memberType: 'Agent',
          memberId: parseInt(userId, 10),
        },
      };
      const response = await axios.post('/messages', messagePayload);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return <Typography>Loading messages...</Typography>;
  }

  return (
    <Box className='chat-container'>
      {/* Entête (facultative) */}
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant='h6'>Channel #{channelIdNumber}</Typography>
        <IconButton onClick={onClose}>X</IconButton>
      </Box>

      <Box className='messages-container'>
        {messages.map((message) => (
          <Box
            key={message.id}
            className={`message-bubble ${
              message.author?.memberId === parseInt(userId, 10)
                ? 'my-message'
                : 'other-message'
            }`}
          >
            <Typography className='message-author'>
              {message.author
                ? `${message.author.firstname} ${message.author.lastname}`
                : 'Unknown'}
            </Typography>
            <Typography className='message-content'>
              {message.content}
            </Typography>
            <Typography className='message-timestamp'>
              {message.createdAt
                ? new Date(message.createdAt).toLocaleString()
                : 'Unknown time'}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box className='message-input-container'>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder='Écrire un message...'
          onKeyDown={handleKeyDown}
        />
        <IconButton color='primary' onClick={handleSendMessage}>
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Channel;
