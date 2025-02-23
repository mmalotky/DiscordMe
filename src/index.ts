import * as dotenv from "dotenv";
import { Client, IntentsBitField, Events } from "discord.js";
import CommandsHandler from "./handlers/CommandsHandler.js";
import GroupMeController from "./handlers/GroupMeController.js";
import { ERR, INFO } from "./utility/LogMessage.js";

class Init {
	/**
	 * Set up, initiation, and start up scripts.
	 */

	/** Setup Discord Client */
	private client = new Client({
		intents:[
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.MessageContent
		]
	});

	/** Initiate GroupMe Controller */
	private groupMeController = new GroupMeController();
	/** Initiate Discord Commands */
	private commandsHandler = new CommandsHandler(this.groupMeController);

	/** 
	 * Start up scripts. Aquire Tokens for GroupMe and Discord, 
	 * register new commands, and begin listening for Discord Commands
	 * */
	main() {
		dotenv.config();
		this.client.login(process.env.DISCORD_TOKEN);
		this.groupMeController.setToken(process.env.GROUPME_TOKEN);

		this.client.once(Events.ClientReady, () => {
			INFO("DiscordMe Starting");
			this.commandsHandler.register();
			this.handleCommands();
			INFO("DiscordMe Online")
		});

	}

	/** 
	 * Listen for Discord commands. Look up registered command, then execute the
	 * command according to the interaction parameters, sends an error message to
	 * Discord if the operation fails.
	 */
	private handleCommands() {
		this.client.on(Events.InteractionCreate, async (interaction) => {
			if(!interaction.isChatInputCommand()) return;
			const command = this.commandsHandler
				.getCommands()
				.filter(c => c.getData().name === interaction.commandName)[0];
		
			if (!command) {
				ERR(`No command matching ${interaction.commandName} was found.`);
				return;
			}
		
			try {
				await command.execute(interaction);
			} catch (error) {
				ERR(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ 
						content: 'There was an error while executing this command!', 
						ephemeral: true 
					});
				} else {
					await interaction.reply({ 
						content: 'There was an error while executing this command!', 
						ephemeral: true 
					});
				}
			}
		});
	}
}

new Init().main();


