import { GoogleSheet } from '#sheet';
import * as file from '#file';

const sheets = new Map();

export async function setup() {
    config('config.json');
    const i = index();
    if (i === 0) return startAll();
    if (!sheets.get(i)) return;
    await start(i);
}

export const get = () => sheets;

export function config(name) {
    sheets.clear();
    const path = file.find(name);
    if (!path) return;
    const config = file.json(path);
    Object.entries(config.googles ?? {})
        .forEach(([key, value]) => {
        const sheet = new GoogleSheet();
        sheet.config(value);
        sheets.set(Number(key), sheet);
    });
}

export async function reload() {
    config('config.json');
}

export async function reset(id) {
    const old = sheets.get(id);
    if (old.isReady()) return;
    const sheet = new GoogleSheet();
    sheet.config(old.jjing);
    sheets.set(id, sheet);
}

export async function start(id) {
    const sheet = sheets.get(id);
    if (!sheet) return;
    await wait(async (resolve) => {
        sheet.once('start', resolve);
        await sheet.start();
    });
}

export async function startAll() {
    for (const [id] of sheets) {
        await start(id);
    }
}

export async function restart(id) {
    const sheet = sheets.get(id);
    if (!sheet) return;
    await stop(id);
    await start(id);
}

export async function restartAll() {
    for (const [id] of sheets) {
        await restart(id);
    }
}

export async function stop(id) {
    const sheet = sheets.get(id);
    if (!sheet) return;
    await wait(async (resolve) => {
        sheet.once('stop', resolve);
        await sheet.stop();
    });
}

export async function stopAll() {
    for (const [id] of sheets) {
        await stop(id);
    }
}

export async function refresh(id) {
    const sheet = sheets.get(id);
    if (!sheet) return;
    await wait(async (resolve) => {
        sheet.once('refresh', resolve);
        await sheet.refresh();
    });
}

export async function refreshAll() {
    for (const [id] of sheets) {
        await refresh(id);
    }
}

export async function exitAll() {
    for (const [id, sheet] of sheets) {
        await sheet.stop(true);
    }
}

export async function status(id) {
    const sheet = sheets.get(id);
    if (!sheet) return;
    await wait(async (resolve) => {
        sheet.once('status', resolve);
        await sheet.status();
    });
}

export async function statusAll() {
    for (const [id, sheet] of sheets) {
        await sheet.status();
    }
}

export async function info(id, show) {
    const sheet = sheets.get(id);
    if (!sheet) return;
    const i = show ? `${id}.`: '';
    const name = await sheet.getName?.();
    const info = await sheet.infoStatus?.();
    return(`${i} ${name} ${info}`);
}

export function wait(resolve) {
    return new Promise(resolve);
}

export function index() {
    const str = process
        .env.GOOGLE_START;
    if (!str) return 0;
    const num = Number(str);
    return isNaN(
        num) ? -1 : num;
}