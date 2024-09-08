import React, { useEffect } from "react";
import { Box, Grid, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const sections = [
    { title: "Crèches", path: "/nurseries" },
    { title: "Agents", path: "/agents" },
    { title: "Enfants", path: "/children" },
    { title: "Parents", path: "/parents" },
    { title: "Traitements", path: "/treatments" },
    { title: "Activités", path: "/activities" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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

      {/* Responsive Grid to ensure blocks adapt to screen size */}
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
