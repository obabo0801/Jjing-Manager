import { DiscordBot } from '#client';
import * as file from '#file';

const bots = new Map();

export async function setup() {
    config('config.json');
    const i = index();
    if (i === 0) return startAll();
    if (!bots.get(i)) return;
    await start(i);
}

export const get = () => bots;

export function config(name) {
    bots.clear();
    const path = file.find(name);
    if (!path) return;
    const config = file.json(path);
    Object.entries(config.discords ?? {})
        .forEach(([key, value]) => {
        const bot = new DiscordBot();
        bot.config(value);
        bots.set(Number(key), bot);
    });
}

export async function reload() {
    config('config.json');
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
    const str = process
        .env.DISCORD_START;
    if (!str) return 0;
    const num = Number(str);
    return isNaN(
        num) ? -1 : num;
}