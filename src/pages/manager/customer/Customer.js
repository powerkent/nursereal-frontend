import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, IconButton } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../../api/axios";

const Customer = () => {
  const { uuid } = useParams(); // Retrieve the customer ID from the URL
  const [customer, setCustomer] = useState(null); // Customer data state
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`/customers/${uuid}`);
        setCustomer(response.data);
      } catch (err) {
        setError("Failed to fetch customer details.");
      }
    };
    fetchCustomer();
  }, [uuid]);

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/customers/${uuid}`);
      navigate(`/customers`);
    } catch (error) {
      console.error("Failed to delete customer", error);
    }
  };

  if (!customer) {
    return <Typography variant="h6">{error || "Loading..."}</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      {/* Back Button */}
      <IconButton
        sx={{ position: "absolute", top: 10, left: 10 }}
        onClick={() => navigate("/customers")}
      >
        <ArrowBack />
      </IconButton>

      <Paper
        sx={{
          padding: 3,
          backgroundColor: "#f5f5f5",
          margin: "auto",
          marginTop: "60px",
          maxWidth: "600px", // Limite la largeur maximale
          textAlign: "center", // Centre le texte
          boxShadow: 3, // Ajoute un peu d'ombre
        }}
      >
        <Typography variant="h4" gutterBottom>
          {customer.firstname} {customer.lastname}
        </Typography>
        <Typography variant="body1">Email: {customer.email}</Typography>
        <Typography variant="body1">
          Numéro de téléphone: {customer.phoneNumber}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
          Enfants
        </Typography>
        {customer.children.length > 0 ? (
          customer.children.map((child) => (
            <Typography key={child.uuid} variant="body1">
              {child.firstname} {child.lastname}
            </Typography>
          ))
        ) : (
          <Typography variant="body1">Pas d'enfants associés.</Typography>
        )}

        <Box sx={{ marginTop: 3 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginRight: 2 }}
            onClick={() => navigate(`/customers/edit/${uuid}`)}
          >
            Modifier
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(customer.uuid)}
          >
            Supprimer
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Customer;
