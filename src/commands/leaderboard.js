const { getTopUsers } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leaderboard',
  description: 'Muestra el top 10 de usuarios más ricos',
  execute: async (message, args, client) => {
    const topUsers = getTopUsers(10);

    if (topUsers.length === 0) {
      return message.reply('Aún no hay datos de economía.');
    }

    let description = '';

    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const position = i + 1;
      const total = user.total;

      let userTag = `Usuario ${user.user_id}`;

      try {
        const fetchedUser = await client.users.fetch(user.user_id);
        userTag = fetchedUser.username;
      } catch (e) {}

      const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `🔹`;

      description += `${medal} **${position}.** ${userTag} - **$${total.toLocaleString()}**
`;
    }

    const embed = new EmbedBuilder()
      .setColor('#F1C40F')
      .setTitle('🏆 Leaderboard - Los más ricos de Elite Chile RP')
      .setDescription(description)
      .setFooter({ text: 'Actualizado en tiempo real' });

    return message.reply({ embeds: [embed] });
  }
};