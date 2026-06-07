const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;

/**
 * Verifica si un miembro es staff.
 * Comprueba primero por rol configurado, luego por permisos altos.
 */
function isStaff(member) {
  if (!member || !member.permissions) return false;

  // 1. Por rol específico (si está configurado)
  if (STAFF_ROLE_ID && member.roles.cache.has(STAFF_ROLE_ID)) {
    return true;
  }

  // 2. Por permisos de Discord (más flexible)
  const highPermissions = [
    'Administrator',
    'ManageGuild',
    'ManageMessages',
    'KickMembers',
    'BanMembers'
  ];

  return highPermissions.some(perm => member.permissions.has(perm));
}

module.exports = { isStaff };