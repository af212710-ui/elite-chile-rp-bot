# Elite Chile RP Bot

## Integración con IA (Grok / OpenAI)

El bot ahora tiene un comando de **Inteligencia Artificial** usando la API de Grok (xAI) o compatible con OpenAI.

### Configuración de la IA

Agrega en tu `.env`:

```env
XAI_API_KEY=tu_clave_de_xai
AI_MODEL=grok-3
AI_BASE_URL=https://api.x.ai/v1
```

O si usas OpenAI normal:
```env
XAI_API_KEY=sk-...
AI_MODEL=gpt-4o
AI_BASE_URL=https://api.openai.com/v1
```

### Comando
- `ch!ia Tu mensaje aquí`

La IA responde en español y está configurada para ser útil en el contexto del servidor RP.

### Notas
- Tiene rate limiting (1 uso por minuto para civiles)
- El staff no tiene límite
- Se recomienda usar Grok por su buen rendimiento en español