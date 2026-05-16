import readline from 'readline';
import { config } from 'dotenv';
import { parseEnv } from '#env';
import * as log from '#log';
import { locales, MESSAGES } from '#i18n';
import { spawn } from 'child_process';

let services = [];

const LINE = '───────────────────────────────────────';

const TITLE = `
   ▄▄▄    ▄▄▄  ▄▄▄▄▄  ▄▄   ▄   ▄▄▄ 
     █      █    █    █▀▄  █ ▄▀   ▀
     █      █    █    █ █▄ █ █   ▄▄
     █      █    █    █  █ █ █    █
 ▀▄▄▄▀  ▀▄▄▄▀  ▄▄█▄▄  █   ██  ▀▄▄▄▀ 🐕`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''});

export async function start(items) {
    services = items;
    config({ quiet: true });
    showTitle();
    pause();
    await setup(services);
    await initialize(false);
    prompt();
}

export async function reload(items) {
    parseEnv('.env', false);
    for (const [id, item] of items.entries()) {
        if (!item.ref) continue;
        await item.ref.reload();
    }
}

export async function setup(items) {
    parseEnv('.env', false);
    for (const [id, item] of items.entries()) {
        if (!item.ref) continue;
        await item.ref.setup();
    }
}

export async function reboot() {
    const child = spawn(
        'npm start --silent', {
        detached: true,
        stdio: 'inherit',
        shell: true});
    child.unref();
    await shutdown();
}

export async function initialize(title = true) {
    if (title) {
        showTitle();
    }
    await showInfo(services);
    showMenu(services);
    showHelp();
}

function showTitle() {
    log.title(TITLE);
}

async function showInfo(items, zero = false) {
    const selected = items.filter(hasList);
    if (selected.length === 0) return;

    showLine();

    for (const item of selected) {
        log.prompt(name(item));
        showLine();

        if (zero) showZero();

        for (const { key } of indexInfo(item)) {
            log.prompt(await item.ref.info(key, true));
        }

        showLine();
    }
}

function indexInfo(item) {
    return [...item.ref.get().entries()].map(
        ([key, value]) => ({ key, value }));
}

function showMenu(items) {
    const selected = indexMenu(items);
    if (selected.length === 0) return;

    showZero();

    for (let i = 0; i < selected.length; i++) {
        log.prompt(`${i + 1}.`, name(selected[i].value));
    }
}

function indexMenu(items) {
    return items.map(
        (value, key) => ({ key, value }))
        .filter(
        ({ value }) => value.ref && hasList(value));
}

function showHelp() {
    showLine();
    log.prompt(MESSAGES.CLI.COMMAND);
    log.prompt(log.format(MESSAGES.CLI.COMMANDS));
    showLine();
}

function showZero() {
    log.prompt(`0. ${MESSAGES.CLI.ALL}`);
}

function showLine() {
    log.prompt(LINE);
}

function name(item) {
    return MESSAGES.CLI[item.name] ?? item.name;
}

function list(item) {
    return item.ref?.get?.();
}

function hasList(item) {
    return list(item)?.size > 0;
}

function hasService() {
    return services.some(item =>
        item.ref && hasList(item));
}

async function selectMenu(all, single) {
    showLine();
    await showMenu(services);
    showLine();
    const input = await wait(resolve => {
        rl.question('', resolve);
    });
    pause();
    const [i1, ...i2] = input.split(/\s+/);
    const index = Number(i1);
    const args = [...new Set(i2.map(Number))];
    const selected = select(index);
    const target = selected?.value;
    if (Number.isNaN(index)) {
        await invalid();
        return;
    }
    if (index === 0) {
        await service(all, single, 0);
        return;
    }
    if (!target) {
        await cancel();
        return;
    }
    log.cmd(name(target));
    if (args.length > 0) {
        await service(all, single, index, ...args);
        return;
    }
    await selectInfo(all, single, index, target);
}

async function selectInfo(all, single, index, target) {
    showLine();
    await showInfo([target], true);
    const input = await wait(resolve => {
        rl.question('', resolve);
    });
    pause();
    const args = [...new Set(
        input.split(/\s+/).map(Number))];
    if (args.length === 0) {
        await invalid();
        return;
    }
    await service(all, single, index, ...args);
}

