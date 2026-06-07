# Elite Chile RP Bot

Bot limpio y profesional para **Elite Chile Roleplay**.

## Comandos actuales

### Civiles
- `ch!dni crear Nombre completo, DD/MM/AAAA, Sexo, Nacionalidad`
- `ch!dni info`
- `ch!dni buscar @usuario` / `ch!dni buscar Nombre`

### Staff
- `ch!ayuda` muestra sección especial si tienes el rol de staff

## Sistema de roles
Al crear un DNI con `ch!dni crear`, el bot asigna automáticamente el rol de Civil (configúralo en `.env` con `CIVIL_ROLE_ID`).

## Validación de fecha
La fecha ahora se valida como fecha real (no permite fechas futuras ni inválidas).

## Configuración
Agrega en tu `.env`:
```
CIVIL_ROLE_ID=ID_DEL_ROL_CIVIL
STAFF_ROLE_ID=1508320073784496159
```