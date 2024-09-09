import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../api/axios";

const EditTreatment = () => {
  const { uuid } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        const response = await axios.get(`/treatments/${uuid}`);
        setName(response.data.name);
        setDescription(response.data.description);
      } catch (err) {
        setError("Failed to load treatment details.");
      }
    };
    fetchTreatment();
  }, [uuid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/treatments/${uuid}`, { name, description });
      navigate("/treatments");
    } catch (err) {
      setError("Failed to update the treatment. Please try again.");
    }
  };

  return (
    <Box
      sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
    >
      <IconButton
        sx={{ position: "absolute", top: 10, left: 10 }}
        onClick={() => navigate("/treatments")}
      >
        <ArrowBack />
      </IconButton>

      <Typography variant="h4" gutterBottom>
        Modifier un Traitement
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Nom du Traitement"
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
          Enregistrer les modifications
        </Button>
      </form>
    </Box>
  );
};

export default EditTreatment;
