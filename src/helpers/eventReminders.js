const { EMBED_COLORS } = require("@root/config");
const { getEventReminderGuilds } = require("@schemas/Guild");
const { safeDM } = require("@utils/botUtils");

module.exports = {
  /**
   * Initializes the event reminder system
   * @param {import('@src/structures').BotClient} client
   */
  async init(client) {
    const docs = await getEventReminderGuilds();

    for (const doc of docs) {
      const guild = client.guilds.cache.get(doc._id);
      if (!guild) continue;
      const events = await guild.scheduledEvents.fetch();
      events
        .filter((e) => e.status === "SCHEDULED" && e.scheduledStartAt.getTime() > Date.now())
        .forEach((e) => {
          client.eventReminders.set(e.id, {
            guild,
            event: e,
            remindAt: e.scheduledStartAt.getTime() - doc.events.reminder_time * 60 * 1000,
          });
        });
    }

    setInterval(function () {
      const dateNow = Date.now();
      const eventData = client.eventReminders.filter((e) => e.remindAt <= dateNow);

      eventData.forEach(async (data, id) => {
        if (!data.guild) return;
        const subscribers = await data.guild.scheduledEvents.fetchSubscribers(data.event);
        subscribers.forEach((subscriber) => {
          safeDM(subscriber.user, {
            embeds: [
              {
                author: { name: "🔔 Event Reminder" },
                color: EMBED_COLORS.BOT_EMBED,
                description: `
              Server: **${data.guild.name}**
              Event Name: **${data.event.name}**
              Start Time: **${data.event.scheduledStartAt.toLocaleString()}**
              `,
              },
            ],
          });
        });

        client.eventReminders.delete(id);
      });
    }, 3 * 60 * 1000);
  },
};
