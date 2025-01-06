import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  Box,
  FormControlLabel,
  Select,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { SelectedNurseryContext } from '../contexts/SelectedNurseryContext';

const AppBarComponent = ({
  isManager,
  toggleDrawer,
  handleLogout,
  isAgentMode,
  handleToggleRole,
  userUuid,
}) => {
  const navigate = useNavigate();
  const [nurseries, setNurseries] = useState([]);
  const [selectedNursery, setSelectedNursery] = useState('');
  const { setSelectedNurseryUuid } = useContext(SelectedNurseryContext);

  const fetchNurseries = useCallback(async () => {
    if (!userUuid && !isManager) {
      console.error("UUID manquant pour l'agent, annulation de l'appel.");
      return;
    }

    try {
      let response;
      let nurseriesList = [];

      if (isManager && isAgentMode) {
        response = await axios.get('/nursery_structures');
        nurseriesList = response.data?.['member'] || [];
      } else if (!isManager) {
        response = await axios.get(`/agents/${userUuid}`);
        nurseriesList = response.data?.nurseryStructures || [];
      }

      setNurseries(nurseriesList);

      if (nurseriesList.length > 0) {
        const savedNursery = JSON.parse(
          localStorage.getItem('selectedNursery')
        );

        if (
          savedNursery &&
          nurseriesList.some((n) => n.uuid === savedNursery.uuid)
        ) {
          setSelectedNursery(savedNursery.name);
          setSelectedNurseryUuid(savedNursery.uuid);
        } else {
          setSelectedNursery(nurseriesList[0].name);
          setSelectedNurseryUuid(nurseriesList[0].uuid);
        }
      }
    } catch (error) {
      console.error('Error fetching nurseries:', error);
      setNurseries([]);
    }
  }, [userUuid, isManager, isAgentMode, setSelectedNurseryUuid]);

  useEffect(() => {
    if (isAgentMode) {
      fetchNurseries();
    }
  }, [isAgentMode, fetchNurseries]);

  const handleNurseryChange = (event) => {
    const selectedName = event.target.value;
    const selectedNursery = nurseries.find(
      (nursery) => nursery.name === selectedName
    );
    setSelectedNursery(selectedName);
    setSelectedNurseryUuid(selectedNursery.uuid);

    localStorage.setItem(
      'selectedNursery',
      JSON.stringify({
        name: selectedNursery.name,
        uuid: selectedNursery.uuid,
      })
    );
  };

  return (
    <AppBar
      position='static'
      sx={{ backgroundColor: isAgentMode ? 'pink' : 'primary.main' }}
    >
      <Toolbar>
        <IconButton
          edge='start'
          color='inherit'
          aria-label='menu'
          onClick={() => toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>

        {isManager && (
          <FormControlLabel
            control={
              <Switch
                checked={isAgentMode}
                onChange={handleToggleRole}
                color='default'
              />
            }
            label={`Passer en mode ${isAgentMode ? 'Manager' : 'Agent'}`}
            sx={{ marginLeft: 2 }}
          />
        )}

        {isAgentMode && (
          <Select
            value={selectedNursery}
            onChange={handleNurseryChange}
            displayEmpty
            sx={{ color: 'white', marginLeft: 2 }}
          >
            <MenuItem value='' disabled>
              Sélectionner une crèche
            </MenuItem>
            {nurseries.map((nursery) => (
              <MenuItem key={nursery.uuid} value={nursery.name}>
                {nursery.name}
              </MenuItem>
            ))}
          </Select>
        )}

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <ChildFriendlyIcon />
          <Typography variant='h6' sx={{ marginLeft: 1 }}>
            NURSEREAL
          </Typography>
        </Box>

        {isManager && (
          <IconButton color='inherit' onClick={() => navigate('/settings')}>
            <SettingsIcon />
          </IconButton>
        )}

        <IconButton color='inherit' onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
