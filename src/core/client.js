import {
    Client, GatewayIntentBits, REST, Routes
} from 'discord.js';

import { MESSAGES } from '#message'
import * as handler from '#handler';

import * as file from '#file';
import * as log from '#log';

const STATUS = Object.freeze({
    online: MESSAGES.STATUS.ONLINE,
    idle: MESSAGES.STATUS.IDLE,
    dnd: MESSAGES.STATUS.DND,
    invisible: MESSAGES.STATUS.INVISIBLE,
    unknown: MESSAGES.STATUS.UNKNOWN,
});

export class JjingBot extends Client {

    constructor() { super({ intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds]});
    
        this.jjing = {
            name: '',
            path: 'src/commands',

            delay: 5,
            count: 3,
        }

        this.commands = new Map();
        this.customIds = new Map();
        this.messages = new Map();

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

    #register(inst) {
        inst.commands?.forEach(cmd => {
            this.commands.set(cmd.name, inst);
        });

        inst.customId?.forEach(id => {
            this.customIds.set(id, inst);
        });

        if (inst.message) {
            this.messages.set(inst.name, inst);
        }
    }

    #getToken() {
        return process.env[this.jjing?.token];
    }

    async loadScripts(path = '') {
        let js;
        try {
            if (!path) {
                path = this.jjing?.path;
            }

            js = file.dir(path)
                .filter(file =>
                file.endsWith('.js'));
        } catch (e) {
            log.error('❌', String(path),
                MESSAGES.LOAD.NOT_FOUND);
            handler.error(e);
        }
        
        await this.#read(js, path);
    }

    async reloadScripts(path = '') {
        this.#printBanner();
        this.deploy = true;

        if (!this.isReady()) {
            return log.warn(
                MESSAGES.REFRESH.NOT_RUNNING);
        }

        this.commands.clear();
        this.customIds.clear();
        this.messages.clear();

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
                        
                this.#register(mod.default);

                log.load('⭕',
                    file.join(path, name),
                    MESSAGES.LOAD.SUCCESS);
            } catch (e) {
                log.error('❌',
                    file.join(path, name),
                    MESSAGES.LOAD.FAIL);
                handler.error(e);
            }
        }
    }

    async isGlobal() {
        try {
            const rest = new REST({ version: '10' })
                .setToken(this.#getToken());
            
            if (!this.jjing?.clientId) {
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

    async isGuild() {
        try {
            const rest = new REST({ version: '10' })
                .setToken(this.#getToken());
            
            if (!this.jjing?.guildId) {
                return false;
            }
            
            const commands = await rest.get(
                Routes.applicationGuildCommands(
                    this.user.id,
                    this.jjing?.guildId
                )
            );
            
            return true;
        } catch {
            return false;
        }
    }

    isDeploy() { return this.deploy; }

    async deployCommands() {
        try {
            if (!this.jjing?.clientId) {
                this.#undefinedClient();
            }

            if (!this.jjing?.guildId) {
                this.#undefinedGuild();
            }

            const rest = new REST({ version: '10' })
                .setToken(this.#getToken());
            
            this.deploy = false;

            log.info(MESSAGES.COMMAND.ATTEMPT);

            const body = [...new Set(
                this.commands.values())]
                .flatMap(c =>
                c.commands?.map(cmd =>
                cmd.toJSON()) ?? []);

            await rest.put(
                Routes.applicationGuildCommands(
                    this.jjing?.clientId,
                    this.jjing?.guildId
                ), { body }
            );
            
            await rest.put(
                Routes.applicationCommands(
                    this.jjing?.clientId
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

    #undefinedClient() {
        throw new Error(
            MESSAGES.COMMAND.CLIENT_UNDEFINED);
    }

    config(options = {}) {
        const valid = Object.fromEntries(
            Object.entries(options)
            .filter(([_, v]) => v !== undefined));

        Object.assign(this.jjing, valid);
    }

    async ready() {
        this.#printBanner(this.jjing?.name);

        log.load(MESSAGES.LOGIN.SUCCESS);
        log.info('👤', this.user.tag);

        this.#changeStatus(this.jjing?.status)

        this.#printGuild(this.jjing?.guildId);

        await this.loadScripts(this.jjing?.path);

        await this.deployCommands();
    }
    
    #printBanner(name = '') {
        if (!name) {
            name = this.jjing?.name;
        }

        if (!name) return;
        log.prompt('')
        log.prompt('─────────────────────────')
        log.prompt(`${name}`);
        log.prompt('─────────────────────────')
    }

    getStatus() {
        return STATUS[this.user?.presence.status]
            || STATUS.invisible;
    }
    
    #changeStatus(status) {
        if (!status) return;
        this.user?.setPresence({status});
        log.info(this.getStatus());
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

    #undefinedGuild() {
        throw new Error(
            MESSAGES.GUILD.GUILD_UNDEFINED);
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

    #undefinedToken() {
        throw new Error(
            MESSAGES.LOGIN.TOKEN_UNDEFINED);
    }d

    #errorStart(error, retry) {
        return new Promise((resolve) => {
        
        this.deploy = false;

        log.error(
            MESSAGES.LOGIN.FAIL);
        handler.error(error);

        if (!this.jjing?.count
        || !this.jjing?.delay) {
            return;
        }

        if (retry >= this.jjing?.count) {
            this.deploy = true;
            log.error(
                MESSAGES.LOGIN.RETRY_LIMIT);
            resolve(true);
            return;
        }

        log.warn(
            MESSAGES.LOGIN.RETRY_COUNT(
                this.jjing?.delay, 
                retry + 1,
                this.jjing?.count));

        setTimeout(() => {
            this.start(retry + 1);
        }, this.jjing?.delay * 1000);

        });
    }

    async stop() {
        try {
            this.#printBanner();
            this.deploy = true;

            if (!this.isReady()) {
                return log.warn(
                    MESSAGES.LOGOUT.STOPPED);
            }
            
            this.commands.clear();
            this.customIds.clear();
            this.messages.clear();

            await this.destroy();

            log.load(
                MESSAGES.LOGOUT.SUCCESS);
        } catch (e) {
            log.error(
                MESSAGES.LOGOUT.FAIL);
            handler.error(e);
        }
    }
}