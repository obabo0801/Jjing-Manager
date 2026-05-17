import { spawn } from 'child_process';
import readline from 'readline';
import { locales, MESSAGES } from '#i18n';
import { parseEnv } from '#core/env';
import * as config from '#utils/config';
import * as log from '#utils/log';

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
    loadConfig();
    showTitle();
    pause();
    await callItems(services, 'setup');
    await initialize(false);
    prompt();
}

export async function reload(items = service) {
    services = items;
    loadConfig();
    await callItems(service, 'reload');
}

export async function setup(items = service) {
    services = items;
    loadConfig();
    await callItems(service, 'setup');
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
    if (title) showTitle();
    await showInfo(services);
    showMenu(indexMenu(services), null, true);
    showHelp();
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

function loadConfig() {
    config.load('./config.json');
    parseEnv('.env', false);
}

async function callItems(items, method) {
    for (const item of items) {
        if (!item.ref?.[method]) continue;
        await item.ref[method]();
    }
}

function showTitle() {
    log.title(TITLE);
}

async function showInfo(items, all = null, zero = false) {
    const selected = items.filter(hasList);
    if (selected.length === 0) return;
    showLine();
    for (const item of selected) {
        log.prompt(name(item));
        showLine();
        if (zero || (all && hasMethod(item, all))) {
            showZero();
        }
        for (const key of indexInfo(item)) {
            log.prompt(await item.ref.info(key, true));
        }
        showLine();
    }
}

function showMenu(selected, all = null, zero = false) {
    if (selected.length === 0) return;
    if (zero || hasAll(selected, all)) {
        showZero();
    }
    for (let i = 0; i < selected.length; i++) {
        log.prompt(`${i + 1}.`, name(selected[i].value));
    }
}

function showHelp() {
    showLine();
    log.prompt(MESSAGES.CLI.COMMAND);
    log.prompt(log.strformat(MESSAGES.CLI.COMMANDS,
        { first: '', last: '', join: ' | ', col: 5 }));
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

function hasAll(selected, all) {
    return !!all && selected.some(({ value }) =>
        hasMethod(value, all));
}

function hasMethod(item, method) {
    return !!item && typeof item
        .ref?.[method] === 'function';
}

function hasList(item) {
    return list(item)?.size > 0;
}

function hasService() {
    return services.some(item =>
        item.ref && hasList(item));
}

function indexInfo(item) {
    return [...item.ref.get().keys()];
}

function indexMenu(items, single = null) {
    return items.map((value, key) =>
        ({ key, value })).filter(({ value }) =>
        value.ref && hasList(value)
        && (!single || hasMethod(value, single)));
}

function validate(target, args) {
    const keys = [...target.ref.get().keys()];
    return [...new Set(args)]
        .filter(arg => !Number.isNaN(arg))
        .filter(arg => keys.includes(arg));
}

async function question() {
    const input = await wait(resolve => {
        rl.question('', resolve);
    });
    pause();
    return input.trim();
}

async function askText(message = '') {
    showLine();
    log.prompt(message);
    showLine();
    const text = await question();
    if (!text) {
        await invalid();
        return null;
    }
    return text;
}

function parse(input) {
    if (!input.trim()) {
        return [];
    }
    return input.trim()
        .split(/\s+/)
        .map(number);
}

function number(value) {
    if (value === undefined) {
        return undefined;
    }
    if (!/^\d+$/.test(value)) {
        return NaN;
    }
    return Number(value);
}async function numberCommand(all, single, rest,
    {attempt = single} = {}) {
    const [index, ...args] = parse(rest.join(' '));
    if (hasService() && attempt) {
        log.cmd(attempt);
    }
    await service(all, single, index, ...args);
}

async function textCommand(all, single, rest,
    { attempt = single, input = ''} = {}) {
    if (hasService()) {
        log.cmd(attempt);
    }
    let [i1, i2, ...i3] = rest;
    let index = number(i1);
    let id = number(i2);
    let text = i3.join(' ');
    if (i1 === undefined) {
        const selected = indexMenu(services, single);
        if (selected.length === 0) {
            await invalid();
            return;
        }
        showLine();
        showMenu(selected, null);
        showLine();
        const menuInput = await question();
        const [m1, m2, ...m3] = menuInput.split(/\s+/);
        index = number(m1);
        id = number(m2);
        text = m3.join(' ');
    }
    if (index === undefined || Number.isNaN(index) || index === 0) {
        await invalid();
        return;
    }
    const selected = indexMenu(services, single);
    const target = selected[index - 1]?.value;
    if (!target?.ref || !hasMethod(target, single)) {
        await invalid();
        return;
    }
    if (id === undefined) {
        showLine();
        await showInfo([target], null);
        const infoInput = await question();
        const [x1, ...x2] = infoInput.split(/\s+/);
        id = number(x1);
        text = x2.join(' ');
    }
    if (id === undefined || Number.isNaN(id) || id === 0) {
        await invalid();
        return;
    }
    if (!text) {
        await target.ref?.[all]?.(id);
        text = await askText(input);
        if (!text) return;
    }
    const values = await target.ref[single](id, text);
    if (!printRows(values)) {
        log.warn(MESSAGES.SHEET.ERROR404);
        await initialize();
        prompt();
        return;
    }
    await done();
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
    if (index === undefined || Number.isNaN(index)) {
        await selectMenu(all, single);
        return;
    }
    pause();
    const selected = indexMenu(services, single);
    if (index === 0) {
        if (!hasAll(selected, all)) {
            await invalid();
            return;
        }
        for (const { value } of selected) {
            const ref = value.ref;
            if (!ref?.[all]) continue;
            await ref[all]();
        }
        await done();
        return;
    }
    const target = selected[index - 1]?.value;
    if (!target?.ref) {
        await invalid();
        return;
    }
    if (all && (args.length === 0 || args.includes(0))) {
        if (!hasMethod(target, all)) {
            await invalid();
            return;
        }
        await target.ref?.[all]?.();
        await done();
        return;
    }
    if (!all && args.includes(0)) {
        await invalid();
        return;
    }
    if (!all && args.length === 0) {
        await selectInfo(all, single, index, target);
        return;
    }
    if (!hasMethod(target, single)) {
        await invalid();
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

async function selectMenu(all, single) {
    const selected = indexMenu(services, single);
    if (selected.length === 0) {
        await invalid();
        return;
    }
    showLine();
    showMenu(selected, all);
    showLine();
    const input = await question();
    const values = parse(input);
    const [index, ...args] = values;
    if (index === undefined || Number.isNaN(index)) {
        await invalid();
        return;
    }
    if (index === 0) {
        if (!hasAll(selected, all)) {
            await invalid();
            return;
        }
        await service(all, single, 0);
        return;
    }
    const target = selected[index - 1]?.value;
    if (!target) {
        await invalid();
        return;
    }
    log.cmd(name(target));
    if (args.length > 0) {
        await service(all, single, index, ...args);
        return;
    }
    if (!hasMethod(target, single)) {
        await service(all, single, index);
        return;
    }
    await selectInfo(all, single, index, target);
}

async function selectInfo(all, single, index, target) {
    showLine();
    await showInfo([target], all);
    const input = await question();
    const args = parse(input);
    if (args.length === 0) {
        await invalid();
        return;
    }
    await service(all, single, index, ...args);
}

async function handler(input) {
    const [cmd, ...rest] = input.trim().split(/\s+/);
    switch (cmd.toLowerCase()) {

    case locales.en.CLI.COMMANDS.READ:
    case locales.ko.CLI.COMMANDS.READ: {
        await textCommand('list', 'read', rest, {
            attempt: MESSAGES.READ.ATTEMPT,
            input: MESSAGES.READ.INPUT});
        break;
    }

    case locales.en.CLI.COMMANDS.START:
    case locales.ko.CLI.COMMANDS.START: {
        await numberCommand('startAll', 'start', rest, {
            attempt: MESSAGES.LOGIN.ATTEMPT});
        break;
    }

    case locales.en.CLI.COMMANDS.RESTART:
    case locales.ko.CLI.COMMANDS.RESTART: {
        await numberCommand('restartAll', 'restart', rest, {
            attempt: MESSAGES.LOGIN.RESTART});
        break;
    }

    case locales.en.CLI.COMMANDS.STOP:
    case locales.ko.CLI.COMMANDS.STOP: {
        await numberCommand('stopAll', 'stop', rest, {
            attempt: MESSAGES.LOGOUT.ATTEMPT});
        break;
    }

    case locales.en.CLI.COMMANDS.STATUS:
    case locales.ko.CLI.COMMANDS.STATUS: {
        await numberCommand('statusAll', 'status', rest, {
            attempt: MESSAGES.STATUS.ATTEMPT});
        break;
    }

    case locales.en.CLI.COMMANDS.REFRESH:
    case locales.ko.CLI.COMMANDS.REFRESH: {
        await numberCommand('refreshAll', 'refresh', rest, {
            attempt: MESSAGES.REFRESH.ATTEMPT});
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

function printRows(values) {
    if (!values || values.length === 0) {
        return false;
    }
    const rows = Array.isArray(values)
        ? values
        : [values];
    if (rows.length === 0) {
        return false;
    }
    for (const row of rows) {
        log.prompt(Array.isArray(row)
            ? row.join(' ')
            : String(row));
    }
    return true;
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

export function wait(executor) {
    return new Promise(executor);
}

rl.on('line', async (input) => {
    const cmd = input.trim();
    if (!cmd) {
        prompt();
        return;
    }
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