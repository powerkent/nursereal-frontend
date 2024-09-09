import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import axios from "../../../api/axios";
import { useParams, useNavigate } from "react-router-dom";

const EditActivity = () => {
  const { uuid } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(`/activities/${uuid}`);
        setName(response.data.name);
        setDescription(response.data.description);
      } catch (err) {
        setError("Failed to load activity details.");
      }
    };
    fetchActivity();
  }, [uuid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/activities/${uuid}`, { name, description });
      navigate("/activities");
    } catch (err) {
      setError("Failed to update the activity. Please try again.");
    }
  };

  return (
    <Box
      sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
    >
      <Typography variant="h4" gutterBottom>
        Modifier l'Activité
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Nom de l'Activité"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Modifier
        </Button>
      </form>
    </Box>
  );
};

export default EditActivity;
