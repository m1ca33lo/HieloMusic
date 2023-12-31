const { MessageEmbed } = require("discord.js");

/**
 *
 * @param {import("../lib/HieloMusic")} client
 * @param {import("discord.js").VoiceState} oldState
 * @param {import("discord.js").VoiceState} newState
 * @returns {Promise<void>}
 */
module.exports = async (client, oldState, newState) => {
	// get guild and player
	let guildId = newState.guild.id;
	const player = client.manager.get(guildId);
	const imagenes =require("../imagenes")
	
	// check if the bot is active (playing, paused or empty does not matter (return otherwise)
	if (!player || player.state !== "CONNECTED") {
		return;
	}
	
	// prepreoces the data
	const stateChange = {};
	// get the state change
	if (oldState.channel === null && newState.channel !== null) {
		stateChange.type = "JOIN";
	}
	if (oldState.channel !== null && newState.channel === null) {
		stateChange.type = "LEAVE";
	}
	if (oldState.channel !== null && newState.channel !== null) {
		stateChange.type = "MOVE";
	}
	if (oldState.channel === null && newState.channel === null) {
		return;
	} // you never know, right
	if (
		newState.serverMute == true &&
		oldState.serverMute == false &&
		newState.id === client.config.clientId
	) {
		return player.pause(true);
	}
	if (
		newState.serverMute == false &&
		oldState.serverMute == true &&
		newState.id === client.config.clientId
	) {
		return player.pause(false);
	}
	// move check first as it changes type
	if (stateChange.type === "MOVE") {
		if (oldState.channel.id === player.voiceChannel) {
			stateChange.type = "LEAVE";
		}
		if (newState.channel.id === player.voiceChannel) {
			stateChange.type = "JOIN";
		}
	}
	// double triggered on purpose for MOVE events
	if (stateChange.type === "JOIN") {
		stateChange.channel = newState.channel;
	}
	if (stateChange.type === "LEAVE") {
		stateChange.channel = oldState.channel;
	}
	
	// check if the bot's voice channel is involved (return otherwise)
	if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel) {
		return;
	}
        player.prevMembers = player.members
        player.members = stateChange.channel.members.filter(member => !member.user.bot).size;
	switch (stateChange.type) {
		case "JOIN":
			if (player.get("autoPause") === true) {
                         var members = stateChange.channel.members.filter(member => !member.user.bot).size
		            if (members === 1 && player.paused && members !== player.prevMembers){
					player.pause(false);
					let playerResumed = new MessageEmbed()
						.setColor(client.config.embedColor)
						.setTitle(`¡Reanudado!`, imagenes.playdj)
						.setDescription(
							`Reproduciendo  [${ player.queue.current.title }](${ player.queue.current.uri })`,
						)
						.setFooter({ text: `Se ha reanudado la canción actual.` });
					
					let resumeMessage = await client.channels.cache
						.get(player.textChannel)
						.send({ embeds: [playerResumed] });
					player.setResumeMessage(client, resumeMessage);
					
					setTimeout(() => {
						if (!client.isMessageDeleted(resumeMessage)) {
							resumeMessage.delete();
							client.markMessageAsDeleted(resumeMessage);
						}
					}, 5000);
				}
			}
			break;
                case "LEAVE":
			var members = stateChange.channel.members.filter(member => !member.user.bot).size
			const twentyFourSeven = player.get("twentyFourSeven");
			if (player.get("autoPause") === true && player.get("autoLeave") === false) {
				if (members === 0 && !player.paused && player.playing) {
					player.pause(true);
					
					let playerPaused = new MessageEmbed()
						.setColor(client.config.embedColor)
						.setTitle(`¡Pausado!`, client.config.iconURL)
						.setFooter({
							text: `Hielito se puso triste porque lo dejaron con la música.`,
						});
					
					let pausedMessage = await client.channels.cache
						.get(player.textChannel)
						.send({ embeds: [playerPaused] });
					player.setPausedMessage(client, pausedMessage);
				}
			}else if (player.get("autoLeave") === true && player.get("autoPause") === false) {
				if (members === 0) {
					if (twentyFourSeven){
						setTimeout(async () => {
							var members = stateChange.channel.members.filter(member => !member.user.bot).size
							if (members === 0 && player.state !== 'DISCONNECTED'){
								let leftEmbed = new MessageEmbed()
									.setColor(client.config.embedColor)
									.setAuthor({
									name: "Desconectado!",
									iconURL: client.config.iconURL,
									})
									.setFooter({ text: "Me fui porque no había nadie en el canal de voz:(." })
									.setTimestamp();
								let Disconnected = await client.channels.cache
									.get(player.textChannel)
									.send({ embeds: [leftEmbed] });
								setTimeout(() => Disconnected.delete(true), 5000);
								player.queue.clear();
								player.destroy();
								player.set("autoPlay", false);
							}
						}, client.config.disconnectTime);
					} else{
						let leftEmbed = new MessageEmbed()
							.setColor(client.config.embedColor)
							.setAuthor({
							name: "Desconectado!",
							iconURL: client.config.iconURL,
							})
							.setFooter({ text: "Me fui porque no había nadie en el canal de voz:(." })
							.setTimestamp();
						let Disconnected = await client.channels.cache
							.get(player.textChannel)
							.send({ embeds: [leftEmbed] });
						setTimeout(() => Disconnected.delete(true), 5000);
						player.destroy();	
					}
					
				}
			}else if (player.get("autoLeave") === true && player.get("autoPause") === true){
				if (members === 0 && !player.paused && player.playing && twentyFourSeven) {
					player.pause(true);
					
					let playerPaused = new MessageEmbed()
						.setColor(client.config.embedColor)
						.setTitle(`Pausado!`, client.config.iconURL)
						.setFooter({
							text: `Hielito se puso triste porque lo dejaron con la música.`,
						});
					
					let pausedMessage = await client.channels.cache
						.get(player.textChannel)
						.send({ embeds: [playerPaused] });
					player.setPausedMessage(client, pausedMessage);
					setTimeout(async () => {
						var members = stateChange.channel.members.filter(member => !member.user.bot).size
						if (members === 0 && player.state !== 'DISCONNECTED'){
							let leftEmbed = new MessageEmbed()
								.setColor(client.config.embedColor)
								.setAuthor({
								name: "Desconectado!",
								iconURL: client.config.iconURL,
								})
								.setFooter({ text: "Me fui porque no había nadie en el canal de voz:(." })
								.setTimestamp();
							let Disconnected = await client.channels.cache
								.get(player.textChannel)
								.send({ embeds: [leftEmbed] });
								components: [
								new MessageActionRow().addComponents(
									new MessageButton()
									.setLabel("Invitame")
									.setStyle("LINK")
									.setURL(
										`https://discord.com/oauth2/authorize?client_id=${
											client.config.clientId
										}&permissions=${
											client.config.permissions
										}&scope=${client.config.inviteScopes
											.toString()
											.replace(/,/g, "%20")}`
										)
									),
								  ],
							setTimeout(() => Disconnected.delete(true), 5000);
							pausedMessage.delete(true);
							player.queue.clear();
							player.destroy();
							player.set("autoPlay", false);
						}
					}, client.config.disconnectTime);
				}else{
					if (members === 0 && player.state !== 'DISCONNECTED'){
						let leftEmbed = new MessageEmbed()
						.setColor(client.config.embedColor)
						.setAuthor({
						name: "Desconectado!",
						iconURL: client.config.iconURL,
						})
						.setFooter({ text: "Me fui porque no había nadie en el canal de voz:(." })
						.setTimestamp();
						let Disconnected = await client.channels.cache
							.get(player.textChannel)
							.send({ embeds: [leftEmbed] });
						setTimeout(() => Disconnected.delete(true), 5000);
						player.destroy();
					}
				}
			}
		break;
	}
};
