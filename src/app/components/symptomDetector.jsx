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

export function detectSymptom(userInput) {
  if (!userInput || !userInput.trim()) {
    return null;
  }

  const text = userInput.toLowerCase();

  const fuse = new Fuse(SPECIALTIES, {
    keys: ["keywords"],
    threshold: 0.3,
    ignoreLocation: true
  });

  const results = fuse.search(text);

  if (results.length === 0) {
    return null;
  }

  return results[0].item;
}

export default function SymptomDetector({ userInput, onDetect }) {
  const specialty = detectSymptom(userInput);

  if (specialty) {
    onDetect(specialty);
  }

  return null; // No renderiza nada visualmente
}