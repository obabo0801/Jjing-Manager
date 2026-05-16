import { DiscordBot } from '#services/discord/bot';
import * as file from '#utils/file';
import * as config from '#utils/config';

const bots = new Map();

export async function setup() {
    setting('discords');
    const ids = index();
    if (ids.includes(-1)) return;
    if (ids.includes(0)) {
        return startAll();
    }
    for (const id of ids) {
        if (!sheets.get(id)) continue;
        await start(id);
    }
}

export const get = () => bots;

export function setting(name) {
    bots.clear();
    Object.entries(
        config.get()?.[name] ?? {})
        .forEach(([key, value]) => {
        const bot = new DiscordBot();
        bot.config(value);
        bots.set(Number(key), bot);
    });
}

export async function reload() {
    setting('discords');
}

export async function reset(id) {
    const old = bots.get(id);
    if (old.isReady()) return;
    const bot = new DiscordBot();
    bot.config(old.jjing);
    bots.set(id, bot);
}

export async function start(id) {
    const bot = bots.get(id);
    if (!bot) return;

    await wait(async (resolve) => {
        bot.once('start', resolve);
        await bot.start();
    });
}

export async function startAll() {
    for (const [id] of bots) {
        await start(id);
    }
}

export async function restart(id) {
    const bot = bots.get(id);
    if (!bot) return;
    await stop(id);
    await start(id);
}

export async function restartAll() {
    for (const [id] of bots) {
        await restart(id);
    }
}

export async function stop(id) {
    const bot = bots.get(id);
    if (!bot) return;
    await wait(async (resolve) => {
        bot.once('stop', async () => {
            await reset(id);
            resolve();
        });
        await bot.stop();
    });
}

export async function stopAll() {
    for (const [id] of bots) {
        await stop(id);
    }
}

export async function refresh(id) {
    const bot = bots.get(id);
    if (!bot) return;
    await wait(async (resolve) => {
        bot.once('refresh', resolve);
        await bot.refresh();
    });
}

export async function refreshAll() {
    for (const [id] of bots) {
        await refresh(id);
    }
}

export async function exitAll() {
    for (const [id, bot] of bots) {
        await bot.stop(true);
    }
}

export async function status(id) {
    const bot = bots.get(id);
    if (!bot) return;
    await wait(async (resolve) => {
        bot.once('status', resolve);
        await bot.status();
    });
}

export async function statusAll() {
    for (const [id, bot] of bots) {
        await bot.status();
    }
}

export async function info(id, show) {
    const bot = bots.get(id);
    if (!bot) return;
    const i = show ? `${id}.`: '';
    const name = await bot.getName?.();
    const info = await bot.infoStatus?.();
    return(`${i} ${name} ${info}`);
}

export function wait(resolve) {
    return new Promise(resolve);
}

export function index() {
    const value = process.env.DISCORD_START
        ?? config.get()?.['discord-start'];
    if (value === undefined) return [-1];
    if (Array.isArray(value))
        return value.map(Number)
            .filter(n => !Number.isNaN(n));
    const str = String(value).trim();
    if (!str) return [-1];
    if (str.startsWith('[')) {
        try {
            return JSON.parse(str)
                .map(Number).filter(n =>
                !Number.isNaN(n));
        } catch (e) {
            return [-1];
        }
    }
    return str.split(/\s+/)
        .map(Number)
        .filter(n => !Number.isNaN(n));
}