const Redis = require('ioredis');

// Conexión a Redis
// Usa REDIS_URL si está definida (recomendado para producción)
// Ejemplo local: redis://localhost:6379
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redis.on('connect', () => {
  console.log('✅ Redis conectado correctamente');
});

redis.on('error', (err) => {
  console.error('❌ Error en Redis:', err.message);
});

module.exports = redis;