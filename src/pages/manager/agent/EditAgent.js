import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";

const EditAgent = () => {
  const [agent, setAgent] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    roles: [],
    nurseryStructures: [],
  });
  const [nurseries, setNurseries] = useState([]);
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

    const fetchNurseries = async () => {
      try {
        const response = await axios.get("/nursery_structures");
        setNurseries(response.data["hydra:member"]);
      } catch (error) {
        console.error("Failed to fetch nurseries", error);
      }
    };

    fetchAgent();
    fetchNurseries();
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
    <Layout>
      <Box
        sx={{
          width: "400px",
          margin: "auto",
          padding: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Modifier un Agent
        </Typography>

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
          <TextField
            fullWidth
            label="Mot de passe"
            name="password"
            type="password"
            value={agent.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rôles</InputLabel>
            <Select
              name="roles"
              multiple
              value={agent.roles}
              onChange={handleChange}
            >
              <MenuItem value="ROLE_MANAGER">ROLE_MANAGER</MenuItem>
              <MenuItem value="ROLE_AGENT">ROLE_AGENT</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Crèches</InputLabel>
            <Select
              name="nurseryStructures"
              multiple
              value={agent.nurseryStructures}
              onChange={handleChange}
            >
              {nurseries.map((nursery) => (
                <MenuItem key={nursery.uuid} value={nursery.uuid}>
                  {nursery.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            Enregistrer les modifications
          </Button>
        </form>
      </Box>
    </Layout>
  );
};

export default EditAgent;
