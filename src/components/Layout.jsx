import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import AppBarComponent from './AppBarComponent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FaceIcon from '@mui/icons-material/Face';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import LocalActivity from '@mui/icons-material/LocalActivity';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import AirlineSeatIndividualSuiteIcon from '@mui/icons-material/AirlineSeatIndividualSuite';
import SelectedNurseryProvider from '../contexts/SelectedNurseryContext';
import HistoryIcon from '@mui/icons-material/History';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';

const Layout = () => {
  const [isManager, setIsManager] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(
    () => JSON.parse(localStorage.getItem('isAgentMode')) || false // Charger depuis le localStorage
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previousPage, setPreviousPage] = useState('/');
  const [userUuid, setUserUuid] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const roles = localStorage.getItem('roles') || [];
      setIsManager(roles.includes('ROLE_MANAGER'));
      setUserUuid(localStorage.getItem('uuid'));
    }
  }, [navigate]);

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleToggleRole = () => {
    const newAgentMode = !isAgentMode;
    setIsAgentMode(newAgentMode);
    localStorage.setItem('isAgentMode', JSON.stringify(newAgentMode)); // Sauvegarder dans le localStorage
  };

  const managerSections = [
    {
      title: 'Crèches',
      path: '/nurseries',
      icon: <BusinessIcon />,
      parent: '/',
    },
    { title: 'Ajouter Crèche', path: '/nurseries/add', parent: '/nurseries' },
    {
      title: 'Visualiser Crèche',
      path: '/nurseries/:uuid',
      parent: '/nurseries',
    },
    {
      title: 'Modifier Crèche',
      path: '/nurseries/edit/:uuid',
      parent: '/nurseries',
    },
    { title: 'Agents', path: '/agents', icon: <PeopleIcon />, parent: '/' },
    { title: 'Visualiser Agents', path: '/agents/:uuid', parent: '/agents' },
    { title: 'Ajouter Agent', path: '/agents/add', parent: '/agents' },
    { title: 'Modifier Agent', path: '/agents/edit/:uuid', parent: '/agents' },
    {
      title: 'Enfants',
      path: '/children',
      icon: <ChildCareIcon />,
      parent: '/',
    },
    { title: 'Ajouter Enfant', path: '/children/add', parent: '/children' },
    {
      title: 'Visualiser Enfant',
      path: '/children/:uuid',
      parent: '/children',
    },
    {
      title: 'Modifier Enfant',
      path: '/children/edit/:uuid',
      parent: '/children',
    },
    { title: 'Parents', path: '/customers', icon: <FaceIcon />, parent: '/' },
    { title: 'Ajouter Parent', path: '/customers/add', parent: '/customers' },
    {
      title: 'Visualiser Parent',
      path: '/customers/:uuid',
      parent: '/customers',
    },
    {
      title: 'Modifier Parent',
      path: '/customers/edit/:uuid',
      parent: '/customers',
    },
    {
      title: 'Activités',
      path: '/activities',
      icon: <LocalActivity />,
      parent: '/',
    },
    {
      title: 'Ajouter une activité',
      path: '/activities/add',
      parent: '/activities',
    },
    {
      title: 'Visualiser une activité',
      path: '/activities/:uuid',
      parent: '/activities',
    },
    {
      title: 'Modifier une activité',
      path: '/activities/edit/:uuid',
      parent: '/activities',
    },
    {
      title: 'Traitements',
      path: '/treatments',
      icon: <AssignmentIcon />,
      parent: '/',
    },
    {
      title: 'Contrats',
      path: '/contracts',
      icon: <AssignmentTurnedInIcon />,
      parent: '/',
    },
    { title: 'Ajouter Contrat', path: '/contracts/add', parent: '/contracts' },
    { title: 'Chats', path: '/channels', icon: <ForumIcon />, parent: '/' },
  ];

  const agentSections = [
    {
      title: 'Présence',
      path: '/actions/presences',
      icon: <PeopleIcon />,
      parent: '/',
    },
    {
      title: 'Activité',
      path: '/actions/activities',
      icon: <LocalActivity />,
      parent: '/',
    },
    {
      title: 'Soin',
      path: '/actions/cares',
      icon: <ChildCareIcon />,
      parent: '/',
    },
    {
      title: 'Change',
      path: '/actions/diapers',
      icon: <BabyChangingStationIcon />,
      parent: '/',
    },
    {
      title: 'Sommeil',
      path: '/actions/rests',
      icon: <AirlineSeatIndividualSuiteIcon />,
      parent: '/',
    },
    {
      title: 'Traitement',
      path: '/actions/treatments',
      icon: <AssignmentIcon />,
      parent: '/',
    },
    {
      title: 'Historique',
      path: '/actions/historics',
      icon: <HistoryIcon />,
      parent: '/',
    },
    {
      title: 'Pointage',
      path: '/actions/clockins',
      icon: <AddAlarmIcon />,
      parent: '/',
    },
    { title: 'Chats', path: '/channels', icon: <ForumIcon />, parent: '/' },
  ];

  const sections = isAgentMode ? agentSections : managerSections;

  const getPreviousPage = () => {
    const currentSection = sections.find((section) => {
      const pathRegex = new RegExp(
        `^${section.path.replace(/:\w+/g, '[a-zA-Z0-9-]+')}$`
      );
      return pathRegex.test(location.pathname);
    });

    if (currentSection && currentSection.parent !== '/') {
      return currentSection.parent;
    }
    return '/';
  };

  useEffect(() => {
    const prevPage = getPreviousPage();
    setPreviousPage(prevPage);
  }, [location.pathname, sections]);

  return (
    <SelectedNurseryProvider>
      <Box sx={{ flexGrow: 1 }}>
        <AppBarComponent
          isManager={isManager}
          toggleDrawer={toggleDrawer}
          handleLogout={handleLogout}
          isAgentMode={isAgentMode}
          handleToggleRole={handleToggleRole}
          userUuid={userUuid}
        />

        {location.pathname !== '/' && previousPage && previousPage !== '/' && (
          <IconButton
            onClick={() => navigate(previousPage)}
            sx={{
              position: 'fixed',
              top: 100,
              left: 50,
              zIndex: 1000,
              backgroundColor: 'white',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: 'lightgray',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Drawer
          anchor='left'
          open={drawerOpen}
          onClose={() => toggleDrawer(false)}
        >
          <Box sx={{ width: 250 }}>
            <List>
              {sections
                .filter((section) => section.icon)
                .map((section) => (
                  <ListItem
                    button
                    key={section.title}
                    onClick={() => {
                      navigate(section.path);
                      toggleDrawer(false);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemIcon>{section.icon}</ListItemIcon>
                    <ListItemText primary={section.title} />
                  </ListItem>
                ))}
            </List>
          </Box>
        </Drawer>

        <Box sx={{ padding: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </SelectedNurseryProvider>
  );
};

export default Layout;
