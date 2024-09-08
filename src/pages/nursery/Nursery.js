import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, IconButton } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../api/axios";
import dayjs from "dayjs";

const Nursery = () => {
  const { uuid } = useParams(); // Retrieve the nursery ID from the URL
  const [nursery, setNursery] = useState(null); // Nursery data state
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNursery = async () => {
      try {
        const response = await axios.get(`/nursery_structures/${uuid}`);
        setNursery(response.data);
      } catch (err) {
        setError("Failed to fetch nursery details.");
      }
    };
    fetchNursery();
  }, [uuid]);

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/nursery_structures/${uuid}`);
      navigate(`/nurseries`);
    } catch (error) {
      console.error("Failed to delete nursery", error);
    }
  };

  if (!nursery) {
    return <Typography variant="h6">{error || "Loading..."}</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      {/* Back Button */}
      <IconButton
        sx={{ position: "absolute", top: 10, left: 10 }}
        onClick={() => navigate("/nurseries")}
      >
        <ArrowBack />
      </IconButton>

      <Paper
        sx={{
          padding: 3,
          backgroundColor: "#f5f5f5",
          margin: "auto",
          marginTop: "60px",
          maxWidth: "600px", // Limite la largeur maximale
          textAlign: "center", // Centre le texte
          boxShadow: 3, // Ajoute un peu d'ombre
        }}
      >
        <Typography variant="h4" gutterBottom>
          {nursery.name}
        </Typography>
        <Typography variant="body1">Adresse: {nursery.address}</Typography>
        <Typography variant="body1">
          Date de début: {dayjs(nursery.startAt).format("DD/MM/YYYY HH:mm")}
        </Typography>

        {/* Display agents */}
        <Typography variant="h5" gutterBottom sx={{ marginTop: 2 }}>
          Agents
        </Typography>
        {nursery.agents && nursery.agents.length > 0 ? (
          nursery.agents.map((agent) => (
            <Typography key={agent.uuid}>
              {agent.firstname} {agent.lastname}
            </Typography>
          ))
        ) : (
          <Typography>Aucun agent affecté.</Typography>
        )}

        {/* Display children */}
        <Typography variant="h5" gutterBottom sx={{ marginTop: 2 }}>
          Enfants
        </Typography>
        {nursery.children && nursery.children.length > 0 ? (
          nursery.children.map((child) => (
            <Typography key={child.uuid}>
              {child.firstname} {child.lastname}
            </Typography>
          ))
        ) : (
          <Typography>Aucun enfant inscrit.</Typography>
        )}

        <Box sx={{ marginTop: 3 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginRight: 2 }}
            onClick={() => navigate(`/nurseries/edit/${uuid}`)}
          >
            Modifier
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(nursery.uuid)}
          >
            Supprimer
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Nursery;
