import React, { useEffect, useState } from "react";
import { Box, Grid, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [isManager, setIsManager] = useState(false);
  const [showSections, setShowSections] = useState(false); // Pour afficher les sections après avoir cliqué sur "Manager"
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const decodedToken = jwtDecode(token);
    const roles = decodedToken.roles || [];
    setIsManager(roles.includes("ROLE_MANAGER"));
  }, [navigate]);

  const sections = [
    { title: "Crèches", path: "/nurseries" },
    { title: "Agents", path: "/agents" },
    { title: "Enfants", path: "/children" },
    { title: "Parents", path: "/customers" },
    { title: "Traitements", path: "/treatments" },
    { title: "Activités", path: "/activities" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleShowSections = () => {
    setShowSections(true); // Afficher les sections
    setIsManager(false); // Retirer la box "Manager"
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", color: "#2c3e50" }}
      >
        Dashboard
      </Typography>

      {isManager && !showSections && (
        <Button
          variant="contained"
          onClick={handleShowSections}
          sx={{ marginBottom: 4, display: "block", margin: "auto" }}
        >
          Manager
        </Button>
      )}

      {showSections && (
        <Grid container spacing={2} justifyContent="center">
          {sections.map((section) => (
            <Grid item key={section.title} xs={12} sm={6} md={4} lg={2}>
              <Paper
                sx={{
                  padding: 3,
                  textAlign: "center",
                  backgroundColor: "#2980b9",
                  color: "white",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 6px 30px rgba(0, 0, 0, 0.2)",
                  },
                }}
                onClick={() => navigate(section.path)}
              >
                <Typography variant="h6" sx={{ fontWeight: "500" }}>
                  {section.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ marginTop: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          sx={{
            backgroundColor: "#e74c3c",
            padding: "10px 20px",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#c0392b" },
          }}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
