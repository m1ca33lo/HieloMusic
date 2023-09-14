const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const imagenes = require('../../imagenes');


const command = new SlashCommand()
  .setName("invite")
  .setDescription("Hielito te pide ayuda para crecer!")
  .setRun(async (client, interaction, options) => {
    const target = interaction.options.getUser("user") || interaction.user;
    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setTitle("Seré tu DJ favorito!")
          .setDescription(`Hielito quiere ser parte de tu servidor!\nAyúdame a llegar a los 100 servidores ❤️`)
          .setThumbnail(imagenes.gracias),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("¡Invítame!")
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
    });
  });
module.exports = command;
