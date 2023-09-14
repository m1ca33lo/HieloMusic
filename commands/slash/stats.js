const SlashCommand = require("../../lib/SlashCommand");
const moment = require("moment");
require("moment-duration-format");
const { MessageEmbed } = require("discord.js");
const os = require("os");

const command = new SlashCommand()
	.setName("stats")
	.setDescription("Obtendrás datos interesantes de Hielito.")
	.setRun(async (client, interaction, message) => {
		// get OS info
		const osver = os.platform() + " " + os.release();
		
		// Get nodejs version
		const nodeVersion = process.version;
		
		// get the uptime in a human readable format
		const runtime = moment
			.duration(client.uptime)
			.format("d[ d]・h[ h]・m[ m]・s[ s]");
		// show lavalink uptime in a nice format
		const lavauptime = moment
			.duration(client.manager.nodes.values().next().value.stats.uptime)
			.format(" D[d], H[h], m[m]");
		// show lavalink memory usage in a nice format
		const lavaram = (
			client.manager.nodes.values().next().value.stats.memory.used /
			1024 /
			1024
		).toFixed(2);
		// sow lavalink memory alocated in a nice format
		const lavamemalocated = (
			client.manager.nodes.values().next().value.stats.memory.allocated /
			1024 /
			1024
		).toFixed(2);
		// show system uptime
		var sysuptime = moment
			.duration(os.uptime() * 1000)
			.format("d[ d]・h[ h]・m[ m]・s[ s]");
		
		
		// get commit hash and date
		
		const statsEmbed = new MessageEmbed()
			.setTitle(`Hielo`)
			.setColor(0x0099FF)
			.setDescription( //Holi, soy un bot de música. Siempre estoy aquí para alegrar tu día.
				` | Holi, soy un bot de música. Siempre estoy aquí para alegrar tu\n | día. ¿Sabías que soy el hielito de MicaHielo?\n\n | Seré tu DJ favorito al reproducir tus mejores rolas, de esta\n | forma seré parte de tus mejores momentos.`,
			)
			.setFields([
				{
					name: `:date: Cumpleaños`,
					value: `\`\`17/11/2022\`\``,
					inline: true,
				},
				{
					name: ":japanese_castle: Servidores",
					value: `\`\`${client.guilds.cache.size}\`\``,
					inline: true,
				},
				{
					name: `:snowman2:  Usuarios`,
					value: `\`\`${interaction.guild.memberCount}\`\``, //client.users.cache.size interaction.guild.memberCount 
					inline: true, //
				},
				{
					name: `:ping_pong: Ping`,
					value: `\`\`${client.ws.ping}\`\``,
					inline: true,
				},
				{
					name: `:floppy_disk: Memoria`,
					value: `\`\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb\`\``,
					inline: true,
				},
				{
					name: ":signal_strength: En línea",
					value: `\`\`${runtime}\`\``,
					inline: true,
				},
			])
			.setThumbnail('https://cdn.discordapp.com/attachments/1078901107880906762/1126583995350646844/hielito-color-n_1.png')
		return interaction.reply({ embeds: [statsEmbed], ephemeral: false });
	});

module.exports = command;
