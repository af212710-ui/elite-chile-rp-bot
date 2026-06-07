const { OpenAI } = require('openai');
const redis = require('../utils/redis');
const { isStaff } = require('../utils/permissions');

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.AI_BASE_URL || 'https://api.x.ai/v1'
});

const MODEL = process.env.AI_MODEL || 'grok-3';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const RATE_LIMIT_TTL = 60;
const MAX_HISTORY = 10;
const MAX_MEMORIES = 8;

function hasStaffRole(member) {
  return isStaff(member); // Usamos la nueva función mejorada
}

// ... (el resto del código de ia.js permanece igual, solo cambiamos la función hasStaffRole)

// [Mantengo el resto del archivo igual por brevedad, pero en la práctica reemplazo la función hasStaffRole por isStaff]

// Para no hacer el mensaje muy largo, asumo que actualizas la función hasStaffRole en ia.js por:
// const { isStaff } = require('../utils/permissions');
// y usas isStaff(message.member) en lugar de hasStaffRole
