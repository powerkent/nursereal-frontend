import React, { useState, useEffect } from "react";
import "./AddAgent.css";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const AddAgent = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState([]);
  const [nurseryStructures, setNurseryStructures] = useState([]);
  const [availableNurseries, setAvailableNurseries] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const response = await axios.get("/nursery_structures");
        setAvailableNurseries(response.data["hydra:member"]);
      } catch (err) {
        console.error("Failed to fetch nurseries", err);
      }
    };
    fetchNurseries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/agents", {
        firstname,
        lastname,
        email,
        password,
        roles,
        nurseryStructures,
      });
      navigate("/agents");
    } catch (err) {
      setError("Failed to add the agent. Please try again.");
    }
  };

  return (
    <Box
      sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
    >
      <IconButton
        sx={{ position: "absolute", top: 10, left: 10 }}
        onClick={() => navigate("/agents")}
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="h4" gutterBottom>
        Ajouter un Agent
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Prénom"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Nom"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Crèches</InputLabel>
          <Select
            multiple
            value={nurseryStructures}
            onChange={(e) => setNurseryStructures(e.target.value)}
          >
            {availableNurseries.map((nursery) => (
              <MenuItem key={nursery.uuid} value={nursery.uuid}>
                {nursery.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Rôles</InputLabel>
          <Select
            multiple
            value={roles}
            onChange={(e) => setRoles(e.target.value)}
          >
            <MenuItem value="ROLE_MANAGER">ROLE_MANAGER</MenuItem>
            <MenuItem value="ROLE_AGENT">ROLE_AGENT</MenuItem>
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Ajouter
        </Button>
      </form>
    </Box>
  );
};

export default AddAgent;
