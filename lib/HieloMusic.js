const {
  Client,
  Intents,
  MessageEmbed,
  Collection,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const escapeMarkdown = require('discord.js').Util.escapeMarkdown;
const fs = require("fs");
const path = require("path");
const prettyMilliseconds = require("pretty-ms");
const jsoning = require("jsoning"); // Documentation: https://jsoning.js.org/
const { Manager } = require("erela.js");
const ConfigFetcher = require("../util/getConfig");
const Logger = require("./Logger");
const spotify = require("better-erela.js-spotify").default;
const spotify2 = require("erela.js-spotify");
const { default: AppleMusic } = require("better-erela.js-apple");
const deezer = require("erela.js-deezer");
const facebook = require("erela.js-facebook");
const Server = require("../api");
const getLavalink = require("../util/getLavalink");
const getChannel = require("../util/getChannel");
const colors = require("colors");
const filters = require("erela.js-filters");
const { default: EpicPlayer } = require("./EpicPlayer");
const imagenes = require('../imagenes');
const patreon = `https://www.patreon.com/Hielo976`;

class HieloMusic extends Client {

  /**
   * Create the music client
   * @param {import("discord.js").ClientOptions} props - Client options
   */

  constructor(
    props = {
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
      ],
    }
  ) {
    super(props);

    ConfigFetcher().then((conf) => {
      this.config = conf;
      this.build();
    });

    //Load Events and stuff
    /**@type {Collection<string, import("./SlashCommand")} */
    this.slashCommands = new Collection();
    this.contextCommands = new Collection();

    this.logger = new Logger(path.join(__dirname, "..", "logs.log"));

    this.LoadCommands();
    this.LoadEvents();

    this.database = new jsoning("db.json");

    this.deletedMessages = new WeakSet();
    this.getLavalink = getLavalink;
    this.getChannel = getChannel;
    this.ms = prettyMilliseconds;
    this.commandsRan = 0;
    this.songsPlayed = 0;
  }

  /**
   * Send an info message
   * @param {string} text
   */
  log(text) {
    this.logger.log(text);
  }

  /**
   * Send an warning message
   * @param {string} text
   */
  warn(text) {
    this.logger.warn(text);
  }

  /**
   * Send an error message
   * @param {string} text
   */
  error(text) {
    this.logger.error(text);
  }

  /**
   * Build em
   */
  build() {
    this.warn("Iniciando el desmadre");
    this.login(this.config.token);
    this.server = this.config.website?.length ? new Server(this) : null; // constructing also starts it; Do not start server when no website configured
    if (this.config.debug === true) {
      this.warn("Debug mode is enabled!");
      this.warn("Only enable this if you know what you are doing!");
      process.on("unhandledRejection", (error) => console.log(error));
      process.on("uncaughtException", (error) => console.log(error));
    } else {
      process.on("unhandledRejection", (error) => {
        return;
      });
      process.on("uncaughtException", (error) => {
        return;
      });
    }

    let client = this;

    /**
     * will hold at most 100 tracks, for the sake of autoPlay
     */
    let playedTracks = [];
    const patreonvote = new MessageActionRow().addComponents(
      new MessageButton().setStyle("LINK").setLabel(` Patreon`).setURL(patreon).setEmoji(`<:patreonlogo:1133178641384218786>`),
      //new MessageButton()
      //  .setStyle("LINK")
      //  .setLabel(" Vote Me!")
      //  .setURL(``)
      //  .setEmoji(`<:voteme:1133187071054446672>`),
    );
    this.manager = new Manager({
      plugins: [
        new deezer(),
        new AppleMusic(),
        new spotify(),
        new facebook(),
        new filters(),
      ],
      autoPlay: true,
      nodes: this.config.nodes,
      retryDelay: this.config.retryDelay,
      retryAmount: this.config.retryAmount,
      clientName: `HieloMusic/v${require("../package.json").version} (Bot: ${
        this.config.clientId
      })`,
      send: (id, payload) => {
        let guild = client.guilds.cache.get(id);
        if (guild) {
          guild.shard.send(payload);
        }
      },
    })
      .on("nodeConnect", (node) =>
        this.log(
          `Node: ${node.options.identifier} | El Reproductor está conectado`
        )
      )
      .on("nodeReconnect", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | El Reproductor se está reconectando.`
        )
      )
      .on("nodeDestroy", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | Se acaba de destruir el reproductor.`
        )
      )
      .on("nodeDisconnect", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | El Reproductor está desconectado.`
        )
      )
      .on("nodeError", (node, err) => {
        this.warn(
          `Node: ${node.options.identifier} | El Reproductor tiene un error: ${err.message}.`
        );
      })
      // on track error warn and create embed
      .on("trackError", (player, err) => {
        this.warn(
          `Player: ${player.options.guild} | La canción tiene un error: ${err.message}.`
        );
        //console.log(err);
        let song = player.queue.current;
        var title = escapeMarkdown(song.title)
        var title = title.replace(/\]/g,"")
        var title = title.replace(/\[/g,"")
        
        let errorEmbed = new MessageEmbed()
          .setColor("RED")
          .setTitle("Error de reproducción!")
          .setDescription(`Falló algo al cargar la canción: \`${title}\``)
          .setImage(imagenes.error)
          .setFooter({
            text: "Salió algo mal pero tranqui que la cagué yo!",
          });
        client.channels.cache
          .get(player.textChannel)
          .send({ embeds: [errorEmbed] });
      })

      .on("trackStuck", (player, err) => {
        this.warn(`La canción tiene un error: ${err.message}`);
        //console.log(err);
        let song = player.queue.current;
        var title = escapeMarkdown(song.title)
        var title = title.replace(/\]/g,"")
        var title = title.replace(/\[/g,"")
        
        let errorEmbed = new MessageEmbed()
          .setColor("RED")
          .setTitle("Error en la canción!")
          .setDescription(`Error al cargar la canción: \`${title}\``)
          .setImage(imagenes.error)
          .setFooter({
            text: "Salió algo mal pero tranqui que la cagué yo!",
          });
        client.channels.cache
          .get(player.textChannel)
          .send({ embeds: [errorEmbed] });
      })
      .on("playerMove", (player, oldChannel, newChannel) => {
        const guild = client.guilds.cache.get(player.guild);
        if (!guild) {
          return;
        }
        const channel = guild.channels.cache.get(player.textChannel);
        if (oldChannel === newChannel) {
          return;
        }
        if (newChannel === null || !newChannel) {
          if (!player) {
            return;
          }
          if (channel) {
            channel.send({
              embeds: [
                new MessageEmbed()
                  .setColor(client.config.embedColor)
                  .setDescription(`Desconectado de <#${oldChannel}>`),
              ],
            });
          }
          return player.destroy();
        } else {
          player.voiceChannel = newChannel;
          setTimeout(() => player.pause(false), 1000);
          return undefined;
        }
      })
      .on("playerCreate", (player) => {
        player.set("twentyFourSeven", client.config.twentyFourSeven);
        player.set("autoPlay", client.config.autoPlay);
        player.set("autoPause", client.config.autoPause);
        player.set("autoLeave", client.config.autoLeave);
        this.warn(
          `Jugador: ${
            player.options.guild
          } | Se ha creado un jugador salvaje en ${
            client.guilds.cache.get(player.options.guild)
              ? client.guilds.cache.get(player.options.guild).name
              : "a guild"
          }`
        );
      })
      .on("playerDestroy", (player) => {
        this.warn(
          `Jugador: ${player.options.guild} | Un jugador salvaje ha sido destruido en ${client.guilds.cache.get(player.options.guild)
              ? client.guilds.cache.get(player.options.guild).name
              : "a guild"
          }`
        )
        player.setNowplayingMessage(client, null);
      })
      // on LOAD_FAILED send error message
      .on("loadFailed", (node, type, error) =>
        this.warn(
          `Node: ${node.options.identifier} | Falló al cargar ${type}: ${error.message}`
        )
      )
      // on TRACK_START send message
      .on(
        "trackStart",
        /** @param {EpicPlayer} player */ async (player, track) => {
          this.songsPlayed++;
          playedTracks.push(track.identifier);
          if (playedTracks.length >= 300) {
            playedTracks.shift();
          }

          this.warn(
            `Jugador: ${
              player.options.guild
            } | La canción ha comenzado a reproducirse [${colors.blue(track.title)}]`
          );
            var title = escapeMarkdown(track.title)
            var title = title.replace(/\]/g,"")
            var title = title.replace(/\[/g,"")
          let trackStartedEmbed = this.Embed()
            .setAuthor({ name: "Reproduciendo ahora", iconURL: imagenes.playdj })
            .setDescription(
              `[${title}](${track.uri})` || "Sin descripciones"
            )
            .addFields(
              {
                name: "Pedido por",
                value: `${track.requester || `<@${client.user.id}>`}`,
                inline: true,
              },
              {
                name: "Duración",
                value: track.isStream
                  ? `\`LIVE\``
                  : `\`${prettyMilliseconds(track.duration, {
                      colonNotation: true,
                    })}\``,
                inline: true,
              }
            );
          try {
            trackStartedEmbed.setThumbnail(
              track.displayThumbnail("maxresdefault")
            );
          } catch (err) {
            trackStartedEmbed.setThumbnail(track.thumbnail);
          }
          let nowPlaying = await client.channels.cache
            .get(player.textChannel)
            .send({
              embeds: [trackStartedEmbed],
              components: [
                client.createController(player.options.guild, player),
              ],
            })
            .catch(this.warn);
          player.setNowplayingMessage(client, nowPlaying);
      }
      )
    
      .on(
        "playerDisconnect",
          /** @param {EpicPlayer} */ async (player) => {
            if (player.twentyFourSeven) {
              player.queue.clear();
              player.stop();
              player.set("autoPlay", false);
            } else {
              player.destroy();
            }
          }
      )
    
      .on(
        "queueEnd",
        /** @param {EpicPlayer} */ async (player, track) => {
          const autoPlay = player.get("autoPlay");

          if (autoPlay) {
            const requester = player.get("requester");
            const identifier = track.identifier;
            const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
            const res = await player.search(search, requester);
            let nextTrackIndex;

            res.tracks.some((track, index) => {
              nextTrackIndex = index;
              return !playedTracks.includes(track.identifier);
            });

            if (res.exception) {
              client.channels.cache.get(player.textChannel).send({
                embeds: [
                  new MessageEmbed()
                    .setColor("RED")
                    .setAuthor({
                      name: `${res.exception.severity}`,
                      iconURL: client.config.iconURL,
                    })
                    .setDescription(
                      `No se pudo cargar la canción.\n**ERROR:** ${res.exception.message}`
                    )
                    .setImage(imagenes.error),
                ],
              });
              return player.destroy();
            }

            player.play(res.tracks[nextTrackIndex]);
            player.queue.previous = track;
          } else {
            const twentyFourSeven = player.get("twentyFourSeven");
            let queueEmbed = new MessageEmbed()
              .setColor(client.config.embedColor)
              .setAuthor({
                name: "Me quedé sin canciones",
                iconURL: client.config.iconURL,
              })
              .setDescription("Si no se reproduce ninguna canción durante 3 minutos, me tendré que ir.\nEsto se puede deshabilitar usando el comando </247:1120078715532099664> o\nUsa también el </autoplay:1147404122920865882> para que no te quedes sin canciones.")
              .setImage(imagenes.sincanciones)
              .setTimestamp();
            let EndQueue = await client.channels.cache
              .get(player.textChannel)
              .send({ embeds: [queueEmbed], components: [patreonvote], });
            setTimeout(() => EndQueue.delete(true), 180000);
            try {
              if (!player.playing && !twentyFourSeven) {
                setTimeout(async () => {
                  if (!player.playing && player.state !== "DISCONNECTED") {
                    let disconnectedEmbed = new MessageEmbed()
                      .setColor(client.config.embedColor)
                      .setAuthor({
                        name: "Desconectado!",
                        iconURL: client.config.iconURL,
                      })
                      .setDescription(
                        `Gracias por usar nuestro servicio.\nÚnete a nuestro [Servidor de Soporte](${client.config.supportServer}) para obtener \ninformación de actualizaciones, problemas y debates sobre el bot.`
                      )
                      .setImage(imagenes.desconectado)
                      .setFooter("¡sus sugerencias y opiniones siempre son consideradas!")
                      .setTimestamp();
                    let Disconnected = await client.channels.cache
                      .get(player.textChannel)
                      .send({ embeds: [disconnectedEmbed], components: [patreonvote], });
                    setTimeout(() => Disconnected.delete(true), 30000);
                    player.destroy();
                  } else if (player.playing) {
                    client.warn(
                      `Jugador: ${player.options.guild} | Sigue jugando`
                    );
                  }
                }, client.config.disconnectTime);
              } else if (!player.playing && twentyFourSeven) {
                client.warn(
                  `Jugador: ${
                    player.options.guild
                  } | La cola ha terminado [${colors.blue("24/7 HABILITADO")}]`
                );
              } else {
                client.warn(
                  `Sucedió algo inesperado con el reproductor. ${player.options.guild}`
                );
              }
              player.setNowplayingMessage(client, null);
            } catch (err) {
              client.error(err);
            }
          }
        }
      );
  }

  /**
   * Checks if a message has been deleted during the run time of the Bot
   * @param {Message} message
   * @returns
   */
  isMessageDeleted(message) {
    return this.deletedMessages.has(message);
  }

  /**
   * Marks (adds) a message on the client's `deletedMessages` WeakSet so it's
   * state can be seen through the code
   * @param {Message} message
   */
  markMessageAsDeleted(message) {
    this.deletedMessages.add(message);
  }

  /**
   *
   * @param {string} text
   * @returns {MessageEmbed}
   */
  Embed(text) {
    let embed = new MessageEmbed().setColor(this.config.embedColor);

    if (text) {
      embed.setDescription(text);
    }

    return embed;
  }

  /**
   *
   * @param {string} text
   * @returns {MessageEmbed}
   */
  ErrorEmbed(text) {
    let embed = new MessageEmbed()
      .setColor("RED")
      .setDescription("❌ | " + text);

    return embed;
  }

  LoadEvents() {
    let EventsDir = path.join(__dirname, "..", "events");
    fs.readdir(EventsDir, (err, files) => {
      if (err) {
        throw err;
      } else {
        files.forEach((file) => {
          const event = require(EventsDir + "/" + file);
          this.on(file.split(".")[0], event.bind(null, this));
          this.warn("Evento Cargado: " + file.split(".")[0]);
        });
      }
    });
  }

  LoadCommands() {
    let SlashCommandsDirectory = path.join(
      __dirname,
      "..",
      "commands",
      "slash"
    );
    fs.readdir(SlashCommandsDirectory, (err, files) => {
      if (err) {
        throw err;
      } else {
        files.forEach((file) => {
          let cmd = require(SlashCommandsDirectory + "/" + file);

          if (!cmd || !cmd.run) {
            return this.warn(
              "No se puede cargar el comando: " +
                file.split(".")[0] +
                ", El archivo no tiene un comando válido con función de ejecución"
            );
          }
          this.slashCommands.set(file.split(".")[0].toLowerCase(), cmd);
          this.log("Slash Command Loaded: " + file.split(".")[0]);
        });
      }
    });

    let ContextCommandsDirectory = path.join(
      __dirname,
      "..",
      "commands",
      "context"
    );
    fs.readdir(ContextCommandsDirectory, (err, files) => {
      if (err) {
        throw err;
      } else {
        files.forEach((file) => {
          let cmd = require(ContextCommandsDirectory + "/" + file);
          if (!cmd.command || !cmd.run) {
            return this.warn(
              "No se puede cargar el comando: " +
                file.split(".")[0] +
                ", El archivo no tiene comando/ejecutar"
            );
          }
          this.contextCommands.set(file.split(".")[0].toLowerCase(), cmd);
          this.log("Menú contextual cargado: " + file.split(".")[0]);
        });
      }
    });
  }

  /**
   *
   * @param {import("discord.js").TextChannel} textChannel
   * @param {import("discord.js").VoiceChannel} voiceChannel
   */
  createPlayer(textChannel, voiceChannel) {
    return this.manager.create({
      guild: textChannel.guild.id,
      voiceChannel: voiceChannel.id,
      textChannel: textChannel.id,
      selfDeafen: this.config.serverDeafen,
      volume: this.config.defaultVolume,
    });
  }

  createController(guild, player) {
    return new MessageActionRow().addComponents(
      new MessageButton()
        .setStyle("DANGER")
        .setCustomId(`controller:${guild}:Stop`)
        .setEmoji("<:stopice:1137454771079491698>"),

      new MessageButton()
        .setStyle("PRIMARY")
        .setCustomId(`controller:${guild}:Replay`)
        .setEmoji("<:bfwice:1137454575134179400>"),

      new MessageButton()
        .setStyle(player.playing ? "PRIMARY" : "DANGER")
        .setCustomId(`controller:${guild}:PlayAndPause`)
        .setEmoji(player.playing ? "<:pauseice:1137454859700932608>" : "<:playice:1137454831783653406>"),

      new MessageButton()
        .setStyle("PRIMARY")
        .setCustomId(`controller:${guild}:Next`)
        .setEmoji("<:ffwice:1137454491747233834>"),

      new MessageButton()
        .setStyle(
          player.trackRepeat
            ? "SUCCESS"
            : player.queueRepeat
            ? "SUCCESS"
            : "DANGER"
        )
        .setCustomId(`controller:${guild}:Loop`)
        .setEmoji(player.trackRepeat ? "<:loopice:1137454454032060567>" : player.queueRepeat ? "<:loop1ice:1139315823937343519>" : "<:loopice:1137454454032060567>")
    );
  }
}

module.exports = HieloMusic;
