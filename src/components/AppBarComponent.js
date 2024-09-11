import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChildCareIcon from "@mui/icons-material/ChildCare"; // Import de l'icône enfant
import { useNavigate } from "react-router-dom";

const AppBarComponent = ({ isManager, toggleDrawer, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Menu burger à gauche */}
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

        {/* Logo centré */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => navigate("/")}
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ChildCareIcon sx={{ marginRight: 1 }} />
            <Typography variant="h6">NURSEREAL</Typography>
          </IconButton>
        </div>

        {/* Bouton de déconnexion à droite */}
        <IconButton edge="end" color="inherit" onClick={handleLogout}>
          Déconnexion
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
