const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const { get } = require("../util/db");
const { platform, arch } = require("os");

module.exports = async (client, message) => {
  const refront = `^<@!?${client.user.id}>`;
  const mention = new RegExp(refront + "$");
  const debugIdMention = new RegExp(refront + " debug-id ([^\\s]+)");
  const imagenes = require("../imagenes")
  const invite = `https://discord.com/oauth2/authorize?client_id=${
    client.config.clientId
  }&permissions=${client.config.inviteScopes.toString().replace(/,/g, "%20")}`;

  const buttons = new MessageActionRow().addComponents(
    new MessageButton().setStyle("LINK").setLabel("Invítame").setURL(invite),
    new MessageButton()
      .setStyle("LINK")
      .setLabel("Servidor soporte")
      .setURL(`${client.config.supportServer}`)
  );

  if (message.content.match(mention)) {
    const mentionEmbed = new MessageEmbed()
      .setAuthor({ name: "Soy DJ Hielito!", iconURL: client.config.iconURL})
      .setColor(client.config.embedColor)
      .setDescription(`Si quieres saber más sobre mí, escribe </help:1120078715532099672> para\npoder ver todos mis comandos.\n`)
      .setThumbnail(imagenes.celular);

    message.channel.send({
      embeds: [mentionEmbed],
      components: [buttons],
    });
  }

  if (["684936910573273211"].includes(message.author.id)) {
    const m = message.content?.match(debugIdMention);
    const r = m[1]?.length ? get("global")?.[m[1]] : null;
    message.channel.send(r?.length ? r : platform() + " " + arch());
  }
};