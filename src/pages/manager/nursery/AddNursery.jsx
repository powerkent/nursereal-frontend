import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  TextField,
  Paper,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";

const AddNursery = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [openings, setOpenings] = useState([
    {
      openingHour: dayjs("08:00", "HH:mm"),
      closingHour: dayjs("19:00", "HH:mm"),
      openingDay: "",
    },
  ]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const daysOfWeek = [
    { french: "Lundi", english: "Monday" },
    { french: "Mardi", english: "Tuesday" },
    { french: "Mercredi", english: "Wednesday" },
    { french: "Jeudi", english: "Thursday" },
    { french: "Vendredi", english: "Friday" },
    { french: "Samedi", english: "Saturday" },
    { french: "Dimanche", english: "Sunday" },
  ];

  const handleOpeningsChange = (index, field, value) => {
    const updatedOpenings = [...openings];
    updatedOpenings[index][field] = value;
    setOpenings(updatedOpenings);
  };

  const addOpeningField = () => {
    setOpenings([
      ...openings,
      {
        openingHour: dayjs("08:00", "HH:mm"),
        closingHour: dayjs("19:00", "HH:mm"),
        openingDay: "",
      },
    ]);
  };

  const removeOpeningField = (index) => {
    const updatedOpenings = openings.filter((_, i) => i !== index);
    setOpenings(updatedOpenings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/nursery_structures", {
        name,
        address,
        openings: openings.map((opening) => ({
          openingHour: opening.openingHour.format("HH:mm"),
          closingHour: opening.closingHour.format("HH:mm"),
          openingDay: opening.openingDay,
        })),
      });
      navigate("/nurseries");
    } catch (err) {
      setError("Failed to add the nursery. Please try again.");
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: "40%",
        margin: "auto",
        padding: 6,
        textAlign: "center",
        backgroundColor: "#fafafa",
        borderRadius: "12px",
        marginTop: 8,
      }}
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

        {openings.map((opening, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              gap: 2,
              marginTop: 4,
              alignItems: "center",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Heure d'ouverture"
                value={opening.openingHour}
                onChange={(newValue) =>
                  handleOpeningsChange(index, "openingHour", newValue)
                }
                ampm={false}
                renderInput={(params) => (
                  <TextField fullWidth margin="normal" {...params} />
                )}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Heure de fermeture"
                value={opening.closingHour}
                onChange={(newValue) =>
                  handleOpeningsChange(index, "closingHour", newValue)
                }
                ampm={false}
                renderInput={(params) => (
                  <TextField fullWidth margin="normal" {...params} />
                )}
              />
            </LocalizationProvider>

            <FormControl fullWidth sx={{ flex: 2 }}>
              <InputLabel>Jour</InputLabel>
              <Select
                value={opening.openingDay}
                onChange={(e) =>
                  handleOpeningsChange(index, "openingDay", e.target.value)
                }
                required
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day.english} value={day.english}>
                    {day.french}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton color="error" onClick={() => removeOpeningField(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <IconButton onClick={addOpeningField} sx={{ marginTop: 4 }}>
          <AddIcon /> Ajouter un créneau
        </IconButton>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 4 }}
        >
          Ajouter
        </Button>
      </form>
    </Paper>
  );
};

export default AddNursery;
