const colors = require("colors");
const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
	.setName("autoplay")
	.setDescription("Hielito pondrá músicas similares a la última música que esté en cola.")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) {
			return;
		}
		
		let player;
		if (client.manager) {
			player = client.manager.players.get(interaction.guild.id);
		} else {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("El Reproductor no está conectado"),
				],
			});
		}
		
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
		
		let autoPlayEmbed = new MessageEmbed().setColor(client.config.embedColor);
		const autoPlay = player.get("autoPlay");
		player.set("solicitante", interaction.guild.members.me);
		
		if (!autoPlay || autoPlay === false) {
			player.set("autoPlay", true);
		} else {
			player.set("autoPlay", false);
		}
		autoPlayEmbed
		  .setDescription(`**El Auto Play está** \`${!autoPlay ? "ENCENDIDO" : "APAGADO"}\``)
		  .setFooter({
		    text: `${!autoPlay ? "Hielito será tu DJ reproduciendo la música relacionada." : "Fue un gusto ser tu DJ, la música relacionada ya no se agregará a la cola."}`
      });
		client.warn(
			`Locutor: ${ player.options.guild } | [${ colors.blue(
				"AUTOPLAY",
			) }] ha sido [${ colors.blue(!autoPlay? "HABILITADO" : "DESHABILITADO") }] en ${
				client.guilds.cache.get(player.options.guild)
					? client.guilds.cache.get(player.options.guild).name
					: "a guild"
			}`,
		);
		
		return interaction.reply({ embeds: [autoPlayEmbed] });
	});

module.exports = command;
