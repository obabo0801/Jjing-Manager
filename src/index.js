import { config, parse } from 'dotenv';
import readline from 'readline';

import { MESSAGES } from '#message';
import { JjingBot } from '#client';

import * as file from '#file';
import * as log from '#log';
import { decode } from '#base64';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
});

let clients = new Map();

(async () => {
    config({ quiet: true });
    try {
        await setupClients();
    } catch (e) {
        log.error(e.message);
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

        if (show) {
            log.load(
                MESSAGES.ENV.SUCCESS);
        }
    } catch (e) {
        if (show) {
            log.error(
                MESSAGES.ENV.FAIL);
        }
    }
}

rl.on('line', async (input) => {
    const cmd = input.trim();
    log.input(cmd); rl.pause();
    await handler(cmd);
});

function initialize() {
    log.clear();
    log.prompt('─────────────────────────')
    log.prompt('　Jjing Bot Manager 🐕')
    render(true);
    log.prompt('[Commands]\n')
    log.prompt(' start   restart  stop ');
    log.prompt(' status  refresh  exit ');
    log.prompt('─────────────────────────')

    rl.prompt();
}

async function setupClients() {
    parseEnv('.env', false);

    configClients('config.json');

    const s = process.env.START;

    if (s === '0') {
        await startAll();
        return;
    }

    const id = Number(s);
    const client = clients.get(id);

    if (!isNaN(id) && client) {
        await start(client);
        ready(client); return;
    }

    initialize();
}

function configClients(name) {
    clients.clear();

    const config = file.json(name);
    
    if (!config) return;

    Object.entries(config)
        .forEach(([key, value]) => {
        const id = Number(key);

        clients.set(id, new JjingBot());
        clients.get(id).config(value);
    });
}

async function initClients(id) {
    const old = clients.get(id);
    if (old.isReady()) return;
    const client = new JjingBot();
    client.deploy = true;
    client.config(old.jjing);
    clients.set(id, client);
}

async function handler(input) {
    const [cmd, arg] = input.split(' ');
    switch (cmd) {
    case 'start': {
        log.cmd(
            MESSAGES.LOGIN.ATTEMPT);
        const i = arg 
            ? check(arg) : await select();
        if (i === null) {
            initialize(); break;
        }
        try {
            if (i === 0) {
                await startAll();
            } else {
                await start(
                    clients.get(i));
                ready(clients.get(i));
            }
        } catch (e) {
            log.error(e.message);
            rl.prompt();
        }
        break;
    }
    case 'restart': {
        log.cmd(
            MESSAGES.LOGIN.RESTART);
        try {
            await stopAll();
            await setupClients();
        } catch (e) {
            log.error(e.message);
            rl.prompt();
        }
        break;
    }
    case 'stop': {
        log.cmd(
            MESSAGES.LOGOUT.ATTEMPT);
        const i = arg 
            ? check(arg) : await select();
        if (i === null) {
            initialize(); break;
        }
        try {
            if (i === 0) {
                await stopAll();
            } else {
                await stop(
                    clients.get(i));
                ready(clients.get(i));
                initClients(i); 
            }
        } catch (e) {
            log.error(e.message);
            rl.prompt();
        }
        break;
    }
    case 'status': {
        log.cmd(
            MESSAGES.STATUS.ATTEMPT);
        const i = arg 
            ? check(arg) : await select();
        if (i === null) {
            initialize(); break;
        }
        try {
            if (i === 0) {
                await statusAll();
            } else {
                await status(
                    clients.get(i))
                ready(clients.get(i));
            }
        } catch (e) {
            log.error(e.message);
            rl.prompt();
        }
        break;
    }
    case 'refresh': {
        log.cmd(
            MESSAGES.REFRESH.ATTEMPT);
        const i = arg 
            ? check(arg) : await select();
        if (i === null) {
            initialize(); break;
        }
        try {
            if (i === 0) {
                await refreshAll();
            } else {
                await refresh(
                    clients.get(i));
                ready(clients.get(i));
            }
        } catch (e) {
            log.error(e.message);
            rl.prompt();
        }
        break;
    }
    case 'exit': {
        await shutdown();
        break;
    }
    default:
        log.warn(`❓ '${cmd}' `
            + MESSAGES.SYSTEM.UNKNOWN);
        rl.prompt();
    }
}

async function render(show = false) {
    log.prompt('─────────────────────────\n')
    if (show) log.prompt('[0] All Bots');

    for (const [k, v] of clients) {
        const i = show ? `[${k}] ` : '';
        const status = v.getStatus?.();
        log.prompt(`${i}` + `${v.jjing?.name} `
            + `${status}`);
    }

    log.prompt('\n─────────────────────────')
}

async function showStatus(client) {
    log.prompt('─────────────────────────\n')

    const status = client.getStatus?.();
    const bot = client.user?.tag || 'UNKNOWN';
    const total = Math.floor(client.uptime / 1000);
    const hour = Math.floor(total / 3600);
    const min = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    const global = await client.isGlobal?.();
    const guild = await client.isGuild?.();
    const ping = `${client.ws.ping}ms`;
    const uptime = `${hour}h ${min}m ${sec}s`;

    log.prompt(`${client.jjing?.name} `
        + `${status}`);
    log.prompt('\n─────────────────────────')
    log.prompt(`BOT        ${bot}`);
    log.prompt(global
        ? `GLOBAL     🟢` : `GLOBAL     🔴`)
    log.prompt(guild
        ? `GUILD      🟢` : `GUILD      🔴`)
    log.prompt(`PING       ${ping}`);
    log.prompt(`UPTIME     ${uptime}`);
    log.prompt('─────────────────────────')
}

function status(client) {
    if (!client) {
        initialize(); return;
    }

    return new Promise(async (resolve) => {

    await showStatus(client);

    rl.question('', (i) => {
        resolve();
    });

    });
}

async function statusAll() {
    if (clients.size === 0) {
        initialize(); return;
    }

    for (const [id, client] of clients) {
        await showStatus(client);
    }
    
    return new Promise(async (resolve) => {

    rl.question('', (i) => {
        const client = [...clients
            .values()].at(-1);
        
        if (client) { ready(client);
        } else { initialize(); }

        resolve();
    });

    });
}

function check(num) {
    const i = parseInt(num);

    if (isNaN(i) || (i !== 0
        && !clients.get(i))) {
        return null;
    }

    return i;
}

function select() {
    return new Promise((resolve) => {
    
    render(true);

    rl.question('', (i) => {
        const num = parseInt(i);
        log.input(i);

        if (isNaN(num) || (num !== 0
        && !clients.get(num))) {
            initialize();
            rl.prompt();
            return resolve(null);
        }
            
        resolve(num);
    });

    });
}

async function ready(client) {
    if (await delay(client)) {
        initialize();
    }
}

async function delay(client) {
    return new Promise((resolve) => {
    
    const check = () => {
        if (client?.isDeploy()) {
            resolve(true);
            return;
        }

        setTimeout(check, 1000);
    }

    setTimeout(check, 1000);

    });
}

async function start(client) {
    rl.pause();
    await client.start();
    await delay(client);
}

async function  stop(client) {
    rl.pause();
    await client.stop();
}

async function  refresh(client) {
    rl.pause();
    await client.reloadScripts();
}

async function startAll() {
    for (const [id, client] of clients) {
        await start(client);
    }

    const client = [...clients
        .values()].at(-1);
    
    if (client) { ready(client);
    } else { initialize(); }
}

async function stopAll() {
    for (const [id, client] of clients) {
        await stop(client);
        initClients(id); 
    }
    
    const client = [...clients
        .values()].at(-1);
    
    if (client) { ready(client);
    } else { initialize(); }
}

async function refreshAll() {
    for (const [id, client] of clients) {
        await refresh(client);
    }
    
    const client = [...clients
        .values()].at(-1);
    
    if (client) { ready(client);
    } else { initialize(); }
}

async function shutdown() {
    log.cmd(
        MESSAGES.SYSTEM.QUIT);

    for (const [id, client] of clients) {
        await client.exit();
    }

    process.exit(0);
}

process.on('uncaughtException',
    log.error
);
process.on('unhandledRejection',
    log.error
);

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);