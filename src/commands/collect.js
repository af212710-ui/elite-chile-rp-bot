const { getBalance, addCash, canCollect, updateLastCollect, getLastCollect, updateLastSalaryReminder, getLastSalaryReminder } = require('../utils/database');
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

function getTimeRemaining(lastCollect) {
  const now = Date.now();
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  const timePassed = now - lastCollect;
  const remaining = weekInMs - timePassed;

  if (remaining <= 0) return null;

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return `${days} día(s) y ${hours} hora(s)`;
}

module.exports = {
  name: 'collect',
  description: 'Reclamar sueldo semanal',
  execute: async (message, args, client) => {
    const userId = message.author.id;
    const member = message.member;

    if (!canCollect(userId)) {
      const lastCollect = getLastCollect(userId);
      const remaining = getTimeRemaining(lastCollect);
      return message.reply(
        remaining 
          ? `Ya reclamaste tu sueldo esta semana. Podrás reclamar de nuevo en **${remaining}**.`
          : 'Ya puedes reclamar tu sueldo.'
      );
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
      .setFooter({ text: 'Podrás reclamar tu próximo sueldo en 7 días' });

    await progressMsg.edit({ embeds: [finalEmbed] });
  }
};