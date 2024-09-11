import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get("/activities");
        setActivities(response.data["hydra:member"]);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      }
    };
    fetchActivities();
  }, []);

  const handleAddActivity = () => {
    navigate("/activities/add");
  };

  return (
    <Box sx={{ padding: 4, position: "relative" }}>
      <Typography variant="h4" gutterBottom align="center">
        Liste des Activités
      </Typography>

      <Box sx={{ maxWidth: "800px", margin: "auto" }}>
        {activities.map((activity) => (
          <Paper
            key={activity.uuid}
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
            <Box>
              <Typography variant="h6">{activity.name}</Typography>
              <Typography>Description: {activity.description}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/activities/${activity.uuid}`)}
              >
                Sélectionner
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "orange" }}
                onClick={() => navigate(`/activities/edit/${activity.uuid}`)}
              >
                Modifier
              </Button>
              <Button variant="contained" color="error">
                Supprimer
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: "center" }}>
        <Button variant="contained" color="success" onClick={handleAddActivity}>
          Ajouter une Activité
        </Button>
      </Box>
    </Box>
  );
};

export default Activities;
