import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";

const EditAgent = () => {
  const [agent, setAgent] = useState({
    firstname: "",
    lastname: "",
    email: "",
    roles: [],
  });

  const navigate = useNavigate();
  const { uuid } = useParams();

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await axios.get(`/agents/${uuid}`);
        setAgent(response.data);
      } catch (error) {
        console.error("Failed to fetch agent", error);
      }
    };
    fetchAgent();
  }, [uuid]);

  const handleChange = (e) => {
    setAgent({ ...agent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/agents/${uuid}`, agent);
      navigate("/agents");
    } catch (error) {
      console.error("Failed to update agent", error);
    }
  };

  return (
    <Box sx={{ padding: 4, position: "relative" }}>
      <IconButton
        sx={{ position: "absolute", top: 10, left: 10 }}
        onClick={() => navigate("/agents")}
      >
        <ArrowBack />
      </IconButton>

      <Typography variant="h4" gutterBottom align="center">
        Modifier l'Agent
      </Typography>

      <Paper
        sx={{
          maxWidth: "600px",
          margin: "auto",
          padding: 4,
          backgroundColor: "#f5f5f5",
          boxShadow: 3,
        }}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Prénom"
            name="firstname"
            value={agent.firstname}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Nom"
            name="lastname"
            value={agent.lastname}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={agent.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          {/* Vous pouvez ajouter un champ pour les rôles si nécessaire */}
          <Box sx={{ marginTop: 2, textAlign: "center" }}>
            <Button type="submit" variant="contained" color="primary">
              Enregistrer les modifications
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditAgent;
