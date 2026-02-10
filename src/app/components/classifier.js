"use client";

export async function classifyMessage(text, specialty = null) {
  if (!text || !text.trim()) {
    return "Por favor describe tus síntomas.";
  }

  if (!specialty) {
    return "No estoy seguro. Describe mejor tus síntomas o acude a Medicina General para evaluación inicial.";
  }

  let response = `Según tus síntomas, te recomiendo: **${specialty.name}**\n\n`;
  response += `${specialty.description}\n\n`;
  response += `Pasos antes de agendar:\n- Anota cuándo empezó\n- Lista medicamentos que tomas\n- Apunta alergias\n\n`;
  response += `¿Deseas agendar una cita?`;

  return response;
}