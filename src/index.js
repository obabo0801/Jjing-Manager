import {
    SoopChatEvent, SoopClient
} from 'soop-extension'

import { config, parse } from 'dotenv';
import readline from 'readline';
import { setLanguage } from '#i18n';

import { MESSAGES } from '#i18n';
import { DiscordBot } from '#discord';
import { GoogleSheet } from '#google';
import { error } from '#handler';

import * as file from '#file';
import * as log from '#log';
import { decode } from '#base64';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
});

let googles = new Map();
let bots = new Map();

(async () => {
    try {
        config({ quiet: true });
        parseEnv('.env', false);
        await setupGoogles();
        await setupBots();
        await setupSoop();
    } catch (e) {
        error(e);
        initialize();
    }
})();

function parseEnv(name, show = true) {
    try {
        const env = file.read(name);
        if (!env) return;

        const parsed = parse(decode(env));

        process.env = {
            ...process.env,
            ...parsed
        }

        for (const k in parsed) {
            if (process.env[k]) {
                process.env[k] = 
                decode(process.env[k]);
            }
        }

        setLanguage(process.env.LANGUAGE);

        if (show) {
            log.load(MESSAGES.ENV.SUCCESS);
        }
    } catch (e) {
        if (show) {
            log.error(MESSAGES.ENV.FAIL);
            error(e);
        }
    }
}

// ───────────────────────── SOOP SETUP

function formatTime(time) {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(new Date(time))
        .replace(',', '');
}

async function setupSoop() {
}

// ───────────────────────── GOOGLE SETUP

async function setupGoogles() {
    configGoogles('config.json');
    await startGoogles();
}

function configGoogles(name) {
    googles.clear();

    const config = file.json(name);
    if (!config) return;

    Object.entries(config.googles)
        .forEach(([key, value]) => {
        const id = Number(key);

        googles.set(id, new GoogleSheet());
        googles.get(id).config(value);
    });
}

async function startGoogles() {
    for (const [id, google] of googles) {
        await google.start();
    }
}

async function stopGoogles() {
    for (const [id, google] of googles) {
        await google.stop();
    }
}

async function exitGoogles() {
    for (const [id, google] of googles) {
        await google.stop(true);
    }
}

async function renderGoogles(show = false) {
    log.prompt('─────────────────────────\n')

    for (const [k, v] of googles) {
        const i = show ? `[${k}] ` : '';
        const status = await v.infoStatus?.();

        log.prompt(`${i}${v.getName?.()} ${status}`);
    }

    log.prompt('\n─────────────────────────')
}

// ───────────────────────── BOT SETUP

async function setupBots() {
    configBots('config.json');

    const s = process.env.START;

    if (s === '0') {
        await startBots();
        return;
    }

    const id = Number(s);
    const bot = bots.get(id);

    if (!isNaN(id) && bot) {
        await startBot(bot);
        ready(bot); return;
    }

    initialize();
}

function configBots(name) {
    bots.clear();

    const config = file.json(name);
    if (!config) return;

    Object.entries(config.bots)
        .forEach(([key, value]) => {
        const id = Number(key);

        bots.set(id, new DiscordBot());
        bots.get(id).config(value);
    });
}

async function initBots(id) {
    const old = bots.get(id);
    if (old.isReady()) return;

    const bot = new DiscordBot();
    bot.deploy = true;
    bot.config(old.jjing);

    bots.set(id, bot);
}

async function startBot(bot) {
    pause();
    await bot.start();
    await delay(bot);
}

async function stopBot(bot) {
    pause();
    await bot.stop();
}

async function refreshBot(bot) {
    pause();
    await bot.reloadScripts();
}

async function startBots() {
    for (const [id, bot] of bots) {
        await startBot(bot);
    }

    const bot = [...bots.values()].at(-1);
    
    if (bot) { ready(bot);
    } else { initialize(); }
}

async function stopBots() {
    for (const [id, bot] of bots) {
        await stopBot(bot);
        initBots(id); 
    }
    
    const bot = [...bots.values()].at(-1);
    
    if (bot) { ready(bot);
    } else { initialize(); }
}

async function exitBots() {
    for (const [id, bot] of bots) {
        await bot.stop(true);
    }
}

async function renderBots(show = false) {
    log.prompt('─────────────────────────\n')

    if (show && bots.length) {
        log.prompt(MESSAGES.CLI.BOTS);
    }

    for (const [k, v] of bots) {
        const i = show ? `[${k}] ` : '';
        const status = v.infoStatus?.();

        log.prompt(`${i}${v.getName?.()} ${status}`);
    }

    log.prompt('\n─────────────────────────')
}

async function showBot(bot) {
    log.prompt('─────────────────────────\n')

    const status = bot.infoStatus?.();
    const name = bot.user?.tag || 'UNKNOWN';

    const total = Math.floor(bot.uptime / 1000);
    const hour = Math.floor(total / 3600);
    const min = Math.floor((total % 3600) / 60);
    const sec = total % 60;

    const global = await bot.getGlobal?.();
    const guild = await bot.getGuild?.();

    const ping = `${bot.ws.ping}ms`;
    const uptime = `${hour}h ${min}m ${sec}s`;

    log.prompt(`${bot.getName?.()} ${status}`);
    log.prompt('\n─────────────────────────')
    log.prompt(`${MESSAGES.CLI.NAME} ${name}`);
    log.prompt(`${MESSAGES.CLI.GLOBAL} ${global}`);
    log.prompt(`${MESSAGES.CLI.GUILD} ${guild}`);
    log.prompt(`${MESSAGES.CLI.PING} ${ping}`);
    log.prompt(`${MESSAGES.CLI.UPTIME} ${uptime}`);
    log.prompt('─────────────────────────')
}

