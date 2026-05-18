import {
    Client, GatewayIntentBits, REST, Routes
} from 'discord.js';
import { MESSAGES } from '#i18n'
import * as handler from '#services/handler';
import * as file from '#utils/file';
import * as log from '#utils/log';
import { uptime } from '#utils/time';

const LINE = '───────────────────────────────────────────────';

export class DiscordBot extends Client {

    constructor() { super({ intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds] });
        this.commands = new Map();
        this.jjing = {path: 'src/commands'}
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
            .filter(([_, v]) => v !== undefined)
        );
        Object.assign(this.jjing, valid);
    }

    async loadScripts(path = '') {
        let js;
        try {
            if (!path) {
                path = this.getPath();
            }
            js = file.dir(path).filter(file =>
                file.endsWith('.js')
            );
        } catch (e) {
            log.error('❌', String(path),
                MESSAGES.LOAD.NOT_FOUND);
            handler.error(e);
        }
        log.info('⏰', String(path),
            MESSAGES.LOAD.ATTEMPT);
        await this.#read(js, path);
    }

    async #read(files, path) {
        for (const name of files) {
            try {
                const url = file.url(path, name);
                const mod = await import(
                    `${url}?v=${Date.now()}`
                );
                if (!mod.default) continue;
                mod.default.events?.();
                this.#register(mod.default);
                log.load('📄',
                    name.replaceAll('\\', '/'),
                    MESSAGES.LOAD.SUCCESS
                );
            } catch (e) {
                log.error('📄',
                    name.replaceAll('\\', '/'),
                    MESSAGES.LOAD.FAIL
                );
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
                .setToken(this.#getToken()
            );
            log.info(MESSAGES.COMMAND.ATTEMPT);
            const body = [...this.commands.values()]
                .map(cmd => cmd.toJSON()
            );
            await rest.put(
                Routes.applicationGuildCommands(
                    this.getClientId(),
                    this.getGuildId()), { body }
            );
            await rest.put(
                Routes.applicationCommands(
                    this.getClientId()), { body: [] }
            );
            log.load(MESSAGES.COMMAND.SUCCESS);
            await this.emit('command');
        } catch (e) {
            log.error(MESSAGES.COMMAND.FAIL);
            handler.error(e);
            this.emit('command');
        }
    }

    getName() {
        return process.env[this.jjing?.name]
            || this.jjing?.name;
    }

    getTag() {
        return this.user.tag
            || MESSAGES.STATUS.UNKNOWN;
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
            return MESSAGES.STATUS.CONNECTED;
        } else {
            return MESSAGES.STATUS.DISCONNECTED;
        }
    }

    async isGlobal() {
        try {
            const rest = new REST({ version: '10' })
                .setToken(this.#getToken()
            );
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
            return MESSAGES.STATUS.CONNECTED;
        } else {
            return MESSAGES.STATUS.DISCONNECTED;
        }
    }

    async isGuild() {
        try {
            const rest = new REST({ version: '10' })
                .setToken(this.#getToken()
            );
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

    async infoStatus() {
        const status = this.user?.presence?.status;
        if (!status)
            return MESSAGES.STATUS.INVISIBLE;
        return MESSAGES.STATUS[status.toUpperCase()]
            || MESSAGES.STATUS.INVISIBLE;
    }
    
    async #changeStatus(status) {
        if (!status) return;
        this.user?.setPresence({ status });
        log.info(await this.infoStatus());
    }

    async #printGuild(guildId) {
        try {
            if (!guildId) {
                this.#undefinedGuild();
            }
            const guild = await this
                .guilds.fetch(guildId);
            log.load(MESSAGES.GUILD.SUCCESS);
            log.info('🚪', guild.name);
        } catch (e) {
            log.error(MESSAGES.GUILD.FAIL);
            handler.error(e);
        }
    }

    async ready() {
        this.#printBanner(this.getName());
        log.info('👤', this.user.tag);
        await this.#changeStatus(this.getStatus())
        await this.#printGuild(this.getGuildId());
        await this.loadScripts(this.getPath());
        await this.deployCommands();
        await this.emit('start');
        log.ready(MESSAGES.LOGIN.SUCCESS);
    }

    async start(retry = 0) {
        try {
            if (this.isReady()) {
                this.#printBanner();
                log.warn(MESSAGES.LOGIN.RUNNING);
                this.emit('start');
                return false;
            }
            if (!this.#getToken()) {
                this.#undefinedToken();
            }
            await this.login(this.#getToken());
            return true;
        } catch (e) {
            this.#printBanner();
            await this.#errorStart(e, retry);
            await this.emit('start');
            return false;
        }
    }

    async restart() {
        await this.stop(true);
        await this.start();
    }

    async stop(skip = false) {
        try {
            if (skip) {
                if (!this.isReady()) {
                    this.emit('stop');
                    return false;
                }
                this.commands.clear();
                await this.destroy();
                await this.emit('stop');
                return true;
            }
            this.#printBanner();
            if (!this.isReady()) {
                log.warn(MESSAGES.LOGOUT.STOPPED);
                this.emit('stop');
                return false;
            }
            this.commands?.clear();
            await this.destroy();
            log.load(MESSAGES.LOGOUT.SUCCESS);
            await this.emit('stop');
            return true;
        } catch (e) {
            log.error(MESSAGES.LOGOUT.FAIL);
            handler.error(e);
            this.emit('stop');
            return false;
        }
    }

    async status() {
        try {
            this.#printBanner();
            if (!this.isReady()) {
                log.warn(MESSAGES.STATUS.NOT_RUNNING);
                this.emit('status');
                return false;
            }
            log.prompt(MESSAGES.CLI.NAME,
                await this.getTag()
            );
            log.prompt(MESSAGES.CLI.STATUS,
                await this.infoStatus()
            );
            log.prompt(MESSAGES.CLI.GLOBAL,
                await this.getGlobal()
            );
            log.prompt(MESSAGES.CLI.GUILD,
                await this.getGuild()
            );
            log.prompt(MESSAGES.CLI.PING,
                `${this.ws?.ping}ms`
            );
            log.prompt(MESSAGES.CLI.UPTIME, 
                uptime(await this.uptime)
            );
            log.prompt(MESSAGES.CLI.GUILDS,
                this.guilds?.cache?.size
            );
            log.prompt(MESSAGES.CLI.USERS,
                this.guilds?.cache?.reduce(
                (a, g) => a + g.memberCount,
                0) || 0
            );
            log.load(MESSAGES.STATUS.SUCCESS);
            await this.emit('status');
            return true;
        } catch (e) {
            log.error(MESSAGES.STATUS.FAIL);
            handler.error(e);
            this.emit('status');
            return false;
        }
    }

    async refresh() {
        try {
            this.#printBanner();
            if (!this.isReady()) {
                log.warn(MESSAGES.REFRESH.NOT_RUNNING);
                this.emit('refresh');
                return false;
            }
            this.commands.clear();
            handler.clear();
            await this.loadScripts();
            await this.deployCommands();
            log.load(MESSAGES.REFRESH.SUCCESS);
            await this.emit('refresh');
            return true;
        } catch (e) {
            log.error(MESSAGES.REFRESH.FAIL);
            handler.error(e);
            this.emit('refresh');
            return false;
        }
        
    }
    
    #printBanner(name = this.getName()) {
        if (!name) return;
        log.prompt(`\n${LINE}`);
        log.prompt(`${name}`);
        log.prompt(LINE);
    }

    #errorStart(error, retry) {
        return new Promise((resolve) => {
        log.error(MESSAGES.LOGIN.FAIL);
        handler.error(error);
        const count = Number(this.getCount());
        const delay = Number(this.getDelay());
        if (Number.isNaN(count) || Number.isNaN(delay) ||
            count <= 0 || delay <= 0) {
            resolve();
            return;
        }
        if (retry >= count) {
            log.error(MESSAGES.LOGIN.RETRY_LIMIT);
            resolve();
            return;
        }
        log.warn(log.strtemplate(
            MESSAGES.LOGIN.RETRY_COUNT, {
            n: delay,
            r: retry + 1,
            m: count})
        );
        setTimeout(async () => {
            await this.start(retry + 1);
            resolve();
        }, delay * 1000);
        });
    }

    #undefinedClient() {
        throw new Error(MESSAGES.COMMAND.CLIENT_UNDEFINED);
    }

    #undefinedGuild() {
        throw new Error(MESSAGES.GUILD.UNDEFINED);
    }

    #undefinedToken() {
        throw new Error(MESSAGES.LOGIN.TOKEN_UNDEFINED);
    }
}