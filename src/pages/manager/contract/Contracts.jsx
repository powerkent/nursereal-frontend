import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import fr from "date-fns/locale/fr";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const locales = { fr: fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const Contracts = () => {
  const [nurseries, setNurseries] = useState([]);
  const [selectedNursery, setSelectedNursery] = useState("");
  const [events, setEvents] = useState([]);
  const [nurseryOpenings, setNurseryOpenings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const response = await axios.get("/nursery_structures");
        setNurseries(response.data["hydra:member"]);
      } catch (error) {
        console.error("Failed to fetch nurseries", error);
      }
    };
    fetchNurseries();
  }, []);

  useEffect(() => {
    const fetchNurseryData = async () => {
      if (selectedNursery) {
        try {
          // Fetch contracts for the selected nursery
          const contractResponse = await axios.get(
            `/contract_dates?nurseryStructureId=${selectedNursery}`
          );
          const contracts = contractResponse.data["hydra:member"];

          // Convert contract dates into calendar events
          const newEvents = contracts.flatMap((contract) =>
            contract.childDates.map((date) => ({
              title: `${contract.firstname} ${contract.lastname.charAt(0)}`,
              start: new Date(date.contractTimeStart),
              end: new Date(date.contractTimeEnd),
            }))
          );
          setEvents(newEvents);

          // Find the selected nursery in the list and fetch its details
          const nursery = nurseries.find(
            (nursery) => nursery.id === selectedNursery
          );
          if (nursery) {
            const nurseryResponse = await axios.get(
              `/nursery_structures/${nursery.uuid}`
            );
            setNurseryOpenings(nurseryResponse.data.openings);
          }
        } catch (error) {
          console.error("Failed to fetch data for selected nursery", error);
        }
      }
    };
    fetchNurseryData();
  }, [selectedNursery, nurseries]);

  const isOpenDay = (date) => {
    const dayName = format(date, "EEEE"); // Get the full day name in English
    if (!nurseryOpenings || nurseryOpenings.length === 0) {
      return true; // If no openings are defined, consider all days open
    }

    // Check if the day is found in the nursery's openings
    return nurseryOpenings.some((opening) => opening.openingDay === dayName);
  };

  const dayPropGetter = (date) => {
    if (!isOpenDay(date)) {
      return {
        style: {
          backgroundColor: "rgba(255, 0, 0, 0.3)", // Red for closed days
        },
      };
    }
    return {};
  };

  const handleAddRegistration = () => {
    navigate("/contracts/add");
  };

  return (
    <Box sx={{ padding: 4, width: "80%", margin: "auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom align="center">
        Visualiser les Contrats par Crèche
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>
        <FormControl sx={{ width: "20%" }}>
          <InputLabel id="test-select-creche">Crèche</InputLabel>
          <Select
            value={selectedNursery}
            onChange={(e) => setSelectedNursery(e.target.value)}
            labelId="test-select-creche"
            label="Crèche"
          >
            {nurseries.map((nursery) => (
              <MenuItem key={nursery.id} value={nursery.id}>
                {nursery.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Calendar
          localizer={localizer}
          culture="fr"
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 400, width: "50%" }}
          selectable={false}
          dayPropGetter={dayPropGetter}
          messages={{
            today: "Aujourd'hui",
            previous: "Précédent",
            next: "Suivant",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
          }}
        />
      </Box>

      <Box sx={{ marginTop: 3, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRegistration}
        >
          Ajouter ou modifier une ou des inscriptions
        </Button>
      </Box>
    </Box>
  );
};

export default Contracts;
