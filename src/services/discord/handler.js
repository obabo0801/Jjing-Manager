import { MESSAGES } from '#i18n'
import * as log from '#log';

const handlers = [];

const interactions = [
    ['chatInputCommand', i => i.isChatInputCommand()],
    ['autocomplete', i => i.isAutocomplete()],
    ['button', i => i.isButton()],
    ['stringSelectMenu', i => i.isStringSelectMenu()],
    ['modalSubmit', i => i.isModalSubmit()],
];

const errors = [
    ['ENOTFOUND', MESSAGES.LOGIN.ENOTFOUND],
    ['TokenInvalid', MESSAGES.LOGIN.TOKEN_INVALID],
    [50001, MESSAGES.COMMAND.MISSING_ACCESS],
    [50035, MESSAGES.ERROR.BODY_INVALID],
    [10002, MESSAGES.COMMAND.CLIENT_INVALID],
    [10004, MESSAGES.GUILD.INVALID],
    [400, MESSAGES.SHEET.ERROR400],
    [401, MESSAGES.SHEET.ERROR401],
    [403, MESSAGES.SHEET.ERROR403],
    [404, MESSAGES.SHEET.ERROR404],
];

export function interaction(client, i) {
    try {
        for (const [event, check] of interactions) {
            if (check(i)) return emit(event, i);
        }
    } catch (e) {
        error(e);
    }
}

export function message(client, m) {
    try {
        if (!m.content.startsWith('!')) {
            return;
        }

        const name = m.content
            .slice(1)
            .trim()
            .split(/\s+/)
            .shift()
            ?.toLowerCase();

        emit('message', name, m.content);
    } catch (e) {
        error(e);
    }
}

export function on(name, callback) {
    handlers.push([name, callback]);
}

export function emit(name, ...args) {
    for (const [e, c] of handlers) {
        if (e === name) c(...args);
    }
}

export function clear() {
    handlers.length = 0;
}

export function error(error) {
    for (const [code, message] of errors) {
        if (error?.code === code) {
            return log.error(message);
        }
    }
    

    if (error?.message === 'Used disallowed intents') {
        return log.error(
            MESSAGES.LOGIN.DISALLOWED_INTENTS);
    }

    if (error instanceof Error) {
        return log.error(error.message);
    }

    if (error) {
        return log.error(error)
    }
}