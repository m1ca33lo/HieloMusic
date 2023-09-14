/**
 *
 * @param {import("../lib/HieloMusic")} client
 */
module.exports = (client) => {
	client.manager.init(client.user.id);
	client.user.setPresence(client.config.presence);
	client.log("Ya cargué tu huevada de " + client.user.tag);
};
