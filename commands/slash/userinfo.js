const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "userinfo",
	category: "utility",
	usage: "/userinfo <user?>",
	description: "Hielo te dará información sobre usted mismo o algún otro usuario.",
	options: [
		{
			name: 'user',
			type: 6, // "USER"
			description: 'Usuario del que desea obtener información. Si se omite, le devolveremos su información.',
			required: false,
		},
	],
	permissions: [],
	ownerOnly: false,
	run: async (client, interaction, options) => {
		const target = interaction.options.getUser("user") || interaction.user;
		const member = interaction.guild.members.cache.get(target.id);
		const status = {
			offline: "Offline",
			online: "Online",
			idle: "Idle",
			dnd: "Do Not Disturb",
		};

		// Filtering out @everyone role and getting the roles of roles for the member
		const roles = member.roles.cache.map(roles => { if (roles.name != "@everyone") return `<@&${roles.id}>` }).join(' ');

		const embed = new MessageEmbed()
			.setColor(client.config.embedColor || member.displayHexColor || 'RANDOM')
			.setThumbnail(target.displayAvatarURL({ dynamic: true }))
			.setAuthor({ name: `${target.tag}`, iconURL: target.displayAvatarURL({ dynamic: true })})
			.setFields([
				{
					"name": `**Información**`,
					"value": `**❯ Usuario:**\n\`\`${target.username}\`\``,
					"inline": true,
				  },
				  {
					"name": `**de**`,
					"value": `**❯ Tag:**\n\`\`${target.discriminator}\`\``,
					"inline": true,
				  },
				  {
					"name": `**usuario**`,
					"value": `**❯ Bot:**\n\`\`${target.bot}\`\``,
					"inline": true,
				  },
				  {
					"name": ` `,
					"value": `**❯ Avatar:**\n[Link Avatar](${target.displayAvatarURL({ dynamic: true })})`,
					"inline": true,
				  },
				  {
					"name": ` `,
					"value": `**❯ Creación:**\n\`\`${new Date(target.createdTimestamp).toLocaleString()}\`\``,
					"inline": true,
				  },
				  {
					"name": ` `,
					"value": `**❯ Id:**\n\`\`${target.id}\`\``,
					"inline": true,
				  },
				  {
					"name": `**Información**`,
					"value": `**❯ Rol mayor:**\n${member.roles.highest.id === interaction.guild.id ? "None" : `<@&${member.roles.highest.id}>`}`,
					"inline": true,
				  },
				  {
					"name": `**de**`,
					"value": `**❯ Ingreso:**\n\`\`${new Date(member.joinedTimestamp).toLocaleString()}\`\``,
					"inline": true,
				  },
				  {
					"name": `**Miembro**`,
					"value": `**❯ Roles [${member.roles.cache.size - 1}]:**\n${roles}`,
					"inline": true,
				  }
			])
			.setTimestamp();

		interaction.reply({ embeds: [embed] });
	},
};
