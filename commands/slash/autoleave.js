const colors = require("colors");
const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("autoleave")
  .setDescription("Hielito descansará cuando todos abandonen el canal de voz.")
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

    let autoLeaveEmbed = new MessageEmbed().setColor(client.config.embedColor);
    const autoLeave = player.get("autoLeave");
    player.set("solicitante", interaction.guild.me);

    if (!autoLeave || autoLeave === false) {
      player.set("autoLeave", true);
    } else {
      player.set("autoLeave", false);
    }
    autoLeaveEmbed
			.setDescription(`**Auto Leave está** \`${!autoLeave ? "ENCENDIDO" : "APAGADO"}\``)
			.setFooter({
			  text: `Hielito ${!autoLeave ? "tomará un descanso" : "ya no tomará un descanso"} cuando lo abandonen.`
			});
    client.warn(
      `Locutor: ${player.options.guild} | [${colors.blue(
        "autoLeave"
      )}] ha sido [${colors.blue(!autoLeave ? "HABILITADO" : "DESHABILITADO")}] en ${
        client.guilds.cache.get(player.options.guild)
          ? client.guilds.cache.get(player.options.guild).name
          : "a guild"
      }`
    );

    return interaction.reply({ embeds: [autoLeaveEmbed] });
  });

module.exports = command;