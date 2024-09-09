import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [isManager, setIsManager] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      const decodedToken = jwtDecode(token);
      const roles = decodedToken.roles || [];
      setIsManager(roles.includes("ROLE_MANAGER"));
    }
  }, [navigate]);

  const sections = [
    { title: "Crèches", path: "/nurseries" },
    { title: "Agents", path: "/agents" },
    { title: "Enfants", path: "/children" },
    { title: "Parents", path: "/customers" },
    { title: "Traitements", path: "/treatments" },
    { title: "Contrats", path: "/contracts" },
  ];

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {isManager && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {sections.map((section) => (
              <ListItem
                button
                key={section.title}
                onClick={() => {
                  navigate(section.path);
                  toggleDrawer(false);
                }}
              >
                <ListItemText primary={section.title} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Actualités
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
