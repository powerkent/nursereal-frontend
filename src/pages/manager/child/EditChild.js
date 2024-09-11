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
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./EditChild.css";
import Layout from "../../../components/Layout";

const EditChild = () => {
  const { uuid } = useParams();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [nursery, setNursery] = useState("");
  const [nurseries, setNurseries] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const response = await axios.get(`/children/${uuid}`);
        setFirstname(response.data.firstname);
        setLastname(response.data.lastname);
        setBirthday(dayjs(response.data.birthday).format("YYYY-MM-DD"));
        setNursery(response.data.nurseryStructure?.uuid || ""); // Préremplir la crèche
      } catch (err) {
        setError("Failed to load child details.");
      }
    };
    fetchChild();
  }, [uuid]);

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
      await axios.put(`/children/${uuid}`, {
        firstname,
        lastname,
        birthday,
        nurseryStructure: nursery,
      });
      navigate("/children");
    } catch (err) {
      setError("Failed to update the child. Please try again.");
    }
  };

  return (
    <Layout>
      <Box
        sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
      >
        <Typography variant="h4" gutterBottom>
          Modifier un Enfant
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
            Modifier
          </Button>
        </form>
      </Box>
    </Layout>
  );
};

export default EditChild;
