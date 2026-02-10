"use client";
import Fuse from "fuse.js";
import specialties from "../data/specialties.json";
import faqs from "../data/faqs.json";

// Función para remover tildes
function removeTildes(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalize(text) {
  return removeTildes(text).toLowerCase();
}

function detectAlarm(text) {
  const alarms = [
    "dolor intenso en el pecho",
    "dificultad para respirar",
    "perdida de conciencia",
    "sangrado abundante"
  ];
  const n = normalize(text);
  return alarms.some(a => normalize(a).includes(n) || n.includes(normalize(a)));
}

function findMatches(text) {
  const normalized = normalize(text);
  const matches = [];
  
  const fuse = new Fuse(specialties, {
    keys: ["keywords"],
    threshold: 0.3,
    ignoreLocation: true
  });
  
  const results = fuse.search(text);
  
  if (results.length > 0) {
    return results.map(r => r.item);
  }
  
  for (const spec of specialties) {
    for (const kw of spec.keywords) {
      if (normalized.includes(normalize(kw))) {
        matches.push(spec);
        break;
      }
    }
  }
  return matches;
}

// ✅ NUEVA FUNCIÓN: Buscar FAQs por palabras clave
function findFAQ(text) {
  const normalized = normalize(text);
  const stopWords = ["el", "la", "los", "las", "un", "una", "unos", "unas", "de", "a", "en", "por", "para", "con", "sin", "que", "es", "son", "y", "o", "como", "puedo", "me", "soy"];
  
  const userWords = normalized
    .replace(/[¿?]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w));

  let bestMatch = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const faqNormalized = normalize(faq.question.replace(/[¿?]/g, ""));
    const faqWords = faqNormalized.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
    
    let matchCount = 0;
    for (const userWord of userWords) {
      for (const faqWord of faqWords) {
        if (faqWord.includes(userWord) || userWord.includes(faqWord)) {
          matchCount++;
        }
      }
    }
    
    // Al menos 3 palabras coincidentes O 50% de similitud
    if (matchCount >= 3 || matchCount / Math.max(userWords.length, faqWords.length) > 0.5) {
      const score = matchCount;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }
  }

  return bestMatch;
}

export async function classifyMessage(text) {
  if (!text || !text.trim()) {
    return "Por favor describe tus síntomas o pregunta.";
  }
  
  const lower = normalize(text);

  // 1. Responder a saludos
  const saludos = ["hola", "buenos dias", "buenas tardes", "buenas noches", "que tal", "holi", "ola", "buenas", "hey"];
  if (saludos.some(s => lower.includes(s))) {
    return "¡Hola! Soy el asistente de la clínica. ¿Cómo te encuentras hoy? Puedo ayudarte con síntomas, horarios, citas y más.";
  }

  // 2. Detectar alarma (URGENTE)
  if (detectAlarm(text)) {
    return "🚨 URGENCIA MÉDICA DETECTADA 🚨\nPor favor acude a emergencias inmediatamente o llama al 112.\nNuestro equipo de urgencias está disponible 24/7.";
  }

  // 3. ✅ Buscar en FAQs con palabras clave (NUEVO)
  const faq = findFAQ(text);
  if (faq) {
    return faq.answer;
  }

  // 4. Detectar síntomas
  const matches = findMatches(text);
  if (matches.length > 0) {
    const primary = matches[0];
    let reply = `Según lo que describes, lo más indicado sería: **${primary.name}**.\n\n${primary.description}\n\nPasos previos:\n- Anotar inicio y evolución de síntomas\n- Registrar medicamentos y alergias\n- Tomar fotos si aplica`;
    
    if (matches.length > 1) {
      const others = matches.slice(1).map(s => s.name).join(", ");
      reply += `\n\nTambién podría estar relacionado con: ${others}.`;
    }
    
    return reply;
  }

  // 5. Respuesta por defecto
  return "No estoy seguro. Puedo ayudarte con:\n✓ Síntomas médicos\n✓ Horarios y citas\n✓ Preguntas administrativas\n\n¿Podrías precisar tu pregunta?";
}