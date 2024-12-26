import React, { useEffect, useState, useContext } from "react";
import {
  Avatar,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import axios from "../../../api/axios";
import { SelectedNurseryContext } from "../../../contexts/SelectedNurseryContext";
import "./Presence.css";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const formatTime = (dateTime) => {
  return dayjs(dateTime).format("HH:mm");
};

const Presence = () => {
  const { selectedNurseryUuid } = useContext(SelectedNurseryContext);

  const [contractDates, setContractDates] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [presentChildren, setPresentChildren] = useState([]);
  const [absentChildren, setAbsentChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(null);
  const [isAbsentDialog, setIsAbsentDialog] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);
  const currentAgentUuid = localStorage.getItem("uuid");
  const agentLoginWithPhone =
    JSON.parse(localStorage.getItem("AGENT_LOGIN_WITH_PHONE")) ?? false;

  useEffect(() => {
    const fetchContractDates = async () => {
      if (!selectedNurseryUuid) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `/contract_dates?nursery_structure_uuid=${selectedNurseryUuid}&is_today=1`
        );
        if (response.data["hydra:member"]) {
          setContractDates(response.data["hydra:member"]);
        }
      } catch (error) {
        console.error("Error fetching contract dates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractDates();
  }, [selectedNurseryUuid]);

  useEffect(() => {
    const fetchPresentAndAbsentChildren = async () => {
      if (!selectedNurseryUuid) return;
      try {
        const todayDate = dayjs().format("YYYY-MM-DD");
        const response = await axios.get(
          `/actions?nursery_structures[]=${selectedNurseryUuid}&actions[]=presence&start_date_time=${todayDate} 00:00:00&end_date_time=${todayDate} 23:59:59`
        );
        if (response.data["hydra:member"]) {
          const actions = response.data["hydra:member"];
          const presentChildrenData = [];
          const absentChildrenData = [];

          actions.forEach((action) => {
            const childData = {
              childUuid: action.child.uuid,
              avatar: action.child.avatar,
              firstname: action.child.firstname,
              lastname: action.child.lastname,
              startDateTime: action.presence.startDateTime,
              endDateTime: action.presence.endDateTime,
              actionUuid: action.uuid,
            };
            if (action.presence.isAbsent) {
              absentChildrenData.push(childData);
            } else {
              presentChildrenData.push(childData);
            }
          });
          setPresentChildren(presentChildrenData);
          setAbsentChildren(absentChildrenData);
        }
      } catch (error) {
        console.error("Error fetching present and absent children:", error);
      }
    };

    fetchPresentAndAbsentChildren();
  }, [selectedNurseryUuid]);

  useEffect(() => {
    const getAgents = async () => {
      if (agentLoginWithPhone || !selectedNurseryUuid) return;

      const response = await axios.get(
        `/agents?nursery_structure_uuid=${selectedNurseryUuid}`
      );
      if (response.data["hydra:member"]) {
        setAgents(response.data["hydra:member"]);
      }
    };

    getAgents();
  }, [selectedNurseryUuid]);

  const handleAvatarClick = (childUuid) => {
    setSelectedChildren((prevSelected) => {
      if (prevSelected.includes(childUuid)) {
        return prevSelected.filter((uuid) => uuid !== childUuid);
      }
      return [...prevSelected, childUuid];
    });
  };

  const handleOpenDialog = (isAbsent) => {
    setStartTime(dayjs());
    setEndTime(null);
    setIsAbsentDialog(isAbsent);
    setDialogType("markPresence");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingChild(null);
    setDialogType(null);
    setEndTime(null);
  };

  const getChildDataByUuid = (uuid) => {
    return contractDates.find((child) => child.childUuid === uuid);
  };

  const handleSubmitPresence = async (isAbsent) => {
    setDialogLoading(true);
    try {
      const todayDate = dayjs().format("YYYY-MM-DD");
      const promises = selectedChildren.map((uuid) => {
        let startDateTimeISO = null;
        if (!isAbsent) {
          startDateTimeISO = dayjs(
            `${todayDate}T${startTime.format("HH:mm")}`
          ).toISOString();
        }

        const presenceData = {
          agentUuid: selectedAgentUuid,
          childUuid: uuid,
          actionType: "presence",
          presence: {
            startDateTime: startDateTimeISO,
            isAbsent: isAbsent,
          },
        };

        return axios.post("/actions", presenceData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      const responses = await Promise.all(promises);

      const newChildren = responses.map((response, index) => {
        const childData = getChildDataByUuid(selectedChildren[index]);
        return {
          childUuid: selectedChildren[index],
          avatar: childData.avatar,
          firstname: childData.firstname,
          lastname: childData.lastname,
          startDateTime: response.data.presence.startDateTime,
          endDateTime: response.data.presence.endDateTime,
          actionUuid: response.data.uuid,
        };
      });

      if (isAbsent) {
        setAbsentChildren((prevAbsent) => [...prevAbsent, ...newChildren]);
      } else {
        setPresentChildren((prevPresent) => [...prevPresent, ...newChildren]);
      }

      setSelectedChildren([]);
      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la présence :", error);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleEditPresentChild = (child) => {
    setEditingChild(child);
    setStartTime(dayjs(child.startDateTime));
    setEndTime(child.endDateTime ? dayjs(child.endDateTime) : dayjs());
    setDialogType("editPresent");
    setOpenDialog(true);
  };

  const handleEditAbsentChild = (child) => {
    setEditingChild(child);
    setStartTime(dayjs());
    setDialogType("editAbsent");
    setOpenDialog(true);
  };

  const handleLeaveDaycare = async () => {
    setDialogLoading(true);
    try {
      const todayDate = dayjs().format("YYYY-MM-DD");
      const endDateTimeISO = dayjs(
        `${todayDate}T${endTime.format("HH:mm")}`
      ).toISOString();

      const presenceData = {
        startDateTime: dayjs(editingChild.startDateTime).toISOString(),
        endDateTime: endDateTimeISO,
        isAbsent: false,
      };
      await axios.put(`/actions/${editingChild.actionUuid}`, {
        actionType: "presence",
        presence: presenceData,
      });

      setPresentChildren((prevPresent) =>
        prevPresent.map((c) =>
          c.childUuid === editingChild.childUuid
            ? { ...c, endDateTime: presenceData.endDateTime }
            : c
        )
      );
      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la présence :", error);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleMarkAbsentFromPresent = async () => {
    setDialogLoading(true);
    try {
      const presenceData = {
        isAbsent: true,
      };
      await axios.put(`/actions/${editingChild.actionUuid}`, {
        actionType: "presence",
        presence: presenceData,
      });

      setPresentChildren((prevPresent) =>
        prevPresent.filter(
          (child) => child.childUuid !== editingChild.childUuid
        )
      );
      setAbsentChildren((prevAbsent) => [...prevAbsent, editingChild]);
      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la présence :", error);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleMarkPresentFromAbsent = async () => {
    setDialogLoading(true);
    try {
      const todayDate = dayjs().format("YYYY-MM-DD");
      const startDateTimeISO = dayjs(
        `${todayDate}T${startTime.format("HH:mm")}`
      ).toISOString();

      const presenceData = {
        startDateTime: startDateTimeISO,
        isAbsent: false,
      };
      await axios.put(`/actions/${editingChild.actionUuid}`, {
        actionType: "presence",
        presence: presenceData,
      });

      setAbsentChildren((prevAbsent) =>
        prevAbsent.filter((c) => c.childUuid !== editingChild.childUuid)
      );
      setPresentChildren((prevPresent) => [
        ...prevPresent,
        { ...editingChild, startDateTime: presenceData.startDateTime },
      ]);
      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la présence :", error);
    } finally {
      setDialogLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="loading-box">
        <CircularProgress />
      </Box>
    );
  }

  const presentChildrenUuids = new Set(
    presentChildren.map((child) => child.childUuid)
  );
  const absentChildrenUuids = new Set(
    absentChildren.map((child) => child.childUuid)
  );

  const remainingChildren = contractDates.filter(
    (contractDate) =>
      !presentChildrenUuids.has(contractDate.childUuid) &&
      !absentChildrenUuids.has(contractDate.childUuid)
  );

  return (
    <Box className="presence-container">
      <Typography variant="h5" className="presence-title">
        Présence d'aujourd'hui
      </Typography>

      {remainingChildren.length === 0 ? (
        <Typography variant="body1" className="no-data-text">
          Aucune donnée disponible pour aujourd'hui.
        </Typography>
      ) : (
        <Box className="children-selection">
          <Box className="presence-list">
            {remainingChildren.map((contractDate) => {
              const isSelected = selectedChildren.includes(
                contractDate.childUuid
              );
              return (
                <Box
                  key={contractDate.childUuid}
                  className={`presence-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleAvatarClick(contractDate.childUuid)}
                >
                  <Avatar
                    src={`${contractDate.avatar}`}
                    alt={`${contractDate.firstname} ${contractDate.lastname}`}
                    className="presence-avatar"
                  />
                  <Typography variant="h6" className="presence-name">
                    {contractDate.firstname} {contractDate.lastname}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {remainingChildren.length > 0 && (
            <Box className="buttons-container">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenDialog(false)}
                disabled={selectedChildren.length === 0}
              >
                Marquer Présent
              </Button>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "red",
                  color: "white",
                  marginLeft: "10px",
                }}
                onClick={() => handleOpenDialog(true)}
                disabled={selectedChildren.length === 0}
              >
                Marquer Absent
              </Button>
            </Box>
          )}
        </Box>
      )}

      <Box className="presence-content">
        <Box className="present-children">
          <Typography variant="h6">Enfants présents</Typography>
          {presentChildren.length === 0 ? (
            <Typography>Aucun enfant présent</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Avatar</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Heure d'arrivée</TableCell>
                    <TableCell>Heure de fin</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {presentChildren.map((child) => (
                    <TableRow key={child.childUuid}>
                      <TableCell>
                        <Avatar
                          src={`${child.avatar}`}
                          alt={`${child.firstname} ${child.lastname}`}
                        />
                      </TableCell>
                      <TableCell>
                        {child.firstname} {child.lastname}
                      </TableCell>
                      <TableCell>{formatTime(child.startDateTime)}</TableCell>
                      <TableCell>
                        {child.endDateTime ? formatTime(child.endDateTime) : ""}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEditPresentChild(child)}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Box className="absent-children">
          <Typography variant="h6">Enfants absents</Typography>
          {absentChildren.length === 0 ? (
            <Typography>Aucun enfant absent</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Avatar</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {absentChildren.map((child) => (
                    <TableRow key={child.childUuid}>
                      <TableCell>
                        <Avatar
                          src={`${child.avatar}`}
                          alt={`${child.firstname} ${child.lastname}`}
                        />
                      </TableCell>
                      <TableCell>
                        {child.firstname} {child.lastname}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEditAbsentChild(child)}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {dialogType === "markPresence" && (
          <>
            <DialogTitle>
              {isAbsentDialog ? "Confirmer l'absence" : "Confirmer la présence"}
            </DialogTitle>
            <DialogContent>
              {!isAbsentDialog && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Heure d'arrivée"
                    value={startTime}
                    onChange={(newValue) => {
                      if (newValue) setStartTime(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                    ampm={false}
                  />
                </LocalizationProvider>
              )}

              {!agentLoginWithPhone &&
                agents.map((agent) => {
                  if (agent.uuid === currentAgentUuid) return null;

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
                        src={`${agent.avatar}`}
                        alt={`${agent.firstname} ${agent.lastname}`}
                        className="presence-avatar"
                      />
                      <Typography variant="h6" className="presence-name">
                        {agent.firstname} {agent.lastname}
                      </Typography>
                    </Box>
                  );
                })}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="secondary">
                Annuler
              </Button>
              <Button
                onClick={() => handleSubmitPresence(isAbsentDialog)}
                color="primary"
                disabled={dialogLoading}
              >
                {dialogLoading ? <CircularProgress size={24} /> : "Soumettre"}
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === "editPresent" && (
          <>
            <DialogTitle>Modifier la présence</DialogTitle>
            <DialogContent>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Heure d'arrivée"
                  value={startTime}
                  onChange={(newValue) => {
                    if (newValue) setStartTime(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  ampm={false}
                />
                <TimePicker
                  label="Heure de fin"
                  value={endTime}
                  onChange={(newValue) => {
                    if (newValue) setEndTime(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      style={{ marginTop: "1rem" }}
                    />
                  )}
                  ampm={false}
                />
              </LocalizationProvider>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="secondary">
                Annuler
              </Button>
              <Button
                onClick={handleLeaveDaycare}
                color="primary"
                disabled={dialogLoading}
              >
                {dialogLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Quitter la crèche"
                )}
              </Button>
              <Button
                onClick={handleMarkAbsentFromPresent}
                color="primary"
                disabled={dialogLoading}
              >
                {dialogLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Marquer absent"
                )}
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === "editAbsent" && (
          <>
            <DialogTitle>Marquer présent</DialogTitle>
            <DialogContent>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Heure d'arrivée"
                  value={startTime}
                  onChange={(newValue) => {
                    if (newValue) setStartTime(newValue);
                  }}
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
                onClick={handleMarkPresentFromAbsent}
                color="primary"
                disabled={dialogLoading}
              >
                {dialogLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Marquer présent"
                )}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Presence;
