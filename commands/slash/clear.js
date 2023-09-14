const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("clear")
	.setDescription("Hielito se deshará de todas músicas de la cola.")
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
						.setDescription("El Reproductor no está conectado"),
				],
			});
		}
		
		if (!player) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("No estás reproduciendo nada ahora."),
				],
				ephemeral: true,
			});
		}
		
		if (!player.queue || !player.queue.length || player.queue.length === 0) {
			let cembed = new MessageEmbed()
				.setColor(client.config.embedColor)
				.setDescription("❌ | **Inválido, no hay suficientes canciones para borrar.**");
			
			return interaction.reply({ embeds: [cembed], ephemeral: true });
		}
		
		player.queue.clear();
		
		let clearEmbed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setDescription(`✅ | **Limpiaste la cola!**`);
		
		return interaction.reply({ embeds: [clearEmbed] });
	});

module.exports = command;