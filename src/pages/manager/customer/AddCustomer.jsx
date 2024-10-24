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
import PhoneInput from "react-phone-input-2";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import "react-phone-input-2/lib/style.css";

const AddCustomer = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get("/children");
        setChildren(response.data["hydra:member"]);
      } catch (error) {
        console.error("Failed to fetch children", error);
      }
    };
    fetchChildren();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const childrenWithUuid = selectedChildren.map((childUuid) => ({
      uuid: childUuid,
    }));

    const requestBody = {
      firstname,
      lastname,
      email,
      password,
      phoneNumber: parseInt(phoneNumber, 10),
      children: childrenWithUuid,
    };

    try {
      await axios.post("/customers", requestBody);
      navigate("/customers");
    } catch (err) {
      setError("Failed to add the customer. Please try again.");
    }
  };

  return (
    <Box
      sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
    >
      <Typography variant="h4" gutterBottom>
        Ajouter un Parent
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
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <PhoneInput
          country={"fr"}
          value={phoneNumber}
          onChange={setPhoneNumber}
          inputStyle={{ width: "100%", marginBottom: "16px" }}
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Enfants</InputLabel>
          <Select
            multiple
            value={selectedChildren}
            onChange={(e) => setSelectedChildren(e.target.value)}
            renderValue={(selected) =>
              selected
                .map((uuid) => {
                  const child = children.find((child) => child.uuid === uuid);
                  return child ? `${child.firstname} ${child.lastname}` : "";
                })
                .join(", ")
            }
          >
            {children.map((child) => (
              <MenuItem key={child.uuid} value={child.uuid}>
                {child.firstname} {child.lastname}
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

export default AddCustomer;
