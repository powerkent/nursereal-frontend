import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import axios from "../../../api/axios";
import dayjs from "dayjs";
import Layout from "../../../components/Layout";

const Treatment = () => {
  const { uuid } = useParams();
  const [treatment, setTreatment] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        const response = await axios.get(`/treatments/${uuid}`);
        setTreatment(response.data);
      } catch (err) {
        setError("Failed to fetch treatment details.");
      }
    };
    fetchTreatment();
  }, [uuid]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/treatments/${uuid}`);
      navigate("/treatments");
    } catch (error) {
      console.error("Failed to delete treatment", error);
    }
  };

  if (!treatment) {
    return <Typography variant="h6">{error || "Loading..."}</Typography>;
  }

  return (
    <Layout>
      <Box sx={{ padding: 4 }}>
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
            {treatment.name}
          </Typography>

          <Typography variant="body1" gutterBottom>
            Description : {treatment.description}
          </Typography>

          <Typography variant="body1" gutterBottom>
            Enfant : {treatment.child?.firstname} {treatment.child?.lastname}
          </Typography>

          <Typography variant="body1" gutterBottom>
            Date de début : {dayjs(treatment.startAt).format("DD/MM/YYYY")}
          </Typography>

          <Typography variant="body1" gutterBottom>
            Date de fin : {dayjs(treatment.endAt).format("DD/MM/YYYY")}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Doses :
          </Typography>
          {treatment.dosages && treatment.dosages.length > 0 ? (
            treatment.dosages.map((dosage, index) => (
              <Typography key={index} variant="body2">
                - Dose : {dosage.dose}, Heure de dosage : {dosage.dosingTime}
              </Typography>
            ))
          ) : (
            <Typography variant="body2">Aucune dose définie.</Typography>
          )}

          <Box
            sx={{
              marginTop: 3,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <IconButton
              color="primary"
              onClick={() => navigate(`/treatments/edit/${uuid}`)}
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Treatment;
