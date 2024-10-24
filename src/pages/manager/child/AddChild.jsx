import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const AddChild = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [nursery, setNursery] = useState("");
  const [nurseries, setNurseries] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const response = await axios.get("/nursery_structures");
        setNurseries(response.data["hydra:member"]);
      } catch (err) {
        setError("Failed to fetch nurseries.");
      }
    };
    fetchNurseries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/children", {
        firstname,
        lastname,
        birthday,
        nurseryStructureUuid: nursery,
      });
      navigate("/children");
    } catch (err) {
      setError("Failed to add the child. Please try again.");
    }
  };

  return (
    <Box
      sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
    >
      <Typography variant="h4" gutterBottom>
        Ajouter un Enfant
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Prénom"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Nom"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Date de Naissance"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Crèche</InputLabel>
          <Select
            value={nursery}
            onChange={(e) => setNursery(e.target.value)}
            required
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
          Ajouter
        </Button>
      </form>
    </Box>
  );
};

export default AddChild;
