import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton, Button } from "@mui/material";
import { ArrowBack, Edit, Delete, Visibility } from "@mui/icons-material";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const Treatments = () => {
  const [treatments, setTreatments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await axios.get("/treatments");
        setTreatments(response.data["hydra:member"]);
      } catch (error) {
        console.error("Failed to fetch treatments", error);
      }
    };
    fetchTreatments();
  }, []);

  const handleSelect = (uuid) => {
    navigate(`/treatments/${uuid}`);
  };

  const handleEdit = (uuid) => {
    navigate(`/treatments/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/treatments/${uuid}`);
      setTreatments(treatments.filter((treatment) => treatment.uuid !== uuid));
    } catch (error) {
      console.error("Failed to delete treatment", error);
    }
  };

  const handleAddTreatment = () => {
    navigate("/treatments/add");
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
        Liste des Traitements
      </Typography>

      <Box
        sx={{
          maxWidth: "800px",
          margin: "auto",
        }}
      >
        {treatments.map((treatment) => (
          <Paper
            key={treatment.uuid}
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
              <Typography variant="h6">{treatment.name}</Typography>
              {treatment.child && (
                <Typography>
                  Enfant : {treatment.child.firstname}{" "}
                  {treatment.child.lastname}
                </Typography>
              )}
              <Typography>
                Début : {dayjs(treatment.startAt).format("DD-MM-YYYY")}
              </Typography>
              <Typography>
                Fin : {dayjs(treatment.endAt).format("DD-MM-YYYY")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                color="primary"
                onClick={() => handleSelect(treatment.uuid)}
              >
                <Visibility />
              </IconButton>
              <IconButton
                color="warning"
                onClick={() => handleEdit(treatment.uuid)}
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDelete(treatment.uuid)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleAddTreatment}
        >
          Ajouter un Traitement
        </Button>
      </Box>
    </Box>
  );
};

export default Treatments;