async function service(all, single, index, ...args) {
    if (!hasService()) {
        log.warn(MESSAGES.SYSTEM.EMPTY);
        await setup(services);
        if (hasService()) {
            await initialize();
        }
        return;
    }
    if (Number.isNaN(index)) {
        await selectMenu(all, single);
        return;
    }
    pause();
    if (index === 0) {
        for (const service of services) {
            const ref = service.ref;
            if (!ref?.[all]) continue;
            await ref[all]();
        }
        await done();
        return;
    }
    const selected = select(index);
    const target = selected?.value;
    if (!target?.ref) {
        await invalid();
        return;
    }
    if (args.length === 0 || args.includes(0)) {
        await target.ref?.[all]?.();
        await done();
        return;
    }
    const valid = validate(target, args);
    if (valid.length === 0) {
        await cancel();
        return;
    }
    for (const arg of valid) {
        await target.ref?.[single]?.(arg);
    }
    await done();
}

function validate(target, args) {
    const keys = [...target.ref.get().keys()];
    return args
        .filter(arg => !Number.isNaN(arg))
        .filter(arg => keys.includes(arg));
}

async function handler(input) {
    const [cmd, i1, ...i2] = input.split(' ');
    const index = Number(i1);
    const args = [...new Set(i2.map(Number))];

    switch (cmd.toLowerCase()) {

    case locales.en.CLI.COMMANDS.START:
    case locales.ko.CLI.COMMANDS.START: {
        if (hasService()) {
            log.cmd(MESSAGES.LOGIN.ATTEMPT);
        }
        await service('startAll', 'start', index, ...args);
        break;
    }

    case locales.en.CLI.COMMANDS.RESTART:
    case locales.ko.CLI.COMMANDS.RESTART: {
        if (hasService()) {
            log.cmd(MESSAGES.LOGIN.RESTART);
        }
        await service('restartAll', 'restart', index, ...args);
        break;
    }

    case locales.en.CLI.COMMANDS.STOP:
    case locales.ko.CLI.COMMANDS.STOP: {
        if (hasService()) {
            log.cmd(MESSAGES.LOGOUT.ATTEMPT);
        }
        await service('stopAll', 'stop', index, ...args);
        break;
    }

    case locales.en.CLI.COMMANDS.STATUS:
    case locales.ko.CLI.COMMANDS.STATUS: {
        if (hasService()) {
            log.cmd(MESSAGES.STATUS.ATTEMPT);
        }
        await service('statusAll', 'status', index, ...args);
        break;
    }

    case locales.en.CLI.COMMANDS.REFRESH:
    case locales.ko.CLI.COMMANDS.REFRESH: {
        if (hasService()) {
            log.cmd(MESSAGES.REFRESH.ATTEMPT);
        }
        await service('refreshAll', 'refresh', index, ...args);
        break;
    }

    case locales.en.CLI.COMMANDS.CLEAR:
    case locales.ko.CLI.COMMANDS.CLEAR: {
        log.clear();
        pause();
        await initialize();
        prompt();
        break;
    }

    case locales.en.CLI.COMMANDS.EXIT:
    case locales.ko.CLI.COMMANDS.EXIT: {
        await shutdown();
        break;
    }

    case locales.en.CLI.COMMANDS.REBOOT:
    case locales.ko.CLI.COMMANDS.REBOOT: {
        await reboot();
        break;
    }

    default:
        unknown(cmd);
        break;
    }
}

function select(index) {
    return indexMenu(services)[index - 1] ?? null;
}

async function cancel() {
    log.warn(MESSAGES.SYSTEM.CANCEL);
    await initialize();
    prompt();
}

async function invalid() {
    log.warn(MESSAGES.SYSTEM.INVALID);
    await initialize();
    prompt();
}

async function done() {
    showLine();
    log.cmd(MESSAGES.SYSTEM.DONE);
    showLine();
    await initialize();
    prompt();
}

export function unknown(cmd) {
    log.warn(`❓ '${cmd}' `
        + MESSAGES.SYSTEM.UNKNOWN);
}

export function prompt() {
    if (!rl.closed) rl.prompt();
}

export function pause() {
    if (!rl.closed) rl.pause();
}

export function close() {
    if (!rl.closed) rl.close();
}

export function wait(resolve) {
    return new Promise(resolve);
}

export async function shutdown() {
    log.cmd(MESSAGES.SYSTEM.QUIT);
    pause();
    for (const service of services) {
        await service.ref?.exitAll?.();
    }
    close();
    process.exit(0);
}

rl.on('line', async (input) => {
    const cmd = input.trim();
    await handler(cmd);
});

rl.on('SIGINT', shutdown);

process.on('uncaughtException', (err) => {
    log.error(err?.stack || err);
});

process.on('unhandledRejection', (reason) => {
    log.error(reason?.stack || reason);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);