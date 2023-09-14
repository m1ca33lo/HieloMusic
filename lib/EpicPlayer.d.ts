import { Message } from "discord.js";
import { Player } from "erela.js";
import HieloMusic from "./HieloMusic";

declare class EpicPlayer extends Player {
    private resumeMessage: Message<boolean>;
    private pausedMessage: Message<boolean>;
    private nowPlayingMessage: Message<boolean>;
    
    // add more undefined member and method types here

    public setResumeMessage(client: HieloMusic, message: Message): Message<boolean>;
    public setPausedMessage(client: HieloMusic, message: Message): Message<boolean>;
    public setNowplayingMessage(client: HieloMusic, message: Message): Message<boolean>;
}

export default EpicPlayer;
