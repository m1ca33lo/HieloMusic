const { SlashCommandBuilder,EmbedBuilder } = require("@discordjs/builders");
const {
	CommandInteraction,
	ChatInputCommandInteraction,
	CommandInteractionOptionResolver,
} = require("discord.js");
const HieloMusic = require("./HieloMusic");

class SlashCommand extends SlashCommandBuilder {
	constructor() {
		super();
		this.type = 1;
		return this;
	}
	
	/**
	 * Set Execution of the command
	 * @param {(client: HieloMusic, interaction: CommandInteraction,ChatInputCommandInteraction options: CommandInteractionOptionResolver) => Promise<any>} callback
	 */
	setRun(callback) {
		this.run = callback;
		return this;
	}
}

module.exports = SlashCommand;
