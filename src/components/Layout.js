import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AppBarComponent from "./AppBarComponent";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import BusinessIcon from "@mui/icons-material/Business";
import FaceIcon from "@mui/icons-material/Face";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Layout = ({ children }) => {
  const [isManager, setIsManager] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sections = [
    {
      title: "Crèches",
      path: "/nurseries",
      icon: <BusinessIcon />,
      parent: "/",
    },
    { title: "Ajouter Crèche", path: "/nurseries/add", parent: "/nurseries" },
    {
      title: "Modifier Crèche",
      path: "/nurseries/edit/:uuid",
      parent: "/nurseries",
    },

    { title: "Agents", path: "/agents", icon: <PeopleIcon />, parent: "/" },
    { title: "Ajouter Agent", path: "/agents/add", parent: "/agents" },
    { title: "Modifier Agent", path: "/agents/edit/:uuid", parent: "/agents" },

    {
      title: "Enfants",
      path: "/children",
      icon: <ChildCareIcon />,
      parent: "/",
    },
    { title: "Ajouter Enfant", path: "/children/add", parent: "/children" },
    {
      title: "Modifier Enfant",
      path: "/children/edit/:uuid",
      parent: "/children",
    },

    { title: "Parents", path: "/customers", icon: <FaceIcon />, parent: "/" },
    { title: "Ajouter Parent", path: "/customers/add", parent: "/customers" },
    {
      title: "Modifier Parent",
      path: "/customers/edit/:uuid",
      parent: "/customers",
    },

    {
      title: "Traitements",
      path: "/treatments",
      icon: <AssignmentIcon />,
      parent: "/",
    },

    { title: "Contrats", path: "/contracts", icon: <HomeIcon />, parent: "/" },
    { title: "Ajouter Contrat", path: "/contracts/add", parent: "/contracts" },
  ];

  const getPreviousPage = () => {
    const currentSection = sections.find((section) =>
      location.pathname.startsWith(section.path)
    );

    if (currentSection && currentSection.parent !== "/") {
      return currentSection.parent;
    }
    return null;
  };

  const previousPage = getPreviousPage();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBarComponent
        isManager={isManager}
        toggleDrawer={toggleDrawer}
        handleLogout={handleLogout}
      />

      {location.pathname !== "/" && previousPage && (
        <IconButton
          onClick={() => navigate(previousPage)}
          sx={{ position: "absolute", top: 100, left: 50 }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {sections
              .filter((section) => section.icon)
              .map((section) => (
                <ListItem
                  button
                  key={section.title}
                  onClick={() => {
                    navigate(section.path);
                    toggleDrawer(false);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <ListItemIcon>{section.icon}</ListItemIcon>
                  <ListItemText primary={section.title} />
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ padding: 4 }}>{children}</Box>
    </Box>
  );
};

export default Layout;
