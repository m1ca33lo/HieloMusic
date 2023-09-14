const { MessageEmbed, message } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const fs = require("fs");
const path = require("path");
const { forEach } = require("lodash");

const command = new SlashCommand()
	.setName("guildleave")
	.setDescription("salir de servidores")
    .addStringOption((option) =>
    option
      .setName("id")
      .setDescription("Ingrese el id del servidor para salir (por ejemplo `list` para los id de los servidores)")
      .setRequired(true)
  )
  .setRun(async (client, interaction, options) => {
		if (interaction.user.id === client.config.adminId) {
		    try{
			const id = interaction.options.getString('id');

			if (id.toLowerCase() === 'list'){
			    client.guilds.cache.forEach((guild) => {
				console.log(`${guild.name} | ${guild.id}`);
			    });
			    const guild = client.guilds.cache.map(guild => ` ${guild.name} | ${guild.id}`);
			    try{
				return interaction.reply({content:`Guilds:\n\`${guild}\``, ephemeral: true});
			    }catch{
				return interaction.reply({content:`consulte la consola para ver la lista de servidores`, ephemeral: true});
			    }
			}

			const guild = client.guilds.cache.get(id);

			if(!guild){
			    return interaction.reply({content: `\`${id}\` el id del servidor no es válido`, ephemeral:true});
			}

			await guild.leave().then(c => console.log(`se fue del servidor ${id}`)).catch((err) => {console.log(err)});
			return interaction.reply({content:`se fue del servidor \`${id}\``, ephemeral: true});
		    }catch (error){
			console.log(`hubo un error al tratar de salir del servidor ${id}`, error);
		    }
		}else {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(client.config.embedColor)
						.setDescription("No tienes autorización para usar este comando!"),
				],
				ephemeral: true,
			});
		}
	});

module.exports = command;
