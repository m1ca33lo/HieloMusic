const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const imagenes = require("../../imagenes")

const command = new SlashCommand()
	.setName("summon")
	.setDescription("Invoca a Hielito al canal de voz en el que te encuentres.")
	.setRun(async (client, interaction, options) => {
		let channel = await client.getChannel(client, interaction);
		if (!interaction.member.voice.channel) {
			const joinEmbed = new MessageEmbed()
				.setColor(client.config.embedColor)
				.setDescription(
					"❌ | **Debe estar en un canal de voz para usar este comando.**",
				);
			return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
		}
		
		let player = client.manager.players.get(interaction.guild.id);
		if (!player) {
			player = client.createPlayer(interaction.channel, channel);
			player.connect(true);
		}
		
		if (channel.id !== player.voiceChannel) {
			player.setVoiceChannel(channel.id);
			player.connect();
		}
		
		interaction.reply({
			embeds: [
				client.Embed()
					.setAuthor({ name: `${interaction.user.username} invocó a Hielito`, iconURL: interaction.user.avatarURL })
					.setTitle("Conectando...")
					.setDescription(`**Acabo de unirme a <#${ channel.id }> y sere tu mejor DJ!**`)
					.setThumbnail(imagenes.work)
					
			], //Llamando a Hielito...
		});
	});

module.exports = command;
