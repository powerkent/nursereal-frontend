import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Delete } from "@mui/icons-material";
import axios from "../../../api/axios";

const Nursery = () => {
  const { uuid } = useParams();
  const [nursery, setNursery] = useState(null);
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
      <Paper
        sx={{
          padding: 3,
          backgroundColor: "#f5f5f5",
          margin: "auto",
          marginTop: "60px",
          maxWidth: "600px",
          textAlign: "center",
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          {nursery.name}
        </Typography>
        <Typography variant="body1">Adresse: {nursery.address}</Typography>

        {/* Display opening hours */}
        <Typography variant="h5" gutterBottom sx={{ marginTop: 2 }}>
          Horaires d'ouverture
        </Typography>
        {nursery.openings && nursery.openings.length > 0 ? (
          nursery.openings.map((opening, index) => (
            <Typography key={index}>
              {opening.openingDay}: {opening.openingHour} -{" "}
              {opening.closingHour}
            </Typography>
          ))
        ) : (
          <Typography>Aucun horaire disponible.</Typography>
        )}

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
          <IconButton
            color="primary"
            sx={{ marginRight: 2 }}
            onClick={() => navigate(`/nurseries/edit/${uuid}`)}
          >
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(nursery.uuid)}>
            <Delete />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Nursery;
