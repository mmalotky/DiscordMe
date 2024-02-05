import * as dotenv from "dotenv";
import { Client, IntentsBitField, Events } from "discord.js";
import CommandsHandler from "./handlers/CommandsHandler.js";
import GroupMeController from "./handlers/GroupMeController.js";

class Init {
	private client = new Client({
		intents:[
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.MessageContent
		]
	});

	private groupMeController = new GroupMeController();
	private commandsHandler = new CommandsHandler(this.groupMeController);

	main() {
		dotenv.config();
		this.client.login(process.env.DISCORD_TOKEN);
		this.groupMeController.setToken(process.env.GROUPME_TOKEN);

		this.client.once(Events.ClientReady, () => {
			console.log("[INFO] DiscordMe Starting");
			this.commandsHandler.register();
			this.handleCommands();
			this.handleModals();
			this.handleButtons();
			this.handleMenuInteractions();
			console.log("[INFO] DiscordMe Online")
		});

	}

	private handleCommands() {
		this.client.on(Events.InteractionCreate, async (interaction) => {
			if(!interaction.isChatInputCommand()) return;
			const command = this.commandsHandler
				.getCommands()
				.filter(c => c.getData().name === interaction.commandName)[0];
		
			if (!command) {
				console.error(`[ERR] No command matching ${interaction.commandName} was found.`);
				return;
			}
		
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
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

	private handleModals() {
		this.client.on(Events.InteractionCreate, async (interaction) => {
			if(!interaction.isModalSubmit()) return;
			const modalId = interaction.customId;
		});
	}

	private handleButtons() {
		this.client.on(Events.InteractionCreate, async (interaction) => {
			if(!interaction.isButton()) return;
			const buttonId = interaction.customId;
		});
	}

	private handleMenuInteractions() {
		this.client.on(Events.InteractionCreate, async (interaction) => {
			if(!interaction.isStringSelectMenu()) return;
			const menuID = interaction.customId;
		})
	}

}

new Init().main();


