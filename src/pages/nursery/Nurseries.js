import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const Nurseries = () => {
  const [nurseries, setNurseries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const response = await axios.get("/nursery_structures");
        setNurseries(response.data["hydra:member"]);
      } catch (error) {
        console.error("Failed to fetch nurseries", error);
      }
    };
    fetchNurseries();
  }, []);

  const handleSelect = (uuid) => {
    navigate(`/nurseries/${uuid}`);
  };

  const handleEdit = (uuid) => {
    navigate(`/nurseries/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/nursery_structures/${uuid}`);
      setNurseries(nurseries.filter((nursery) => nursery.uuid !== uuid));
    } catch (error) {
      console.error("Failed to delete nursery", error);
    }
  };

  const handleAddNursery = () => {
    navigate("/nurseries/add");
  };

  return (
    <Box sx={{ padding: 4, position: "relative" }}>
      <IconButton
        sx={{ position: "absolute", top: 10, left: 10 }}
        onClick={() => navigate("/")}
      >
        <ArrowBack />
      </IconButton>

      <Typography variant="h4" gutterBottom align="center">
        Liste des Crèches
      </Typography>

      <Box
        sx={{
          maxWidth: "800px", // Limite la largeur maximale
          margin: "auto", // Centre le contenu
        }}
      >
        {nurseries.map((nursery) => (
          <Paper
            key={nursery.uuid}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 2,
              marginBottom: 2,
              backgroundColor: "#f5f5f5",
              boxShadow: 3, // Ajoute une ombre légère
            }}
          >
            {/* Informations sur la crèche à gauche */}
            <Box>
              <Typography variant="h6">{nursery.name}</Typography>
              <Typography>{nursery.address}</Typography>
              <Typography>
                Début: {dayjs(nursery.startAt).format("DD/MM/YYYY HH:mm")}
              </Typography>
            </Box>

            {/* Boutons à droite */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSelect(nursery.uuid)}
              >
                Sélectionner
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "orange" }}
                onClick={() => handleEdit(nursery.uuid)}
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
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: "center" }}>
        <Button variant="contained" color="success" onClick={handleAddNursery}>
          Ajouter une Crèche
        </Button>
      </Box>
    </Box>
  );
};

export default Nurseries;
