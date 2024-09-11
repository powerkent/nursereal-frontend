import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  Box,
  FormControlLabel,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly";
import { useNavigate } from "react-router-dom";

const AppBarComponent = ({
  isManager,
  toggleDrawer,
  handleLogout,
  isAgentMode,
  handleToggleRole,
}) => {
  const navigate = useNavigate();
  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: isAgentMode ? "pink" : "primary.main" }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>

        {isManager && (
          <FormControlLabel
            control={
              <Switch
                checked={isAgentMode}
                onChange={handleToggleRole}
                color="default"
              />
            }
            label={isAgentMode ? "Manager" : "Agent"}
            sx={{ marginLeft: 2 }}
          />
        )}

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <ChildFriendlyIcon />
          <Typography variant="h6" sx={{ marginLeft: 1 }}>
            NURSEREAL
          </Typography>
        </Box>

        <IconButton color="inherit" onClick={handleLogout}>
          Déconnexion
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
