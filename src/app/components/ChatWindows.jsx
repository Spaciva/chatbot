"use client";
import React, { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
/*import SymptomDetector, { detectSymptom } from "../services/SymptomDetector";*/
import { classifyMessage } from "../services/classifier";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hola, soy el asistente de la clínica. ¿En qué puedo ayudarte hoy?" }
  ]);

  const sendUserMessage = async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { id: Date.now(), sender: "user", text: text.trim() };
    setMessages((m) => [...m, userMsg]);

    const reply = await classifyMessage(text.trim());
    const botMsg = { id: Date.now() + 1, sender: "bot", text: reply };
    setMessages((m) => [...m, botMsg]);
  };

  return (
    <div className="chat-window">
      <MessageList messages={messages} />
      <MessageInput onSend={sendUserMessage} />
    </div>
  );
}