import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import { Send } from "@mui/icons-material";
import axios from "../../api/axios";
import PropTypes from "prop-types";
import "./Channel.css";
import { useParams } from "react-router-dom";

const Channel = () => {
  const { channelId } = useParams();
  const channelIdNumber = Number(channelId);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("id");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `/messages?channelId=${channelIdNumber}`
        );
        setMessages(response.data["hydra:member"]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch messages", error);
        setLoading(false);
      }
    };
    fetchMessages();
  }, [channelIdNumber]);

  useEffect(() => {
    if (!channelIdNumber) return;

    const url = new URL("http://localhost:8001/.well-known/mercure");
    url.searchParams.append("topic", `/channels/${channelIdNumber}`);

    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    eventSource.onerror = (error) => {
      console.error("Erreur EventSource:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [channelIdNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messagePayload = {
        channelId: channelIdNumber,
        content: newMessage,
        author: {
          memberType: "Agent",
          memberId: parseInt(userId, 10),
        },
      };

      const response = await axios.post("/messages", messagePayload);
      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageInput = (e) => {
    setNewMessage(e.target.value);
  };

  if (loading) {
    return <Typography>Loading messages...</Typography>;
  }

  return (
    <Box className="chat-container">
      <Box className="messages-container">
        {messages.map((message) => (
          <Box
            key={message.id}
            className={`message-bubble ${
              message.author && message.author.memberId === parseInt(userId, 10)
                ? "my-message"
                : "other-message"
            }`}
          >
            <Typography className="message-author">
              {message.author
                ? `${message.author.firstname} ${message.author.lastname}`
                : "Unknown"}
            </Typography>
            <Typography className="message-content">
              {message.content}
            </Typography>
            <Typography className="message-timestamp">
              {message.createdAt
                ? new Date(message.createdAt).toLocaleString()
                : "Unknown time"}
            </Typography>
          </Box>
        ))}

        <div ref={messagesEndRef} />
      </Box>

      <Box className="message-input-container">
        <TextField
          fullWidth
          multiline
          rows={2}
          value={newMessage}
          onChange={handleMessageInput}
          placeholder="Écrire un message..."
          onKeyDown={handleKeyDown}
        />
        <IconButton color="primary" onClick={handleSendMessage}>
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

Channel.propTypes = {};

export default Channel;
