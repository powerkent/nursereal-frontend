import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";

import Nurseries from "./pages/manager/nursery/Nurseries";
import AddNursery from "./pages/manager/nursery/AddNursery";
import EditNursery from "./pages/manager/nursery/EditNursery";
import Nursery from "./pages/manager/nursery/Nursery";

import Agents from "./pages/manager/agent/Agents";
import AddAgent from "./pages/manager/agent/AddAgent";
import EditAgent from "./pages/manager/agent/EditAgent";
import Agent from "./pages/manager/agent/Agent";

import Children from "./pages/manager/child/Children";
import AddChild from "./pages/manager/child/AddChild";
import EditChild from "./pages/manager/child/EditChild";
import Child from "./pages/manager/child/Child";

import Customers from "./pages/manager/customer/Customers";
import Customer from "./pages/manager/customer/Customer";
import EditCustomer from "./pages/manager/customer/EditCustomer";
import AddCustomer from "./pages/manager/customer/AddCustomer";

import Treatments from "./pages/manager/treatment/Treatments";
import Treatment from "./pages/manager/treatment/Treatment";
import EditTreatment from "./pages/manager/treatment/EditTreatment";
import AddTreatment from "./pages/manager/treatment/AddTreatment";

import Activities from "./pages/manager/activity/Activities";
import Activity from "./pages/manager/activity/Activity";
import EditActivity from "./pages/manager/activity/EditActivity";
import AddActivity from "./pages/manager/activity/AddActivity";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/nurseries"
          element={
            <PrivateRoute>
              <Nurseries />
            </PrivateRoute>
          }
        />
        <Route
          path="/nurseries/:uuid"
          element={
            <PrivateRoute>
              <Nursery />
            </PrivateRoute>
          }
        />
        <Route
          path="/nurseries/add"
          element={
            <PrivateRoute>
              <AddNursery />
            </PrivateRoute>
          }
        />
        <Route
          path="/nurseries/edit/:uuid"
          element={
            <PrivateRoute>
              <EditNursery />
            </PrivateRoute>
          }
        />
        <Route
          path="/agents"
          element={
            <PrivateRoute>
              <Agents />
            </PrivateRoute>
          }
        />
        <Route
          path="/agents/add"
          element={
            <PrivateRoute>
              <AddAgent />
            </PrivateRoute>
          }
        />
        <Route
          path="/agents/edit/:uuid"
          element={
            <PrivateRoute>
              <EditAgent />
            </PrivateRoute>
          }
        />
        <Route
          path="/agents/:uuid"
          element={
            <PrivateRoute>
              <Agent />
            </PrivateRoute>
          }
        />
        <Route
          path="/children"
          element={
            <PrivateRoute>
              <Children />
            </PrivateRoute>
          }
        />
        <Route
          path="/children/add"
          element={
            <PrivateRoute>
              <AddChild />
            </PrivateRoute>
          }
        />
        <Route
          path="/children/edit/:uuid"
          element={
            <PrivateRoute>
              <EditChild />
            </PrivateRoute>
          }
        />
        <Route
          path="/children/:uuid"
          element={
            <PrivateRoute>
              <Child />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/add"
          element={
            <PrivateRoute>
              <AddCustomer />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/edit/:uuid"
          element={
            <PrivateRoute>
              <EditCustomer />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:uuid"
          element={
            <PrivateRoute>
              <Customer />
            </PrivateRoute>
          }
        />
        <Route
          path="/treatments"
          element={
            <PrivateRoute>
              <Treatments />
            </PrivateRoute>
          }
        />
        <Route
          path="/treatments/add"
          element={
            <PrivateRoute>
              <AddTreatment />
            </PrivateRoute>
          }
        />
        <Route
          path="/treatments/edit/:uuid"
          element={
            <PrivateRoute>
              <EditTreatment />
            </PrivateRoute>
          }
        />
        <Route
          path="/treatments/:uuid"
          element={
            <PrivateRoute>
              <Treatment />
            </PrivateRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <PrivateRoute>
              <Activities />
            </PrivateRoute>
          }
        />
        <Route
          path="/activities/add"
          element={
            <PrivateRoute>
              <AddActivity />
            </PrivateRoute>
          }
        />
        <Route
          path="/activities/edit/:uuid"
          element={
            <PrivateRoute>
              <EditActivity />
            </PrivateRoute>
          }
        />
        <Route
          path="/activities/:uuid"
          element={
            <PrivateRoute>
              <Activity />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
