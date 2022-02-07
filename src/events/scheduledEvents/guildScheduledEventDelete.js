const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildScheduledEvent} event
 */
module.exports = async (client, event) => {
  const settings = await getSettings(event.guild);

  // remove event id from cache
  if (settings.events.reminder_time > 0) {
    client.eventReminders.delete(event.id);
  }
};
