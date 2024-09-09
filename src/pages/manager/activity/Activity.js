import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, IconButton } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../../api/axios";

const Activity = () => {
  const { uuid } = useParams();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(`/activities/${uuid}`);
        setActivity(response.data);
      } catch (err) {
        setError("Failed to fetch activity details.");
      }
    };
    fetchActivity();
  }, [uuid]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/activities/${uuid}`);
      navigate("/activities");
    } catch (error) {
      console.error("Failed to delete activity", error);
    }
  };

  if (!activity) {
    return <Typography variant="h6">{error || "Loading..."}</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <IconButton
        sx={{ position: "absolute", top: 10, left: 10 }}
        onClick={() => navigate("/activities")}
      >
        <ArrowBack />
      </IconButton>

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
          {activity.name}
        </Typography>
        <Typography variant="body1">
          Description: {activity.description}
        </Typography>
        <Box sx={{ marginTop: 3 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginRight: 2 }}
            onClick={() => navigate(`/activities/edit/${uuid}`)}
          >
            Modifier
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Supprimer
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Activity;
