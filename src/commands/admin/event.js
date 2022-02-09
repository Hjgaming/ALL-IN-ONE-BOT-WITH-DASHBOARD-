const { Command } = require("@src/structures");
const { getSettings } = require("@schemas/Guild");
const { Message, CommandInteraction } = require("discord.js");

module.exports = class Event extends Command {
  constructor(client) {
    super(client, {
      name: "event",
      description: "event commands",
      category: "ADMIN",
      botPermissions: ["MANAGE_EVENTS"],
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "remind <time|off>",
            description: "configure reminder time of event subscribers",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "remind",
            description: "configure reminder time for event subscribers",
            type: "SUB_COMMAND",
            options: [
              {
                name: "time",
                description: "minutes before which reminder must be sent (0 to disable)",
                type: "INTEGER",
                required: true,
              },
            ],
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const sub = args[0].toLowerCase();
    let response = "";

    if (sub === "remind") {
      let time = args[1];
      if (time === "off") time = 0;
      response = await setReminderTime(message.guild, time);
    }

    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response = "";

    if (sub === "remind") {
      const time = interaction.options.getInteger("time");
      response = await setReminderTime(interaction.guild, time);
    }

    await interaction.followUp(response);
  }
};

async function setReminderTime(guild, time) {
  if (time != 0) {
    const minutes = parseInt(time);
    if (isNaN(minutes)) return "Invalid time provided";
    if (minutes < 5) return "Time must be at least 5 minutes";
  }

  const settings = await getSettings(guild);
  settings.events.reminder_time = time;
  await settings.save();

  // Add to cache
  if (time != 0) {
    const events = await guild.scheduledEvents.fetch();
    events
      .filter((e) => e.status === "SCHEDULED" && e.scheduledStartAt.getTime() > Date.now())
      .forEach((e) => {
        guild.client.eventReminders.set(e.id, {
          guild,
          event: e,
          remindAt: e.scheduledStartAt.getTime() - time * 60 * 1000,
        });
      });
  }

  return `Event reminder ${time == 0 ? "is disabled" : "will now be sent before `" + time + "` minutes"}`;
}
