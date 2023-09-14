const colors = require("colors");
const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("autopause")
  .setDescription("Hielito se congelará cuando todos abandonen el canal de voz.")
  .setRun(async (client, interaction) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) return;

    let player;
    if (client.manager)
      player = client.manager.players.get(interaction.guild.id);
    else
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("El Reproductor no está conectado"),
        ],
      });

    if (!player) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("No hay nada reproduciendo en la cola"),
        ],
        ephemeral: true,
      });
    }

    let autoPauseEmbed = new MessageEmbed().setColor(client.config.embedColor);
    const autoPause = player.get("autoPause");
    player.set("solicitante", interaction.guild.members.me);

    if (!autoPause || autoPause === false) {
      player.set("autoPause", true);
    } else {
      player.set("autoPause", false);
    }
    autoPauseEmbed
			.setDescription(`**Auto Pause está** \`${!autoPause ? "ENCENDIDO" : "APAGADO"}\``)
			.setFooter({
			  text: `Hielito ${!autoPause ? "quedará congelado" : "ya no se podrá congelar"} cuando lo abandonen.`
			});
    client.warn(
      `Locutor: ${player.options.guild} | [${colors.blue(
        "AUTOPAUSE"
      )}] ha sido [${colors.blue(!autoPause ? "HABILITADO" : "DESHABILITADO")}] en ${
        client.guilds.cache.get(player.options.guild)
          ? client.guilds.cache.get(player.options.guild).name
          : "a guild"
      }`
    );

    return interaction.reply({ embeds: [autoPauseEmbed] });
  });

module.exports = command;
