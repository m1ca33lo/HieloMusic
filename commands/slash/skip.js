const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("skip")
	.setDescription("Hielo saltará la música actual.")
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
						.setDescription("No hay nada que saltar."),
				],
				ephemeral: true,
			});
		} 
        	const song = player.queue.current;
	        const autoPlay = player.get("autoPlay");
                if (player.queue[0] == undefined && (!autoPlay || autoPlay === false)) {
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor("RED")
					.setDescription(`No hay nada después de [${ song.title }](${ song.uri }) en la cola.`),
			],
		})}
		
		player.queue.previous = player.queue.current;
		player.stop();
		
		interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription("✅ | **Hielito saltó tu canción**"),
			],
		});
	});

module.exports = command;
