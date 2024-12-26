import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import axios from "../../../api/axios";
import { SelectedNurseryContext } from "../../../contexts/SelectedNurseryContext";
import "./Treatment.css";

const Treatment = () => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [presentChildren, setPresentChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childTreatments, setChildTreatments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [dose, setDose] = useState("");
  const [dosingTime, setDosingTime] = useState(dayjs());
  const [temperature, setTemperature] = useState("");
  const [comment, setComment] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem("AGENT_LOGIN_WITH_PHONE")) ?? false;
  const currentAgentUuid = localStorage.getItem("uuid");
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
          const present = actions
            .filter((action) => !action.presence.isAbsent)
            .map((action) => ({
              childUuid: action.child.uuid,
              avatar: action.child.avatar,
              firstname: action.child.firstname,
              lastname: action.child.lastname,
            }));
          setPresentChildren(present);
        }
      } catch (error) {
        console.error("Error fetching present children:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresentChildren();
  }, [selectedNurseryUuid]);

  useEffect(() => {
    const getAgents = async () => {
      if (agentLoginWithPhone || !selectedNurseryUuid) return;
      try {
        const response = await axios.get(
          `/agents?nursery_structure_uuid=${selectedNurseryUuid}`
        );
        if (response.data["hydra:member"]) {
          setAgents(response.data["hydra:member"]);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    getAgents();
  }, [agentLoginWithPhone, selectedNurseryUuid]);

  const handleSelectChild = async (child) => {
    if (selectedChild && selectedChild.childUuid === child.childUuid) {
      setSelectedChild(null);
      setChildTreatments([]);
      return;
    }

    setSelectedChild(child);
    try {
      setLoading(true);
      const response = await axios.get(`/children/${child.childUuid}`);
      const data = response.data;
      setChildTreatments(data.treatments || []);
    } catch (error) {
      console.error("Error fetching child treatments:", error);
      setChildTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTreatment = (treatment) => {
    setSelectedTreatment(treatment);
    setDose("");
    setDosingTime(dayjs());
    setTemperature("");
    setComment("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTreatment(null);
  };

  const handleSubmitTreatment = async () => {
    if (!selectedChild || !selectedTreatment) return;

    if (!agentLoginWithPhone && !selectedAgentUuid) {
      alert("Veuillez sélectionner un agent.");
      return;
    }

    setDialogLoading(true);
    try {
      const payload = {
        childUuid: selectedChild.childUuid,
        actionType: "treatment",
        comment: comment,
        treatment: {
          uuid: selectedTreatment.uuid,
          dose: dose,
          dosingTime: dosingTime.format("HH:mm"),
          temperature: parseFloat(temperature) || 0,
        },
      };

      if (!agentLoginWithPhone && selectedAgentUuid) {
        payload.agentUuid = selectedAgentUuid;
      }

      await axios.post("/actions", payload);

      setSuccessMessage("Traitement enregistré avec succès.");
      setTimeout(() => setSuccessMessage(""), 6000);

      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors de l'envoi du traitement :", error);
      setErrorMessage(
        "Une erreur s'est produite lors de l'envoi du traitement."
      );
      setTimeout(() => setErrorMessage(""), 6000);
    } finally {
      setDialogLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="treatment-loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="treatment-container">
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {errorMessage && (
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="error"
            variant="filled"
            onClose={() => setErrorMessage("")}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      )}

      <Typography variant="h5" className="treatment-title">
        Traitements
      </Typography>

      <Box className="children-selection">
        <Typography variant="h6">Enfants présents</Typography>
        {presentChildren.length === 0 ? (
          <Typography>Aucun enfant présent</Typography>
        ) : (
          <Box className="treatment-children-list">
            {presentChildren.map((child) => {
              const isSelected =
                selectedChild && selectedChild.childUuid === child.childUuid;
              return (
                <Box
                  key={child.childUuid}
                  className={`treatment-child-item ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleSelectChild(child)}
                >
                  <Avatar
                    src={child.avatar}
                    alt={`${child.firstname} ${child.lastname}`}
                    className="treatment-child-avatar"
                  />
                  <Typography variant="body1" className="treatment-child-name">
                    {child.firstname} {child.lastname}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {selectedChild && (
        <Box className="child-treatments">
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Traitements de {selectedChild.firstname} {selectedChild.lastname}
          </Typography>

          {childTreatments.length === 0 ? (
            <Typography>Aucun traitement</Typography>
          ) : (
            <Box className="treatments-list">
              {childTreatments.map((treatment) => (
                <Box
                  key={treatment.uuid}
                  className="treatment-item"
                  onClick={() => handleSelectTreatment(treatment)}
                >
                  <Typography variant="subtitle1" className="treatment-name">
                    {treatment.name}
                  </Typography>
                  <Typography variant="body2" className="treatment-description">
                    {treatment.description}
                  </Typography>

                  {Array.isArray(treatment.dosages) &&
                    treatment.dosages.length > 0 && (
                      <Box sx={{ marginTop: 1 }}>
                        {treatment.dosages.map((doseObj, idx) => (
                          <Typography key={idx} variant="body2">
                            - {doseObj.dose} à {doseObj.dosingTime}
                          </Typography>
                        ))}
                      </Box>
                    )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {selectedChild && !agentLoginWithPhone && (
        <Box className="agent-selection" sx={{ marginTop: 2 }}>
          <Typography variant="h6">Sélectionner un agent</Typography>
          <Box className="agent-list">
            {agents
              .filter((agent) => agent.uuid !== currentAgentUuid)
              .map((agent) => {
                const isSelected = agent.uuid === selectedAgentUuid;
                return (
                  <Box
                    key={agent.uuid}
                    className={`agent-box ${
                      isSelected ? "agent-selected" : ""
                    }`}
                    onClick={() => setSelectedAgentUuid(agent.uuid)}
                  >
                    <Avatar
                      src={agent.avatar}
                      alt={`${agent.firstname} ${agent.lastname}`}
                      className="treatment-child-avatar"
                    />
                    <Typography
                      variant="body1"
                      className="treatment-child-name"
                    >
                      {agent.firstname} {agent.lastname}
                    </Typography>
                  </Box>
                );
              })}
          </Box>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Administrer le traitement</DialogTitle>
        <DialogContent>
          <TextField
            label="Dose"
            fullWidth
            sx={{ marginTop: 1 }}
            value={dose}
            onChange={(e) => setDose(e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Heure de prise"
              ampm={false}
              value={dosingTime}
              onChange={(newValue) => setDosingTime(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ marginTop: 2 }} />
              )}
            />
          </LocalizationProvider>

          <TextField
            label="Température"
            fullWidth
            sx={{ marginTop: 2 }}
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />

          <TextField
            label="Commentaire"
            multiline
            rows={3}
            fullWidth
            sx={{ marginTop: 2 }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Annuler
          </Button>
          <Button
            onClick={handleSubmitTreatment}
            color="primary"
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : "Soumettre"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Treatment;
