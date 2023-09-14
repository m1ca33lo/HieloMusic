const { MessageEmbed } = require("discord.js");
/**
 *
 * @param {import("../lib/HieloMusic")} client
 * @param {import("discord.js").ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
	let guild = client.guilds.cache.get(interaction.customId.split(":")[1]);
	let property = interaction.customId.split(":")[2];
	let player = client.manager.get(guild.id);

	if (!player) {
		await interaction.reply({
			embeds: [
				client.Embed("❌ | **No hay ningún jugador que controlar en este servidor.**"),
			],
		});
		setTimeout(() => {
			interaction.deleteReply();
		}, 5000);
		return;
	}
	if (!interaction.member.voice.channel) {
		const joinEmbed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setDescription(
				"❌ | **Debes estar en un canal de voz para usar esta acción!**",
			);
		return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
	}

	if (
		interaction.guild.members.me.voice.channel &&
		!interaction.guild.members.me.voice.channel.equals(interaction.member.voice.channel)
	) {
		const sameEmbed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setDescription(
				"❌ | **Necesitas estar en el mismo canal de voz para usar este comando!**",
			);
		return await interaction.reply({ embeds: [sameEmbed], ephemeral: true });
	}

	if (property === "Stop") {
		player.queue.clear();
		player.stop();
		player.set("autoPlay", false);
		client.warn(`Player: ${ player.options.guild } | Se paró la música`);
		const msg = await interaction.channel.send({
			embeds: [
				client.Embed(`⏹️ | **Satisfactoriamente se paró la musica del usuario**`),
			],
		});
		setTimeout(() => {
			msg.delete();
		}, 5000);

		interaction.update({
			components: [client.createController(player.options.guild, player)],
		});
		return;
	}

	// if theres no previous song, return an error.
	if (property === "Replay") {
		const previousSong = player.queue.previous;
		const currentSong = player.queue.current;
		const nextSong = player.queue[0]
        if (!player.queue.previous ||
            player.queue.previous === player.queue.current ||
            player.queue.previous === player.queue[0]) {
            
           return interaction.reply({
                        ephemeral: true,
			embeds: [
				new MessageEmbed()
					.setColor("RED")
					.setDescription(`Lo lamento, no se encontró una canción anterior a esta.`),
			],
		});
    }
		if (previousSong !== currentSong && previousSong !== nextSong) {
			player.queue.splice(0, 0, currentSong)
			player.play(previousSong);
			return interaction.deferUpdate();
		}
	}

	if (property === "PlayAndPause") {
		if (!player || (!player.playing && player.queue.totalSize === 0)) {
			const msg = await interaction.channel.send({
                               ephemeral: true,
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("No se encontró una canción para reproducir."),
				],
			});
			setTimeout(() => {
				msg.delete();
			}, 5000);
			return interaction.deferUpdate();
		} else {

			if (player.paused) {
				player.pause(false);
			} else {
				player.pause(true);
			}
			client.warn(`jugador: ${ player.options.guild } | Satisfactoriamente ${ player.paused? "se pauso" : "reanudo" } la musica del usuario`);

			return interaction.update({
				components: [client.createController(player.options.guild, player)],
			});
		}
	}

	if (property === "Next") {
                const song = player.queue.current;
	        const autoPlay = player.get("autoPlay");
                if (player.queue[0] == undefined && (!autoPlay || autoPlay === false)) {
		return interaction.reply({
                        ephemeral: true,
			embeds: [
				new MessageEmbed()
					.setColor("RED")
					.setDescription(`No hay más canciones después de [${ song.title }](${ song.uri }).`),
			],
		})} else player.stop();
		return interaction.deferUpdate
    }

	if (property === "Loop") {
		if (player.trackRepeat) {
			player.setTrackRepeat(false);
			player.setQueueRepeat(true);
		} else if (player.queueRepeat) {
			player.setQueueRepeat(false);
		} else {
			player.setTrackRepeat(true);
		}
		client.warn(`jugador: ${player.options.guild} | Se activo el loop ${player.trackRepeat ? "on" : player.queueRepeat ? "queue on" : "off"} the player`);

		interaction.update({
			components: [client.createController(player.options.guild, player)],
		});
		return;
	}

	return interaction.reply({
		ephemeral: true,
		content: "❌ | **Opción de controlador desconocida**",
	});
};
