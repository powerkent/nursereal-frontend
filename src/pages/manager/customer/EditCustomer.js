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
import "react-phone-input-2/lib/style.css";
import axios from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";

const EditCustomer = () => {
  const { uuid } = useParams();
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
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`/customers/${uuid}`);
        setFirstname(response.data.firstname);
        setLastname(response.data.lastname);
        setEmail(response.data.email);
      } catch (err) {
        setError("Failed to load customer details.");
      }
    };
    fetchCustomer();
  }, [uuid]);

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
    <Layout>
      <Box
        sx={{ width: "400px", margin: "auto", padding: 4, textAlign: "center" }}
      >
        <Typography variant="h4" gutterBottom>
          Modifier le Parent
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
            label="Nom"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
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
              renderValue={(selected) => selected.join(", ")}
            >
              {children.map((child) => (
                <MenuItem
                  key={child.uuid}
                  value={child.firstname + " " + child.lastname}
                >
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
            Modifier
          </Button>
        </form>
      </Box>
    </Layout>
  );
};

export default EditCustomer;
