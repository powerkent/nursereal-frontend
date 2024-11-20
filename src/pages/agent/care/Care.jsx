import React, { useEffect, useState, useContext } from "react";
import {
  Avatar,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "../../../api/axios";
import { SelectedNurseryContext } from "../../../contexts/SelectedNurseryContext";
import dayjs from "dayjs";
import { Visibility, Healing, Face, Hearing } from "@mui/icons-material";
import "./Care.css";

const Care = () => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [presentChildren, setPresentChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [selectedCareTypes, setSelectedCareTypes] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPresentChildren = async () => {
      if (!selectedNurseryUuid) return;
      setLoading(true);
      try {
        const todayDate = dayjs().format("YYYY-MM-DD");
        const response = await axios.get(
          `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=presence&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59`
        );
        if (response.data["hydra:member"]) {
          const actions = response.data["hydra:member"];
          const presentChildrenData = actions
            .filter((action) => !action.presence.isAbsent)
            .map((action) => ({
              childUuid: action.child.uuid,
              avatar: action.child.avatar,
              firstname: action.child.firstname,
              lastname: action.child.lastname,
            }));
          setPresentChildren(presentChildrenData);
        }
      } catch (error) {
        console.error("Error fetching present children:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresentChildren();
  }, [selectedNurseryUuid]);

  const handleChildClick = (childUuid) => {
    setSelectedChildren((prevSelected) => {
      if (prevSelected.includes(childUuid)) {
        return prevSelected.filter((uuid) => uuid !== childUuid);
      }
      return [...prevSelected, childUuid];
    });
  };

  const handleCareTypeClick = (careType) => {
    setSelectedCareTypes((prevSelected) => {
      if (prevSelected.includes(careType)) {
        return prevSelected.filter((type) => type !== careType);
      }
      return [...prevSelected, careType];
    });
  };

  const handleSubmit = async () => {
    if (selectedCareTypes.length === 0 || selectedChildren.length === 0) {
      alert(
        "Veuillez sélectionner au moins un enfant et au moins un type de soin."
      );
      return;
    }
    setLoading(true);
    try {
      const promises = selectedChildren.map((childUuid) => {
        const careData = {
          childUuid,
          actionType: "care",
          comment,
          care: {
            careTypes: selectedCareTypes,
          },
        };
        return axios.post("/actions", careData);
      });
      await Promise.all(promises);
      setSelectedChildren([]);
      setSelectedCareTypes([]);
      setComment("");
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 6000);
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
      setErrorMessage("Une erreur s'est produite lors de l'envoi des données.");
      setTimeout(() => {
        setErrorMessage("");
      }, 6000);
    } finally {
      setLoading(false);
    }
  };

  const careTypes = [
    { key: "eye_care", label: "Yeux", icon: <Visibility fontSize="large" /> },
    { key: "nose_care", label: "Nez", icon: <Healing fontSize="large" /> },
    { key: "mouth_care", label: "Bouche", icon: <Face fontSize="large" /> },
    { key: "ear_care", label: "Oreilles", icon: <Hearing fontSize="large" /> },
  ];

  return (
    <Box className="care-container">
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccessMessage(false)}
          severity="success"
          variant="filled"
        >
          Les données ont été enregistrées avec succès.
        </Alert>
      </Snackbar>

      {/* Notification d'erreur */}
      {errorMessage && (
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setErrorMessage("")}
            severity="error"
            variant="filled"
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      )}

      <Typography variant="h5" className="care-title">
        Suivi des soins
      </Typography>

      {/* Sélection des enfants présents */}
      <Box className="children-selection">
        <Typography variant="h6">Enfants présents</Typography>
        <Box className="children-list">
          {presentChildren.length === 0 ? (
            <Typography>Aucun enfant présent</Typography>
          ) : (
            presentChildren.map((child) => (
              <Box
                key={child.childUuid}
                className={`child-item ${
                  selectedChildren.includes(child.childUuid) ? "selected" : ""
                }`}
                onClick={() => handleChildClick(child.childUuid)}
              >
                <Avatar
                  src={`${child.avatar}`}
                  alt={`${child.firstname} ${child.lastname}`}
                  className="child-avatar"
                />
                <Typography variant="body1" className="child-name">
                  {child.firstname} {child.lastname}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Sélection des types de soin */}
      <Box className="care-type-selection">
        <Typography variant="h6">Types de soin</Typography>
        <Box className="care-type-buttons">
          {careTypes.map((type) => (
            <Button
              key={type.key}
              variant={
                selectedCareTypes.includes(type.key) ? "contained" : "outlined"
              }
              onClick={() => handleCareTypeClick(type.key)}
              className="care-type-button"
            >
              <Box className="care-type-content">
                {type.icon}
                <Typography variant="body1">{type.label}</Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>

      {/* Champ de commentaire */}
      <Box className="comment-field">
        <TextField
          label="Commentaire"
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Box>

      {/* Bouton Soumettre */}
      <Box className="submit-button">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Soumettre"}
        </Button>
      </Box>
    </Box>
  );
};

export default Care;