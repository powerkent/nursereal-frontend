import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs"; // Import dayjs
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AddNursery = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [startAt, setStartAt] = useState(dayjs()); // Use dayjs() instead of new Date()
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/nursery_structures", {
        name,
        address,
        startAt: startAt.toISOString(),
      }); // Send as ISO string
      navigate("/nurseries"); // Redirect to nursery list after adding
    } catch (err) {
      setError("Failed to add the nursery. Please try again.");
    }
  };

  return (
    <Box
      sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
    >
      <Typography variant="h4" gutterBottom>
        Ajouter une Crèche
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Nom de la Crèche"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Adresse"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          margin="normal"
          required
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Date et heure de début"
            value={startAt}
            onChange={(newValue) => setStartAt(newValue)}
            renderInput={(params) => (
              <TextField fullWidth margin="normal" {...params} />
            )}
          />
        </LocalizationProvider>
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

export default AddNursery;
