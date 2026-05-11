import {
    Client, GatewayIntentBits, REST, Routes
} from 'discord.js';

import { MESSAGES } from '#i18n'
import * as handler from '#handler';
import * as file from '#file';
import * as log from '#log';

export class DiscordBot extends Client {

    constructor() { super({ intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds]});
        this.commands = new Map();
        this.jjing = {path: 'src/commands',
                        delay: 5, count: 3}
        this.#initialize();
    }

    #initialize() {
        this.once('clientReady', async () => {
            await this.ready();
        });

        this.on('interactionCreate', (i) => {
            handler.interaction(this, i);
        });

        this.on('messageCreate', (m) => {
            handler.message(this, m);
        });
    }

    config(options = {}) {
        const valid = Object.fromEntries(
            Object.entries(options)
            .filter(([_, v]) => v !== undefined));

        Object.assign(this.jjing, valid);
    }

    async loadScripts(path = '') {
        let js;
        try {
            if (!path) {
                path = this.getPath();
            }

            js = file.dir(path)
                .filter(file =>
                file.endsWith('.js'));
        } catch (e) {
            log.error('❌', String(path),
                MESSAGES.LOAD.NOT_FOUND);
            handler.error(e);
        }
        
        log.info('⏰', String(path),
            MESSAGES.LOAD.ATTEMPT);
        await this.#read(js, path);
    }

    async reloadScripts(path = '') {
        this.#printBanner();
        this.deploy = true;

        if (!this.isReady()) {
            return log.warn(
                MESSAGES.REFRESH.NOT_RUNNING);
        }

        handler.clear();
        this.commands.clear();

        await this.loadScripts(path);
        await this.deployCommands();
    }

    async #read(files, path) {
        for (const name of files) {
            try {
                const url = file.url(path, name);
                const mod = await import(
                    `${url}?v=${Date.now()}`);

                if (!mod.default) continue;
                mod.default.events?.();
                this.#register(mod.default);

                log.load('📄', name,
                    MESSAGES.LOAD.SUCCESS);
            } catch (e) {
                log.error('📄', name,
                    MESSAGES.LOAD.FAIL);
                handler.error(e);
            }
        }
    }

    #register(m) {
        m.commands?.forEach(cmd => {
            this.commands.set(cmd.name, cmd);
        });
    }

    async deployCommands() {
        try {
            if (!this.getClientId()) {
                this.#undefinedClient();
            }

            if (!this.getGuildId()) {
                this.#undefinedGuild();
            }

            const rest = new REST({ version: '10' })
                .setToken(this.#getToken());
            
            this.deploy = false;

            log.info(MESSAGES.COMMAND.ATTEMPT);

            const body = [...this.commands.values()]
                .map(cmd => cmd.toJSON());

            await rest.put(
                Routes.applicationGuildCommands(
                    this.getClientId(),
                    this.getGuildId()
                ), { body }
            );
            
            await rest.put(
                Routes.applicationCommands(
                    this.getClientId()
                ), { body: [] }
            );

            this.deploy = true;

            log.load(MESSAGES.COMMAND.SUCCESS);
        } catch (e) {
            this.deploy = true;

            log.error(MESSAGES.COMMAND.FAIL);
            handler.error(e);
        }
    }

    getName() {
        return process.env[this.jjing?.name]
            || this.jjing?.name;
    }

    getPath() {
        return process.env[this.jjing?.path]
            || this.jjing?.path;
    }

    getClientId() {
        return process.env[this.jjing?.clientId]
            || this.jjing?.clientId;
    }

    getGuildId() {
        return process.env[this.jjing?.guildId]
            || this.jjing?.guildId;
    }

    #getToken() {
        return process.env[this.jjing?.token]
            || this.jjing?.token;
    }

    getStatus() {
        return process.env[this.jjing?.status]
            || this.jjing?.status;
    }

    getCount() {
        return process.env[this.jjing?.count]
            || this.jjing?.count;
    }

    getDelay() {
        return process.env[this.jjing?.delay]
            || this.jjing?.delay;
    }

    async getGlobal() {
        const res = await this.isGlobal();
        if (res) {
            return '🟢';
        } else {
            return '🔴';
        }
    }

    async isGlobal() {
        try {
            const rest = new REST({ version: '10' })
                .setToken(this.#getToken());
            
            if (!this.getClientId()) {
                return false;
            }
            
            const commands = await rest.get(
                Routes.applicationCommands(
                    this.user.id
                )
            );
            
            return true;
        } catch {
            return false;
        }
    }

    async getGuild() {
        const res = await this.isGuild();
        if (res) {
            return '🟢';
        } else {
            return '🔴';
        }
    }

    async isGuild() {
        try {
            const rest = new REST({ version: '10' })
                .setToken(this.#getToken());
            
            if (!this.getGuildId()) {
                return false;
            }
            
            const commands = await rest.get(
                Routes.applicationGuildCommands(
                    this.user.id,
                    this.getGuildId()
                )
            );
            
            return true;
        } catch {
            return false;
        }
    }

    isDeploy() { return this.deploy; }

    infoStatus() {
        return MESSAGES.STATUS[
            this.user?.presence.status.toUpperCase()]
            || MESSAGES.STATUS.INVISIBLE;
    }
    
    async #changeStatus(status) {
        if (!status) return;
        this.user?.setPresence({status});
        log.info(this.infoStatus());
    }

    async #printGuild(guildId) {
        try {
            if (!guildId) {
                this.#undefinedGuild();
            }

            const guild = await this
                .guilds.fetch(guildId);
            
            log.load(
                MESSAGES.GUILD.SUCCESS);
            log.info('🚪', guild.name);
        } catch (e) {
            log.error(
                MESSAGES.GUILD.FAIL);
            handler.error(e);
        }
    }

    async ready() {
        this.#printBanner(this.getName());

        log.load(MESSAGES.LOGIN.SUCCESS);
        log.info('👤', this.user.tag);

        await this.#changeStatus(this.getStatus())
        await this.#printGuild(this.getGuildId());
        await this.loadScripts(this.getPath());

        await this.deployCommands();
    }

    async start(retry = 0) {
        try {
            if (this.isReady()) {
                this.#printBanner();
                return log.warn(
                    MESSAGES.LOGIN.RUNNING);
            }

            if (!this.#getToken()) {
                this.#undefinedToken();
            }

            await this.login(
                this.#getToken());
                
            this.deploy = false;
        } catch (e) {
            this.#printBanner();
            this.#errorStart(e, retry)
        }
    }

    async stop(skip = false) {
        try {
            if (skip) {
                this.commands.clear();
                await this.destroy();
                return;
            }

            this.#printBanner();
            this.deploy = true;

            if (!this.isReady()) {
                return log.warn(
                    MESSAGES.LOGOUT.STOPPED);
            }

            this.commands?.clear();
            await this.destroy();

            log.load(
                MESSAGES.LOGOUT.SUCCESS);
        } catch (e) {
            log.error(
                MESSAGES.LOGOUT.FAIL);
            handler.error(e);
        }
    }
    
    #printBanner(name = '') {
        if (!name) {
            name = this.getName();
        }

        if (!name) return;
        log.prompt('')
        log.prompt('───────────────────────────────────────')
        log.prompt(`${name}`);
        log.prompt('───────────────────────────────────────')
    }

    #errorStart(error, retry) {
        return new Promise((resolve) => {
        
        this.deploy = false;

        log.error(
            MESSAGES.LOGIN.FAIL);
        handler.error(error);

        if (!this.getCount() || !this.getDelay()) {
            return;
        }

        if (retry >= this.getCount()) {
            this.deploy = true;
            log.error(
                MESSAGES.LOGIN.RETRY_LIMIT);
            resolve(true);
            return;
        }

        log.warn(
            MESSAGES.LOGIN.RETRY_COUNT(
                this.getDelay(), 
                retry + 1,
                this.getCount()));

        setTimeout(() => {
            this.start(retry + 1);
        }, this.getDelay() * 1000);

        });
    }

    #undefinedClient() {
        throw new Error(
            MESSAGES.COMMAND.CLIENT_UNDEFINED);
    }

    #undefinedGuild() {
        throw new Error(
            MESSAGES.GUILD.UNDEFINED);
    }

    #undefinedToken() {
        throw new Error(
            MESSAGES.LOGIN.TOKEN_UNDEFINED);
    }
}