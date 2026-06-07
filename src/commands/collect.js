const { getBalance, addCash, canCollect, updateLastCollect } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');
const colors = require('../config/colors');
const { createProgressBar } = require('../utils/progressBar');

function getHighestSalary(member) {
  let highest = 0;
  for (const role of member.roles.cache.values()) {
    const match = role.name.match(/\((\d+[,.]?\d*)\)/);
    if (match) {
      const amount = parseInt(match[1].replace(/[,.]/g, ''));
      if (amount > highest) highest = amount;
    }
  }
  return highest;
}

module.exports = {
  name: 'collect',
  description: 'Recoge tu sueldo según tu rol (con animación)',
  execute: async (message, args, client) => {
    const userId = message.author.id;
    const member = message.member;

    if (!canCollect(userId)) {
      return message.reply('Ya recogiste tu sueldo. Puedes volver a hacerlo en 4 horas.');
    }

    const salary = getHighestSalary(member);

    if (salary === 0) {
      return message.reply('No tienes ningún rol de sueldo asignado.');
    }

    // === ANIMACIÓN DE BARRA DE PROGRESO ===
    const progressEmbed = new EmbedBuilder()
      .setColor(colors.warning)
      .setTitle('⏳ Recogiendo sueldo...')
      .setDescription(createProgressBar(0, 10));

    const progressMsg = await message.reply({ embeds: [progressEmbed] });

    // Paso 1
    await new Promise(r => setTimeout(r, 700));
    await progressMsg.edit({
      embeds: [progressEmbed.setDescription(createProgressBar(4, 10))]
    });

    // Paso 2
    await new Promise(r => setTimeout(r, 600));
    await progressMsg.edit({
      embeds: [progressEmbed.setDescription(createProgressBar(8, 10))]
    });

    // Paso 3 - Entregar dinero
    await new Promise(r => setTimeout(r, 500));

    addCash(userId, salary);
    updateLastCollect(userId);

    const finalBalance = getBalance(userId).cash;

    const finalEmbed = new EmbedBuilder()
      .setColor(colors.success)
      .setTitle('💰 ¡Sueldo Recogido!')
      .setDescription(
        `Recibiste **$${salary.toLocaleString()}** en tu cartera.\n\n` +
        `💵 **Cartera actual:** $${finalBalance.toLocaleString()}`
      )
      .setFooter({ text: 'Vuelve en 4 horas' });

    await progressMsg.edit({ embeds: [finalEmbed] });
  }
};