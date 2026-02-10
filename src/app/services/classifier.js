import Fuse from "fuse.js";
import specialties from "../data/specialties.json";
import faqs from "../data/faqs.json";

function normalize(text) {
  return text.toLowerCase();
}

function detectAlarm(text) {
  const alarms = [
    "dolor intenso en el pecho",
    "dificultad para respirar",
    "pérdida de conciencia",
    "sangrado abundante"
  ];
  const n = normalize(text);
  return alarms.some(a => n.includes(a));
}

function findMatches(text) {
  const normalized = normalize(text);
  const matches = [];
  
  // Búsqueda con Fuse.js para ser más tolerante
  const fuse = new Fuse(specialties, {
    keys: ["keywords"],
    threshold: 0.3,
    ignoreLocation: true
  });
  
  const results = fuse.search(text);
  
  if (results.length > 0) {
    return results.map(r => r.item);
  }
  
  // Si Fuse no encuentra, buscar exacto
  for (const spec of specialties) {
    for (const kw of spec.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        matches.push(spec);
        break;
      }
    }
  }
  return matches;
}

export async function classifyMessage(text) {
  if (!text) return "Por favor describe tus síntomas o pregunta.";
  const lower = normalize(text);

  // Responder a saludos
  const saludos = ["hola", "buenos días", "buenas tardes", "buenas noches", "qué tal", "holi", "ola", "buenas"];
  if (saludos.some(s => lower.includes(s))) {
    return "¡Hola! Soy tu asistente de la clínica. ¿Cómo te encuentras hoy?";
  }

  // Responder FAQs simples
  for (const f of faqs) {
    if (lower.includes(f.question.toLowerCase().replace(/[¿?]/g, ""))) {
      return f.answer;
    }
  }

  // Detectar alarma
  if (detectAlarm(text)) {
    return "Detecto signos de alarma. Por favor acude a urgencias inmediatamente o llama a emergencias.";
  }

  const matches = findMatches(text);
  if (matches.length === 0) {
    return "No estoy seguro del especialista exacto. Recomiendo Medicina General para evaluación inicial. ¿Quieres que te haga preguntas para precisar?";
  }

  const primary = matches[0];
  let reply = `Según lo que describes, lo más indicado sería: ${primary.name}.\n\n${primary.description}\n\nPasos previos:\n- Anotar inicio y evolución de síntomas\n- Registrar medicamentos y alergias\n- Tomar fotos si aplica`;
  
  if (matches.length > 1) {
    const others = matches.slice(1).map(s => s.name).join(", ");
    reply += `\n\nTambién podría estar relacionado con: ${others}.`;
  }
  
  return reply;
}