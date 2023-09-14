/**
 *
 * @param {import("../lib/HieloMusic")} client
 * @param {*} data
 */
module.exports = (client, data) => {
	client.manager.updateVoiceState(data);
};
