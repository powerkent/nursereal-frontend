import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const Children = () => {
  const [children, setChildren] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get("/children");
        setChildren(response.data["hydra:member"]);
      } catch (error) {
        console.error("Failed to fetch children", error);
      }
    };
    fetchChildren();
  }, []);

  const handleSelect = (uuid) => {
    navigate(`/children/${uuid}`);
  };

  const handleEdit = (uuid) => {
    navigate(`/children/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/children/${uuid}`);
      setChildren(children.filter((child) => child.uuid !== uuid));
    } catch (error) {
      console.error("Failed to delete child", error);
    }
  };

  const handleAddChild = () => {
    navigate("/children/add");
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
        Liste des Enfants
      </Typography>

      <Box
        sx={{
          maxWidth: "800px",
          margin: "auto",
        }}
      >
        {children.map((child) => (
          <Paper
            key={child.uuid}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 2,
              marginBottom: 2,
              backgroundColor: "#f5f5f5",
              boxShadow: 3,
            }}
          >
            {/* Informations sur l'enfant à gauche */}
            <Box>
              <Typography variant="h6">
                {child.firstname} {child.lastname}
              </Typography>
              <Typography>
                Date de naissance: {dayjs(child.birthdate).format("DD/MM/YYYY")}
              </Typography>
            </Box>

            {/* Boutons à droite */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSelect(child.uuid)}
              >
                Sélectionner
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "orange" }}
                onClick={() => handleEdit(child.uuid)}
              >
                Modifier
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDelete(child.uuid)}
              >
                Supprimer
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: "center" }}>
        <Button variant="contained" color="success" onClick={handleAddChild}>
          Ajouter un Enfant
        </Button>
      </Box>
    </Box>
  );
};

export default Children;
