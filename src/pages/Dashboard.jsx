import React from "react";
import { Typography } from "@mui/material";
import Layout from "../components/Layout"; // Importer le layout

const Dashboard = () => {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom align="center">
        Actualités
      </Typography>
      {/* Autres composants spécifiques au Dashboard */}
    </Layout>
  );
};

export default Dashboard;
