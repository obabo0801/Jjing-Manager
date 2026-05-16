import { GoogleSheet } from '#services/google/sheet';
import * as file from '#utils/file';
import * as config from '#utils/config';

const sheets = new Map();

export async function setup() {
    setting('googles');
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

export const get = () => sheets;

export function setting(name) {
    sheets.clear();
    Object.entries(
            config.get()?.[name] ?? {})
        .forEach(([key, value]) => {
        const sheet = new GoogleSheet();
        sheet.config(value);
        sheets.set(Number(key), sheet);
    });
}

export async function reload() {
    setting('googles');
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
    const value = process.env.GOOGLE_START
        ?? config.get()?.['google-start'];
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