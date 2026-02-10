"use client";
import Fuse from "fuse.js";

const SPECIALTIES = [
  {
    id: 1,
    name: "Neurólogo",
    keywords: ["cabeza", "migraña", "cefalea", "dolor de cabeza", "vértigo", "mareo"],
    description: "Especialista en dolores de cabeza y sistema nervioso"
  },
  {
    id: 2,
    name: "Neumólogo",
    keywords: ["respirar", "respiro", "asfixia", "falta de aire", "ahogo", "tos"],
    description: "Especialista en problemas respiratorios"
  },
  {
    id: 3,
    name: "Cardiólogo",
    keywords: ["pecho", "corazón", "palpitaciones", "latidos", "presión"],
    description: "Especialista en problemas del corazón"
  },
  {
    id: 4,
    name: "Medicina General",
    keywords: ["fiebre", "temperatura", "malestar", "cansancio", "fatiga"],
    description: "Evaluación inicial de síntomas generales"
  }
];

// Función para remover tildes
function removeTildes(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Función para normalizar texto (sin tildes + minúsculas)
function normalize(text) {
  return removeTildes(text).toLowerCase();
}

export function detectSymptom(userInput) {
  if (!userInput || !userInput.trim()) {
    return null;
  }

  const normalizedInput = normalize(userInput);

  // Crear array con especialidades normalizadas
  const normalizedSpecialties = SPECIALTIES.map(spec => ({
    ...spec,
    keywords: spec.keywords.map(kw => normalize(kw))
  }));

  const fuse = new Fuse(normalizedSpecialties, {
    keys: ["keywords"],
    threshold: 0.3,
    ignoreLocation: true
  });

  const results = fuse.search(normalizedInput);

  if (results.length === 0) {
    return null;
  }

  // Retornar la especialidad original (con datos sin modificar)
  const foundIndex = results[0].refIndex;
  return SPECIALTIES[foundIndex];
}

export default function SymptomDetector({ userInput, onDetect }) {
  const specialty = detectSymptom(userInput);

  if (specialty) {
    onDetect(specialty);
  }

  return null;
}