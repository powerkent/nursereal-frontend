import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import PrivateRoute from './components/PrivateRoute';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './components/settings';

import Nurseries from './pages/manager/nursery/Nurseries';
import AddNursery from './pages/manager/nursery/AddNursery';
import EditNursery from './pages/manager/nursery/EditNursery';
import Nursery from './pages/manager/nursery/Nursery';

import Agents from './pages/manager/agent/Agents';
import AddAgent from './pages/manager/agent/AddAgent';
import EditAgent from './pages/manager/agent/EditAgent';
import Agent from './pages/manager/agent/Agent';

import Children from './pages/manager/child/Children';
import AddChild from './pages/manager/child/AddChild';
import EditChild from './pages/manager/child/EditChild';
import Child from './pages/manager/child/Child';

import Customers from './pages/manager/customer/Customers';
import Customer from './pages/manager/customer/Customer';
import EditCustomer from './pages/manager/customer/EditCustomer';
import AddCustomer from './pages/manager/customer/AddCustomer';

import Treatments from './pages/manager/treatment/Treatments';
import Treatment from './pages/manager/treatment/Treatment';
import EditTreatment from './pages/manager/treatment/EditTreatment';
import AddTreatment from './pages/manager/treatment/AddTreatment';

import Activities from './pages/manager/activity/Activities';
import Activity from './pages/manager/activity/Activity';
import EditActivity from './pages/manager/activity/EditActivity';
import AddActivity from './pages/manager/activity/AddActivity';

import Contracts from './pages/manager/contract/Contracts';
import AddContract from './pages/manager/contract/AddContract';

import Channels from './pages/chat/Channels';
import Channel from './pages/chat/Channel';

import Presence from './pages/agent/presence/Presence';
import Diaper from './pages/agent/diaper/Diaper';
import Care from './pages/agent/care/Care';

import ActivityAction from './pages/agent/activity/Activity';
import Rest from './pages/agent/rest/Rest';
import TreatmentAction from './pages/agent/treatment/Treatment';
import Historic from './pages/agent/historic/Historic';
import ClockingIn from './pages/agent/clockingIn/ClockingIn';

import './App.css';

function App() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
      }}
    >
      <Router>
        <Routes>
          <Route path='/login' element={<LoginForm />} />
          <Route
            path='/'
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route path='settings' element={<Settings />} />

            {/* Crèches */}
            <Route path='nurseries' element={<Nurseries />} />
            <Route path='nurseries/add' element={<AddNursery />} />
            <Route path='nurseries/edit/:uuid' element={<EditNursery />} />
            <Route path='nurseries/:uuid' element={<Nursery />} />

            {/* Agents */}
            <Route path='agents' element={<Agents />} />
            <Route path='agents/add' element={<AddAgent />} />
            <Route path='agents/edit/:uuid' element={<EditAgent />} />
            <Route path='agents/:uuid' element={<Agent />} />

            {/* Enfants */}
            <Route path='children' element={<Children />} />
            <Route path='children/add' element={<AddChild />} />
            <Route path='children/edit/:uuid' element={<EditChild />} />
            <Route path='children/:uuid' element={<Child />} />

            {/* Parents */}
            <Route path='customers' element={<Customers />} />
            <Route path='customers/add' element={<AddCustomer />} />
            <Route path='customers/edit/:uuid' element={<EditCustomer />} />
            <Route path='customers/:uuid' element={<Customer />} />

            {/* Traitements */}
            <Route path='treatments' element={<Treatments />} />
            <Route path='treatments/add' element={<AddTreatment />} />
            <Route path='treatments/edit/:uuid' element={<EditTreatment />} />
            <Route path='treatments/:uuid' element={<Treatment />} />

            {/* Activités */}
            <Route path='activities' element={<Activities />} />
            <Route path='activities/add' element={<AddActivity />} />
            <Route path='activities/edit/:uuid' element={<EditActivity />} />
            <Route path='activities/:uuid' element={<Activity />} />

            {/* Contrats */}
            <Route path='contracts' element={<Contracts />} />
            <Route path='contracts/add' element={<AddContract />} />

            {/* Chats */}
            <Route path='channels' element={<Channels />} />
            <Route path='channels/:channelId' element={<Channel />} />

            {/* Présence */}
            <Route path='actions/presences' element={<Presence />} />

            {/* Diaper */}
            <Route path='actions/diapers' element={<Diaper />} />

            {/* Care */}
            <Route path='actions/cares' element={<Care />} />

            {/* Activity */}
            <Route path='actions/activities' element={<ActivityAction />} />

            {/* Sleeping */}
            <Route path='actions/rests' element={<Rest />} />

            {/* Treatment */}
            <Route path='actions/treatments' element={<TreatmentAction />} />

            {/* Historic */}
            <Route path='actions/historics' element={<Historic />} />

            {/* Clocking in */}
            <Route path='actions/clockins' element={<ClockingIn />} />
          </Route>
        </Routes>
      </Router>
    </Box>
  );
}

export default App;