function statusBot(bot) {
    if (!bot) {
        initialize(); return;
    }

    return new Promise(async (resolve) => {

    await showBot(bot);

    rl.question('', (i) => {
        resolve();
    });

    });
}

async function statusBots() {
    if (bots.size === 0) {
        return initialize();
    }

    for (const [id, bot] of bots) {
        await showBot(bot);
    }
    
    return new Promise(async (resolve) => {

    rl.question('', (i) => {
        const bot = [...bots.values()].at(-1);
        
        if (bot) { ready(bot);
        } else { initialize(); }

        resolve();
    });

    });
}

async function refreshBots() {
    for (const [id, bot] of bots) {
        await refreshBot(bot);
    }
    
    const bot = [...bots.values()].at(-1);
    
    if (bot) { ready(bot);
    } else { initialize(); }
}

function check(num) {
    const i = parseInt(num);

    if (isNaN(i) || (i !== 0 && !bots.get(i))) {
        return null;
    }

    return i;
}

// ───────────────────────── CLI

rl.on('line', async (input) => {
    const cmd = input.trim();
    log.input(cmd);
    pause();

    await handler(cmd);
});

async function initialize(hide = false) {
    if (hide) log.clear();

    log.prompt('─────────────────────────')
    log.prompt(MESSAGES.CLI.GOOGLE);
    await renderGoogles(true);

    log.prompt(MESSAGES.CLI.DISCORD);
    await renderBots(true);

    log.prompt(MESSAGES.CLI.COMMAND);
    log.prompt(format(MESSAGES.CLI.COMMANDS));
    log.prompt('─────────────────────────')

    prompt();
}

function format(commands) {
    const values = Object.values(commands);

    const column = 3;
    const rows = [];

    for (let i = 0; i < values.length; i += column) {
        rows.push(values.slice(i, i + column).join('   '));
    }

    return rows.join('\n');
}

// ───────────────────────── COMMAND

async function handler(input) {
    const [cmd, arg] = input.split(' ');

    switch (cmd) {

    case MESSAGES.CLI.COMMANDS.START: {
        log.cmd(MESSAGES.LOGIN.ATTEMPT);
        const i = arg ? check(arg) : await select();
        if (i === null) return initialize();

        try {
            if (i === 0) await startBots();
            else {
                await startBot(bots.get(i));
                ready(bots.get(i));
            }
        } catch (e) {
            error(e);
            prompt();
        }
        break;
    }

    case MESSAGES.CLI.COMMANDS.RESTART: {
        log.cmd(MESSAGES.LOGIN.RESTART);
        try {
            parseEnv('.env', false);
            await stopBots();
            await setupBots();
        } catch (e) {
            error(e);
            prompt();
        }
        break;
    }

    case MESSAGES.CLI.COMMANDS.STOP: {
        log.cmd(MESSAGES.LOGOUT.ATTEMPT);
        const i = arg ? check(arg) : await select();
        if (i === null) return initialize();
        try {
            if (i === 0) await stopBots();
            else {
                await stopBot(bots.get(i));
                ready(bots.get(i));
                initBots(i); 
            }
        } catch (e) {
            error(e);
            prompt();
        }
        break;
    }

    case MESSAGES.CLI.COMMANDS.STATUS: {
        log.cmd(MESSAGES.STATUS.ATTEMPT);
        const i = arg ? check(arg) : await select();
        if (i === null) return initialize();
        try {
            if (i === 0) await statusBots();
            else {
                await statusBot(bots.get(i))
                ready(bots.get(i));
            }
        } catch (e) {
            error(e);
            prompt();
        }
        break;
    }

    case MESSAGES.CLI.COMMANDS.REFRESH: {
        log.cmd(MESSAGES.REFRESH.ATTEMPT);
        const i = arg ? check(arg) : await select();
        if (i === null) return initialize();

        try {
            parseEnv('.env', false);
            if (i === 0) {
                await refreshBots();
            } else {
                await refreshBot(bots.get(i));
                ready(bots.get(i));
            }
        } catch (e) {
            error(e);
            prompt();
        }
        break;
    }

    case MESSAGES.CLI.COMMANDS.CLEAR: {
        return initialize(true);
    }

    case MESSAGES.CLI.COMMANDS.EXIT: {
        return shutdown();
    }

    default:
        log.warn(`❓ '${cmd}' ` + MESSAGES.SYSTEM.UNKNOWN);
        prompt();
    }
}

function select() {
    return new Promise((resolve) => {
    
    renderBots(true);

    rl.question('', (i) => {
        const num = parseInt(i);
        log.input(i);

        if (isNaN(num) || (num !== 0 && !bots.get(num))) {
            initialize();
            prompt();
            return resolve(null);
        }
            
        resolve(num);
    });

    });
}

async function ready(bot) {
    if (await delay(bot)) {
        initialize();
    }
}

async function delay(bot) {
    return new Promise((resolve) => {
    
    const check = () => {
        if (bot?.isDeploy()) {
            resolve(true);
            return;
        }

        setTimeout(check, 1000);
    }

    setTimeout(check, 1000);

    });
}

function prompt() {
    if (!rl.closed) rl.prompt();
}

function pause() {
    if (!rl.closed) rl.pause();
}

function close() {
    if (!rl.closed) rl.close();
}

async function shutdown() {
    close();

    log.cmd(MESSAGES.SYSTEM.QUIT);
    
    await exitGoogles();
    await exitBots();

    process.exit(0);
}

process.on('uncaughtException', (err) => {
    prompt();
    log.error(err?.stack || err);
});

process.on('unhandledRejection', (reason) => {
    prompt();
    log.error(reason?.stack || reason);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);