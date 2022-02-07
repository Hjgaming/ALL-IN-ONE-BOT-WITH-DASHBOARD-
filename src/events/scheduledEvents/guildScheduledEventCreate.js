const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildScheduledEvent} event
 */
module.exports = async (client, event) => {
  const settings = await getSettings(event.guild);

  // add event id to cache
  if (settings.events.reminder_time > 0) {
    client.eventReminders.set(event.id, {
      guild: event.guild,
      event,
      remindAt: event.scheduledStartAt.getTime() - settings.events.reminder_time * 60 * 1000,
    });
  }
};
