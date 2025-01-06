import React, { useState, useEffect } from 'react';
import { Box, Switch, FormControlLabel, Typography } from '@mui/material';
import axios from '../api/axios';

const SettingsLocalStorage = () => {
  const [agentLoginWithPhone, setAgentLoginWithPhone] = useState(() => {
    return false;
  });
  const [agentConfigUuid, setAgentConfigUuid] = useState('');

  useEffect(() => {
    const fetchFromBack = async () => {
      try {
        const { data } = await axios.get('/configs');
        const configs = data['member'] || [];
        const agentConfig = configs.find(
          (configItem) => configItem.name === 'AGENT_LOGIN_WITH_PHONE'
        );

        if (agentConfig) {
          setAgentLoginWithPhone(agentConfig.value);
          setAgentConfigUuid(agentConfig.uuid);
          localStorage.setItem(
            'AGENT_LOGIN_WITH_PHONE',
            JSON.stringify(agentConfig.value)
          );
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la config :', error);
      }
    };
    fetchFromBack();
  }, []);

  const handleToggle = async (event) => {
    const newValue = event.target.checked;
    setAgentLoginWithPhone(newValue);

    localStorage.setItem('AGENT_LOGIN_WITH_PHONE', JSON.stringify(newValue));

    try {
      await axios.put(`/configs/${agentConfigUuid}`, {
        name: 'AGENT_LOGIN_WITH_PHONE',
        value: newValue,
      });
      console.log('Mise à jour du back réussie !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du back :', error);
    }
  };

  return (
    <Box sx={{ padding: 2, marginTop: '64px' }}>
      <Typography variant='h5' sx={{ mb: 2 }} align='center'>
        Paramètres
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={agentLoginWithPhone}
            onChange={handleToggle}
            color='primary'
          />
        }
        label="Autoriser les agents à utiliser leur téléphone pour l'application"
      />
    </Box>
  );
};

export default SettingsLocalStorage;
