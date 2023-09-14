const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const imagenes = require("../../imagenes")

const command = new SlashCommand()
	.setName("stop")
	.setDescription("Hielo se congelará y saldrá del canal de voz\n**(Este comando borra la cola)**")
	
	.setRun(async (client, interaction, options) => {
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
						.setDescription("El Reproductor no esta conectado"),
				],
			});
		}
		
		if (!player) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("No estoy en un canal."),
				],
				ephemeral: true,
			});
		}
		
		if (player.twentyFourSeven) {
			player.queue.clear();
			player.stop();
			player.set("autoPlay", false);
		} else {
			player.destroy();
		}
		
		interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(`**Hasta que me descongeles!**`)
					.setImage(imagenes.congelado),
				],
		});
	});

module.exports = command;
