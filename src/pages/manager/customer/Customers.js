import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("/customers");
        setCustomers(response.data["hydra:member"]);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleSelect = (uuid) => {
    navigate(`/customers/${uuid}`);
  };

  const handleEdit = (uuid) => {
    navigate(`/customers/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    try {
      await axios.delete(`/customers/${uuid}`);
      setCustomers(customers.filter((customer) => customer.uuid !== uuid));
    } catch (error) {
      console.error("Failed to delete customer", error);
    }
  };

  const handleAddCustomer = () => {
    navigate("/customers/add");
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
        Liste des Parents
      </Typography>

      <Box
        sx={{
          maxWidth: "800px",
          margin: "auto",
        }}
      >
        {customers.map((customer) => (
          <Paper
            key={customer.uuid}
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
              <Typography variant="h6">
                {customer.firstname} {customer.lastname}
              </Typography>
              <Typography>Email: {customer.email}</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSelect(customer.uuid)}
              >
                Sélectionner
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "orange" }}
                onClick={() => handleEdit(customer.uuid)}
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
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: "center" }}>
        <Button variant="contained" color="success" onClick={handleAddCustomer}>
          Ajouter un Parent
        </Button>
      </Box>
    </Box>
  );
};

export default Customers;
