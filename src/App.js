import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import Nurseries from "./pages/nursery/Nurseries";
import AddNursery from "./pages/nursery/AddNursery";
import EditNursery from "./pages/nursery/EditNursery";
import Nursery from "./pages/nursery/Nursery";

import Agents from "./pages/agent/Agents";
import AddAgent from "./pages/agent/AddAgent";
import EditAgent from "./pages/agent/EditAgent";
import Agent from "./pages/agent/Agent";

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
      </Routes>
    </Router>
  );
}

export default App;