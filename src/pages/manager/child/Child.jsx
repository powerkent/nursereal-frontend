import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, IconButton } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../../api/axios";
import dayjs from "dayjs";
import Layout from "../../../components/Layout";

const Child = () => {
  const { uuid } = useParams();
  const [child, setChild] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const response = await axios.get(`/children/${uuid}`);
        setChild(response.data);
      } catch (err) {
        setError("Failed to fetch child details.");
      }
    };
    fetchChild();
  }, [uuid]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/children/${uuid}`);
      navigate("/children");
    } catch (error) {
      console.error("Failed to delete child", error);
    }
  };

  if (!child) {
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
            {child.firstname} {child.lastname}
          </Typography>
          <Typography variant="body1">
            Date de Naissance: {dayjs(child.birthday).format("DD/MM/YYYY")}
          </Typography>
          <Typography variant="h4">
            Crèche:{" "}
            {child.nurseryStructure
              ? child.nurseryStructure.name
              : "Non assigné"}
          </Typography>
          <Typography variant="h4" gutterBottom>
            Parents :
          </Typography>
          {child.customers && child.customers.length > 0 ? (
            child.customers.map((parent) => (
              <Typography key={parent.uuid} variant="body2">
                {parent.firstname} {parent.lastname} ({parent.email})
              </Typography>
            ))
          ) : (
            <Typography variant="body2">Aucun parent assigné</Typography>
          )}

          <Box sx={{ marginTop: 3 }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginRight: 2 }}
              onClick={() => navigate(`/children/edit/${uuid}`)}
            >
              Modifier
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Supprimer
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Child;
