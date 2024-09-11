import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";

const Agent = () => {
  const [agent, setAgent] = useState(null);
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

  if (!agent) {
    return (
      <Typography variant="h6" align="center">
        Chargement...
      </Typography>
    );
  }

  return (
    <Layout>
      <Box sx={{ padding: 4, position: "relative" }}>
        <Typography variant="h4" gutterBottom align="center">
          Détails de l'Agent
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
          <Typography variant="h6">
            {agent.firstname} {agent.lastname}
          </Typography>
          <Typography>Email: {agent.email}</Typography>
          <Typography>Rôle(s): {agent.roles.join(", ")}</Typography>
          {/* Ajoutez d'autres détails si nécessaire */}
        </Paper>

        <Box
          sx={{
            marginTop: 4,
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            sx={{ backgroundColor: "orange" }}
            onClick={() => navigate(`/agents/edit/${agent.uuid}`)}
          >
            Modifier
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/agents")}
          >
            Retour à la liste
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default Agent;
