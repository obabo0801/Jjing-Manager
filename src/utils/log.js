import * as file from '#file';
import * as time from '#time';

const LEVELS = Object.freeze({
    TITLE: 'TITLE',
    CMD: 'CMD',
    INPUT: 'INPUT',
    LOAD: 'LOAD',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
});

const CONSOLE = Object.freeze({
    [LEVELS.TITLE]: console.info,
    [LEVELS.CMD]: console.info,
    [LEVELS.INPUT]: console.info,
    [LEVELS.LOAD]: console.info,
    [LEVELS.DEBUG]: console.debug,
    [LEVELS.INFO]: console.info,
    [LEVELS.WARN]: console.warn,
    [LEVELS.ERROR]: console.error
});

const COLORS = Object.freeze({
    TITLE: '\x1b[0m',
    CMD: '\x1b[0m',
    INPUT: '\x1b[0m',
    LOAD: '\x1b[32m',
    DEBUG: '\x1b[36m',
    INFO: '\x1b[0m',
    WARN: '\x1b[33m',
    ERROR: '\x1b[31m',
    RESET: '\x1b[0m'
});

export function append(level, ...args) {
    const type = String(level).toUpperCase();
    const arg = args
        .map(a => typeof a === 'object' 
        ? stringify(a) : String(a))
        .join(' ');

    const data = 
        `[${time.getTime()}] [${type}] ${arg}`;

    return file.append(
        `logs/${time.getDate()}.log`, data);
}

export function send(level, ...args) {
    const type = String(level).toUpperCase();
    const arg = args
        .map(a => typeof a === 'object' 
        ? stringify(a) : String(a))
        .join(' ');

    const data = 
        `[${time.getTime()}] [${type}] ${arg}`;

    const l = CONSOLE[type] ?? console.log;
    const c = COLORS[type] ?? COLORS.RESET;
    l(`${c}${data}${COLORS.RESET}`);

    return file.append(
        `logs/${time.getDate()}.log`, data);
}

export function print(level, ...args) {
    const type = String(level).toUpperCase();
    const arg = args
        .map(a => typeof a === 'object' 
        ? stringify(a) : String(a))
        .join(' ');

    const l = CONSOLE[type] ?? console.log;
    const c = COLORS[type] ?? COLORS.RESET;
    l(`${c}${arg}${COLORS.RESET}`);

    return file.append(
        `logs/${time.getDate()}.log`, arg);
}

function stringify(data) {
    return JSON.stringify(data, (_, v) =>
        typeof v === 'bigint'
         ? v.toString() : v);
}

export function clear() { console.clear() }

export function title(...args) {
    return print(LEVELS.TITLE, ...args);
}

export function silent(...args) {
    return append(LEVELS.INFO, ...args);
}

export function prompt(...args) {
    return print(LEVELS.INFO, ...args);
}

export function cmd(...args) {
    return send(LEVELS.CMD, ...args);
}

export function input(...args) {
    return append(LEVELS.INPUT, ...args);
}

export function load(...args) {
    return send(LEVELS.LOAD, ...args);
}

export function debug(...args) {
    return send(LEVELS.DEBUG, ...args);
}

export function info(...args) {
    return send(LEVELS.INFO, ...args);
}

export function warn(...args) {
    return send(LEVELS.WARN, ...args);
}

export function error(...args) {
    return send(LEVELS.ERROR, ...args);
}