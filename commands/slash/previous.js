const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
.setName("previous")
.setDescription("Hielo volverá a tocar la canción anterior.")
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
					.setDescription("El Reproductor no esta conectado"),
			],
		});
	}

	if (!player) {
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor("RED")
					.setDescription("No hay canciones anteriores para esta sesión."),
			],
			ephemeral: true,
		});
	}

	const previousSong = player.queue.previous;
	const currentSong = player.queue.current;
	const nextSong = player.queue[0]

	if (!previousSong
		|| previousSong === currentSong
		|| previousSong === nextSong) {
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor("RED")
					.setDescription("No hay ninguna canción anterior en la cola."),
			],
		})}

	if (previousSong !== currentSong && previousSong !== nextSong) {
		player.queue.splice(0, 0, currentSong)
		player.play(previousSong);
	}
	interaction.reply({
		embeds: [
			new MessageEmbed()
				.setColor(client.config.embedColor)
				.setDescription(
					`⏮ | Canción anterior: **${ previousSong.title }**`,
				),
		],
	});
});

module.exports = command;
