const { getBalance, addCash, canCollect, updateLastCollect } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');
const colors = require('../config/colors');

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
  description: 'Recoge tu sueldo según tu rol',
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

    addCash(userId, salary);
    updateLastCollect(userId);

    const embed = new EmbedBuilder()
      .setColor(colors.success)
      .setTitle('💰 Sueldo Recogido')
      .setDescription(`Recibiste **$${salary.toLocaleString()}** en tu cartera.`)
      .setFooter({ text: 'Vuelve en 4 horas' });

    return message.reply({ embeds: [embed] });
  }
};