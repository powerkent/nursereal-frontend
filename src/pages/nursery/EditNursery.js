import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs"; // Import dayjs
import axios from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";

const EditNursery = () => {
  const { uuid } = useParams();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [startAt, setStartAt] = useState(dayjs());
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNursery = async () => {
      try {
        const response = await axios.get(`/nursery_structures/${uuid}`);
        setName(response.data.name);
        setAddress(response.data.address);
        setStartAt(dayjs(response.data.startAt));
      } catch (err) {
        setError("Failed to load nursery details.");
      }
    };
    fetchNursery();
  }, [uuid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/nursery_structures/${uuid}`, {
        name,
        address,
        startAt: startAt.toISOString(),
      });
      navigate(`/nurseries/${uuid}`);
    } catch (err) {
      setError("Failed to update the nursery. Please try again.");
    }
  };

  return (
    <Box
      sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
    >
      <Typography variant="h4" gutterBottom>
        Modifier une Crèche
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
          Modifier
        </Button>
      </form>
    </Box>
  );
};

export default EditNursery;
