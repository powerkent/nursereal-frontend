import React, { useEffect, useState, useContext } from "react";
import {
  Avatar,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";
import axios from "../../../api/axios";
import { SelectedNurseryContext } from "../../../contexts/SelectedNurseryContext";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./Activity.css";

const Activity = () => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);
  const [presentChildren, setPresentChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivityUuid, setSelectedActivityUuid] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [startDateTime, setStartDateTime] = useState(dayjs());
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [inProgressActivities, setInProgressActivities] = useState([]);
  const [selectedActivityRows, setSelectedActivityRows] = useState([]);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [endDateTime, setEndDateTime] = useState(dayjs());
  const [endComment, setEndComment] = useState("");

  // Récupérer les enfants présents
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

  // Récupérer les activités
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get("/activities");
        if (response.data["hydra:member"]) {
          setActivities(response.data["hydra:member"]);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, []);

  // Récupérer les activités en cours
  useEffect(() => {
    const fetchInProgressActivities = async () => {
      if (!selectedNurseryUuid) return;
      setLoading(true);
      try {
        const todayDate = dayjs().format("YYYY-MM-DD");
        const response = await axios.get(
          `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=activity&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59&state=action_in_progress`
        );
        if (response.data["hydra:member"]) {
          const actions = response.data["hydra:member"];
          const inProgressData = actions.map((action) => ({
            actionUuid: action.uuid,
            childUuid: action.child.uuid,
            avatar: action.child.avatar,
            firstname: action.child.firstname,
            lastname: action.child.lastname,
            activityUuid: action.activity.uuid,
            activityName: action.activity.name,
            startDateTime: action.activity.startDateTime,
          }));
          setInProgressActivities(inProgressData);
        }
      } catch (error) {
        console.error("Error fetching in-progress activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInProgressActivities();
  }, [selectedNurseryUuid]);

  // Gérer la sélection des enfants
  const handleChildClick = (childUuid) => {
    setSelectedChildren((prevSelected) => {
      if (prevSelected.includes(childUuid)) {
        return prevSelected.filter((uuid) => uuid !== childUuid);
      }
      return [...prevSelected, childUuid];
    });
  };

  // Ouvrir la boîte de dialogue pour la date de début
  const handleOpenDialog = () => {
    if (selectedChildren.length === 0 || !selectedActivityUuid) {
      alert("Veuillez sélectionner au moins un enfant et une activité.");
      return;
    }
    setStartDateTime(dayjs());
    setDialogOpen(true);
  };

  // Fermer la boîte de dialogue
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Soumettre l'activité
  const handleSubmitActivity = async () => {
    setDialogLoading(true);
    try {
      const promises = selectedChildren.map((childUuid) => {
        const activityData = {
          childUuid,
          actionType: "activity",
          comment,
          activity: {
            uuid: selectedActivityUuid,
            startDateTime: startDateTime.toISOString(),
          },
        };
        return axios.post("/actions", activityData);
      });
      await Promise.all(promises);
      // Réinitialiser les sélections
      setSelectedChildren([]);
      setSelectedActivityUuid("");
      setComment("");
      setSuccessMessage("Les activités ont été enregistrées avec succès.");
      setTimeout(() => {
        setSuccessMessage("");
      }, 6000);
      // Rafraîchir les activités en cours
      const fetchInProgressActivities = async () => {
        if (!selectedNurseryUuid) return;
        setLoading(true);
        try {
          const todayDate = dayjs().format("YYYY-MM-DD");
          const response = await axios.get(
            `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=activity&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59&state=action_in_progress`
          );
          if (response.data["hydra:member"]) {
            const actions = response.data["hydra:member"];
            const inProgressData = actions.map((action) => ({
              actionUuid: action.uuid,
              childUuid: action.child.uuid,
              avatar: action.child.avatar,
              firstname: action.child.firstname,
              lastname: action.child.lastname,
              activityUuid: action.activity.uuid,
              activityName: action.activity.name,
              startDateTime: action.activity.startDateTime,
            }));
            setInProgressActivities(inProgressData);
          }
        } catch (error) {
          console.error("Error fetching in-progress activities:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchInProgressActivities();
    } catch (error) {
      console.error("Erreur lors de l'envoi des activités :", error);
      setErrorMessage(
        "Une erreur s'est produite lors de l'enregistrement des activités."
      );
      setTimeout(() => {
        setErrorMessage("");
      }, 6000);
    } finally {
      setDialogLoading(false);
      handleCloseDialog();
    }
  };

  // Gérer la sélection des lignes du tableau des activités en cours
  const handleActivityRowClick = (childUuid) => {
    setSelectedActivityRows((prevSelected) => {
      if (prevSelected.includes(childUuid)) {
        return prevSelected.filter((uuid) => uuid !== childUuid);
      }
      return [...prevSelected, childUuid];
    });
  };

  // Ouvrir la boîte de dialogue pour la fin de l'activité
  const handleOpenEndDialog = () => {
    if (selectedActivityRows.length === 0) return;
    setEndDateTime(dayjs());
    setEndDialogOpen(true);
  };

  // Fermer la boîte de dialogue de fin d'activité
  const handleCloseEndDialog = () => {
    setEndDialogOpen(false);
  };

  // Terminer l'activité
  const handleEndActivity = async () => {
    setDialogLoading(true);
    try {
      const promises = selectedActivityRows.map((childUuid) => {
        const activity = inProgressActivities.find(
          (act) => act.childUuid === childUuid
        );
        console.log(activity);
        const activityData = {
          actionType: "activity",
          comment: endComment,
          activity: {
            uuid: activity.activityUuid,
            startDateTime: activity.startDateTime,
            endDateTime: endDateTime.toISOString(),
          },
        };
        return axios.put(`/actions/${activity.actionUuid}`, activityData);
      });
      await Promise.all(promises);
      // Réinitialiser les sélections
      setSelectedActivityRows([]);
      setEndComment("");
      setSuccessMessage("Les activités ont été terminées avec succès.");
      setTimeout(() => {
        setSuccessMessage("");
      }, 6000);
      // Rafraîchir les activités en cours
      const fetchInProgressActivities = async () => {
        if (!selectedNurseryUuid) return;
        setLoading(true);
        try {
          const todayDate = dayjs().format("YYYY-MM-DD");
          const response = await axios.get(
            `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=activity&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59&state=action_in_progress`
          );
          if (response.data["hydra:member"]) {
            const actions = response.data["hydra:member"];
            const inProgressData = actions.map((action) => ({
              actionUuid: action.uuid,
              childUuid: action.child.uuid,
              avatar: action.child.avatar,
              firstname: action.child.firstname,
              lastname: action.child.lastname,
              activityUuid: action.activity.uuid,
              activityName: action.activity.name,
              startDateTime: action.activity.startDateTime,
            }));
            setInProgressActivities(inProgressData);
          } else {
            setInProgressActivities([]);
          }
        } catch (error) {
          console.error("Error fetching in-progress activities:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchInProgressActivities();
    } catch (error) {
      console.error("Erreur lors de la terminaison des activités :", error);
      setErrorMessage(
        "Une erreur s'est produite lors de la terminaison des activités."
      );
      setTimeout(() => {
        setErrorMessage("");
      }, 6000);
    } finally {
      setDialogLoading(false);
      handleCloseEndDialog();
    }
  };

  if (loading) {
    return (
      <Box className="loading-box">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="activity-container">
      {/* Notification de succès */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage("")}
          severity="success"
          variant="filled"
        >
          {successMessage}
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

      <Typography variant="h5" className="activity-title">
        Suivi des activités
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

      {/* Sélection de l'activité */}
      <Box className="activity-selection">
        <FormControl fullWidth>
          <InputLabel id="activity-select-label">Activité</InputLabel>
          <Select
            labelId="activity-select-label"
            id="activity-select"
            value={selectedActivityUuid}
            label="Activité"
            onChange={(e) => setSelectedActivityUuid(e.target.value)}
          >
            {activities.map((activity) => (
              <MenuItem key={activity.uuid} value={activity.uuid}>
                {activity.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Soumettre
        </Button>
      </Box>

      {/* Boîte de dialogue pour la date de début */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Début de l'activité</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Heure de début"
              value={startDateTime}
              onChange={(newValue) => setStartDateTime(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              ampm={false}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Annuler
          </Button>
          <Button
            onClick={handleSubmitActivity}
            color="primary"
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : "Soumettre"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tableau des activités en cours */}
      <Box className="in-progress-activities">
        <Typography variant="h6">Activités en cours</Typography>
        {inProgressActivities.length === 0 ? (
          <Typography>Aucune activité en cours</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedActivityRows.length > 0 &&
                        selectedActivityRows.length <
                          inProgressActivities.length
                      }
                      checked={
                        inProgressActivities.length > 0 &&
                        selectedActivityRows.length ===
                          inProgressActivities.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedActivityRows(
                            inProgressActivities.map((act) => act.childUuid)
                          );
                        } else {
                          setSelectedActivityRows([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Activité</TableCell>
                  <TableCell>Heure de début</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inProgressActivities.map((activity) => (
                  <TableRow
                    key={activity.childUuid}
                    onClick={() => handleActivityRowClick(activity.childUuid)}
                    selected={selectedActivityRows.includes(activity.childUuid)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedActivityRows.includes(
                          activity.childUuid
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={`${activity.avatar}`}
                        alt={`${activity.firstname} ${activity.lastname}`}
                      />
                    </TableCell>
                    <TableCell>
                      {activity.firstname} {activity.lastname}
                    </TableCell>
                    <TableCell>{activity.activityName}</TableCell>
                    <TableCell>
                      {dayjs(activity.startDateTime).format("HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Bouton Finir l'activité */}
      <Box className="end-activity-button">
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenEndDialog}
          disabled={selectedActivityRows.length === 0}
        >
          Finir l'activité en cours
        </Button>
      </Box>

      {/* Boîte de dialogue pour la fin de l'activité */}
      <Dialog open={endDialogOpen} onClose={handleCloseEndDialog}>
        <DialogTitle>Fin de l'activité</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Heure de fin"
              value={endDateTime}
              onChange={(newValue) => setEndDateTime(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              ampm={false}
            />
          </LocalizationProvider>
          <TextField
            label="Commentaire"
            multiline
            rows={4}
            fullWidth
            value={endComment}
            onChange={(e) => setEndComment(e.target.value)}
            style={{ marginTop: "1rem" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEndDialog} color="secondary">
            Annuler
          </Button>
          <Button
            onClick={handleEndActivity}
            color="primary"
            disabled={dialogLoading}
          >
            {dialogLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Finir l'activité"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Activity;