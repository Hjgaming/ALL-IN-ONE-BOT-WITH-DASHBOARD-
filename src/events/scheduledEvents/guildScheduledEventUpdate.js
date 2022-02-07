const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildScheduledEvent} oldEvent
 * @param {import('discord.js').GuildScheduledEvent} newEvent
 */
module.exports = async (client, oldEvent, newEvent) => {
  const settings = await getSettings(newEvent.guild);

  // update timestamp in cache
  if (newEvent.scheduledStartAt !== oldEvent.scheduledStartAt && settings.events.reminder_time > 0) {
    client.eventReminders.set(newEvent.id, {
      guild: newEvent.guild,
      event: newEvent,
      remindAt: newEvent.scheduledStartAt.getTime() - settings.events.reminder_time * 60 * 1000,
    });
  }
};
