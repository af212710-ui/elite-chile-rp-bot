const { getBalance, addCash, canCollect, updateLastCollect } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');
const colors = require('../config/colors');
const { createProgressBar } = require('../utils/progressBar');
const salaries = require('../config/salaries');

function getHighestSalary(member) {
  let highest = 0;
  for (const roleId of Object.keys(salaries)) {
    if (member.roles.cache.has(roleId)) {
      const amount = salaries[roleId];
      if (amount > highest) highest = amount;
    }
  }
  return highest;
}

module.exports = {
  name: 'collect',
  description: 'Recoge tu sueldo semanal según tu rol',
  execute: async (message, args, client) => {
    const userId = message.author.id;
    const member = message.member;

    if (!canCollect(userId)) {
      return message.reply('Ya recogiste tu sueldo esta semana. Puedes volver a reclamar el próximo reinicio semanal.');
    }

    const salary = getHighestSalary(member);

    if (salary === 0) {
      return message.reply('No tienes ningún rol de sueldo asignado.');
    }

    // Animación
    const progressEmbed = new EmbedBuilder()
      .setColor(colors.warning)
      .setTitle('⏳ Procesando sueldo semanal...')
      .setDescription(createProgressBar(0, 10));

    const progressMsg = await message.reply({ embeds: [progressEmbed] });

    await new Promise(r => setTimeout(r, 700));
    await progressMsg.edit({ embeds: [progressEmbed.setDescription(createProgressBar(4, 10))] });

    await new Promise(r => setTimeout(r, 600));
    await progressMsg.edit({ embeds: [progressEmbed.setDescription(createProgressBar(8, 10))] });

    await new Promise(r => setTimeout(r, 500));

    addCash(userId, salary);
    updateLastCollect(userId);

    const finalBalance = getBalance(userId).cash;

    const finalEmbed = new EmbedBuilder()
      .setColor(colors.success)
      .setTitle('💰 ¡Sueldo Semanal Recogido!')
      .setDescription(
        `Recibiste **$${salary.toLocaleString()}** en tu cartera.\n\n` +
        `💵 **Cartera actual:** $${finalBalance.toLocaleString()}`
      )
      .setFooter({ text: 'Puedes reclamar tu próximo sueldo la siguiente semana' });

    await progressMsg.edit({ embeds: [finalEmbed] });
  }
};