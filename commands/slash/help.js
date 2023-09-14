const SlashCommand = require("../../lib/SlashCommand");
const {
  Client,
  Interaction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} = require("discord.js");
const LoadCommands = require("../../util/loadCommands");
const { filter } = require("lodash");

const command = new SlashCommand()
  .setName("help")
  .setDescription("Hielito te mostrará todos sus comandas, así conoces más sobre él.")
  .setRun(async (client, interaction) => {
    await interaction.deferReply().catch((_) => {});
    // map the commands name and description to the embed
    const commands = await LoadCommands().then((cmds) => {
      return [].concat(cmds.slash) /*.concat(cmds.context)*/;
    });
    // from commands remove the ones that have "null" in the description
    const filteredCommands = commands.filter(
      (cmd) => cmd.description != "null"
    );
    //console.log(filteredCommands);
    const totalCmds = filteredCommands.length;
    let maxPages = Math.ceil(totalCmds / client.config.helpCmdPerPage);

    // default Page No.
    let pageNo = 0;

    const helpEmbed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setAuthor({
        name: `Commandos de ${client.user.username}`,
        iconURL: client.config.iconURL,
      })
      .setTimestamp()
      .setFooter({ text: `Página ${pageNo + 1} / ${maxPages}` });

    // initial temporary array
    var tempArray = filteredCommands.slice(
      pageNo * client.config.helpCmdPerPage,
      pageNo * client.config.helpCmdPerPage + client.config.helpCmdPerPage
    );

    tempArray.forEach((cmd) => {
      helpEmbed.addFields({ name: cmd.name, value: cmd.description });
    });
    helpEmbed.addFields({
      name: "Créditos",
      value:
        `HieloMusic: v${
          require("../../package.json").version
        }` +
        "\n" +
        `[Servidor de soporte](${client.config.supportServer}) | [Invítame](https://discord.com/oauth2/authorize?client_id=${client.config.clientId}&permissions=${client.config.permissions}&scope=bot%20applications.commands)`,
    });

    // Construction of the buttons for the embed
    const getButtons = (pageNo) => {
      return new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("help_cmd_but_2_app")
          .setEmoji("◀️")
          .setStyle("PRIMARY")
          .setDisabled(pageNo == 0),
        new MessageButton()
          .setCustomId("help_cmd_but_1_app")
          .setEmoji("▶️")
          .setStyle("PRIMARY")
          .setDisabled(pageNo == maxPages - 1)
      );
    };

    const tempMsg = await interaction.editReply({
      embeds: [helpEmbed],
      components: [getButtons(pageNo)],
      fetchReply: true,
    });
    const collector = tempMsg.createMessageComponentCollector({
      time: 600000,
      componentType: "BUTTON",
    });

    collector.on("collect", async (iter) => {
      if (iter.customId === "help_cmd_but_1_app") {
        pageNo++;
      } else if (iter.customId === "help_cmd_but_2_app") {
        pageNo--;
      }

      helpEmbed.fields = [];

      var tempArray = filteredCommands.slice(
        pageNo * client.config.helpCmdPerPage,
        pageNo * client.config.helpCmdPerPage + client.config.helpCmdPerPage
      );

      tempArray.forEach((cmd) => {
        //console.log(cmd);
        helpEmbed
          .addFields({ name: cmd.name, value: cmd.description })
          .setFooter({ text: `Página ${pageNo + 1} / ${maxPages}` });
      });
      helpEmbed.addFields({
        name: "Créditos",
        value:
          `HieloMusic v${
            require("../../package.json").version
          }` +
          "\n" +
          `[Servidor de soporte](${client.config.supportServer}) | [Invítame](https://discord.com/oauth2/authorize?client_id=${client.config.clientId}&permissions=${client.config.permissions}&scope=bot%20applications.commands)`,
      });
      await iter.update({
        embeds: [helpEmbed],
        components: [getButtons(pageNo)],
        fetchReply: true,
      });
    });
  });

module.exports = command;