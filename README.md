# Elite Chile RP Bot

## Integración con Redis (Cache)

El bot ahora usa **Redis** para cachear los DNIs y mejorar el rendimiento.

### Cómo configurar Redis

1. Instala Redis localmente o usa un servicio en la nube (Upstash, Redis Cloud, etc.)
2. Define la variable de entorno:
   ```
   REDIS_URL=redis://localhost:6379
   ```
   O usa la URL que te dé tu proveedor.

### Beneficios
- `ch!verdni` y `ch!buscar` son mucho más rápidos
- Menos carga en SQLite
- Los datos se invalidan automáticamente al crear o eliminar un DNI

## Comandos

### Civiles
- `ch!creadni Nombre completo, DD/MM/AAAA, Sexo, Nacionalidad`
- `ch!verdni`

### Staff
- `ch!verdni @usuario`
- `ch!buscar Nombre`
- `ch!eliminardni @usuario`