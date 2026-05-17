import { google } from 'googleapis';
import { EventEmitter } from 'events';
import { MESSAGES } from '#i18n';
import * as handler from '#services/handler';
import * as log from '#utils/log';

export class GoogleSheet extends EventEmitter {
    constructor() { super();
        this.cache = new Map();
        this.auth = null;
        this.sheets = null;
        this.names = null;
    }

    config(options = {}) {
        const valid = Object.fromEntries(
            Object.entries(options)
            .filter(([_, v]) => v !== undefined));
        Object.assign(this, valid);
    }

    async start() {
        try {
            this.#printBanner();
            let sheet = await this.isReady();
            if (sheet.ok) {
                log.warn(MESSAGES.SHEET.RUNNING);
                this.emit('start');
                return false;
            }
            this.auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: this.getEmail(),
                    private_key: this.#getKey()
                        ?.replace(/\\n/g, '\n')},
                scopes: this.scopes || this.#scopes()
            });
            this.sheets = google.sheets({
                version: 'v4',
                auth: this.auth
            });
            sheet = await this.isReady();
            if (sheet.ok) {
                this.#setSheet(sheet.result);
                log.load(MESSAGES.SHEET.IN_SUCCESS);
                await this.emit('start');
                return true;
            } else {
                log.error(MESSAGES.SHEET.IN_FAIL);
                await this.#handleError(sheet.error);
                await this.emit('start');
                return false;
            }
        } catch (e) {
            await this.#handleError(e);
            await this.emit('start');
            return false;
        }
    }

    async restart() {
        await this.stop(true);
        await this.start();
    }

    async stop(skip = false) {
        try {
            let sheet = await this.isReady();
            if (skip) {
                if (!sheet.ok) {
                    this.emit('stop');
                    return false;
                }
                this.clear();
                this.emit('stop');
                return true;
            }
            this.#printBanner();
            if (!sheet.ok) {
                log.warn(MESSAGES.SHEET.STOPPED);
                this.emit('stop');
                return false;
            }
            this.clear();
            log.load(MESSAGES.SHEET.OUT_SUCCESS);
            await this.emit('stop');
            return true;
        } catch (e) {
            log.load(MESSAGES.SHEET.OUT_FAIL);
            await this.#handleError(e);
            await this.emit('stop');
            return false;
        }
    }

    async status() {
        try {
            let sheet = await this.isReady();
            this.#printBanner();
            if (!sheet.ok) {
                log.warn(MESSAGES.STATUS.NOT_RUNNING);
                this.emit('status');
                return false;
            }
            log.prompt(MESSAGES.CLI.NAME,
                sheet.result?.data?.properties?.title);
            log.prompt(MESSAGES.CLI.STATUS,
                await this.infoStatus());
            log.prompt(MESSAGES.CLI.SHEETS,
                this.getSheet().length);
            log.prompt(MESSAGES.CLI.CACHE,
                this.cache.size);
            log.load(MESSAGES.STATUS.SUCCESS);
            await this.emit('status');
            return true;
        } catch (e) {
            log.error(MESSAGES.STATUS.FAIL);
            await this.#handleError(e, { show: false });
            await this.emit('status');
            return false;
        }
    }

    async refresh() {
        try {
            let sheet = await this.isReady();
            this.#printBanner();
            if (!sheet.ok) {
                log.warn(MESSAGES.SHEET.NOT_RUNNING);
                this.emit('refresh');
                return false;
            }
            this.cache.clear();
            this.sheets = google.sheets({
                version: 'v4',
                auth: this.auth
            })
            this.#setSheet(sheet.result);
            log.load(MESSAGES.REFRESH.SUCCESS);
            await this.emit('refresh');
            return true;
        } catch (e) {
            log.error(MESSAGES.REFRESH.FAIL);
            await this.#handleError(e, { show: false });
            await this.emit('stop');
            return false;
        }
    }

    async list() {
        try {
            let sheet = await this.isReady();
            this.#printBanner();
            if (!sheet.ok) {
                log.warn(MESSAGES.STATUS.NOT_RUNNING);
                this.emit('list');
                return false;
            }
            log.prompt(log.strformat(this.getSheet(),
                { first: '', last: '', join: ' | ', col: 5 }));
            await this.emit('list');
            return true;
        } catch (e) {
            await this.#handleError(e, { show: false });
            await this.emit('list');
            return false;
        }
    }

    getName() {
        return process.env[this.name] || this.name;
    }

    getEmail() {
        return process.env[this.email] || this.email;
    }

    #getKey() {
        return process.env[this.key] || this.key;
    }

    getSheetId() {
        return process.env[this.sheetId] || this.sheetId;
    }

    getSheet() {
        return [...this.names];
    }

    #setSheet(result) {
        this.names = result?.data?.sheets
            ?.map(sheet => sheet.properties?.title)
            .filter(Boolean) ?? [];
    }

    hasSheet(name) {
        return this.names.includes(name);
    }

    resolveSheet(name) {
        if (!this.names) return name;
        const target = this.normalize(name);
        return this.names.find(sheet =>
            this.normalize(sheet) === target
        ) ?? this.names.find(sheet =>
            this.normalize(sheet).startsWith(target)
        ) ?? this.names.find(sheet =>
             this.normalize(sheet).includes(target)
        ) ?? name;
    }

    resolveRange(range) {
        const text = String(range);
        if (!text.includes('!')) {
            return this.resolveSheet(text);
        }
        const [name, value] = text.split('!');
        const sheet = this.resolveSheet(name);
        return `${sheet}!${value}`;
    }

    normalize(value) {
        return String(value ?? '').trim();

        const name = this.resolveSheetName(name);
        return `${this.escapeSheetName(sheetName)}!${value}`;
    }

    buildRange(range, row) {
        const [sName, cRange] = range.split('!');
        const cStart = cRange.split(':')[0];
        const column = cStart.replace(/[0-9]/g, '');
        return `${sName}!${column}${row + 1}`;
    }

    async infoStatus() {
        const res = await this.isReady();
        if (res?.ok) {
            return MESSAGES.STATUS.CONNECTED;
        } else {
            return MESSAGES.STATUS.DISCONNECTED;
        }
    }

    async isReady() {
        try {
            if (!this.sheets) return { ok: false };
            const r = await this.sheets.spreadsheets.get({
                spreadsheetId: this.getSheetId()
            });
            return { ok: true, result: r };
        } catch (e) {
            return { ok: false, error: e };
        }
    }

    async get(range, { value = 'FORMATTED_VALUE', cache = true } = {}) {
        range = this.resolveRange(range);
        const key = `${range}:${value}`;
        const cached = this.cache.get(key);
        if (cache && cached && Date.now() - cached.time < 50000) {
            return cached.data.map(row => [...row]);
        }
        try {
            const { data } = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.getSheetId(),
                range,
                valueRenderOption: value
            });
            const values = data.values ?? [];
            if (cache) {
                this.cache.set(key, { time: Date.now(), data: values });
            }
            return values.map(row => [...row]);
        } catch (e) {
            await this.#handleError(e, { show: false });
            return [];
        }
    }

    async set(range, ...values) {
        range = this.resolveRange(range);
        try {
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.getSheetId(),
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [values] }
            });
            this.clear(range);
            return true;
        } catch (e) {
            await this.#handleError(e, { show: false });
            return false;
        }
    }

    async find(range, { col = 0, value = '', options = {} } = {}) {
        const rows = await this.get(range, options);
        const target = this.normalize(value);
        return rows.find(row => 
            this.normalize(row[col]) === target
        ) ?? null;
    }

    async index(range, { col = 0, value = '', options = {} } = {}) {
        const rows = await this.get(range, options);
        const target = this.normalize(value);
        const index = rows.findIndex(row =>
            this.normalize(row[col]) === target
        );
        return index === -1
            ? { result: null, row: null }
            : { result, row: rows[index] };
    }

    async append(range, ...values) {
        range = this.resolveRange(range);
        try {
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.getSheetId(),
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {values: [values]}
            });
            return true;
        } catch (e) {
            await this.#handleError(e, { show: false });
            return false;
        }
    }

    async update(range, row, ...values) {
        range = this.resolveRange(range);
        try {
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.getSheetId(),
                range: this.buildRange(range, row),
                valueInputOption: 'USER_ENTERED',
                requestBody: {values: [values]}
            });
            return true;
        } catch (e) {
            await this.#handleError(e, { show: false });
            return false;
        }
    }

    clear(range = null) {
        if (!range) {
            this.cache.clear();
            this.auth = null;
            this.sheets = null;
            this.names = null;
            return;
        }
        for (const key of this.cache.keys()) {
            if (key.startsWith(range)) {
                this.cache.delete(key);
            }
        }
    }

    #scopes() {
        return 'https://www.googleapis.com/auth/spreadsheets'
    }

    #printBanner(name = this.getName()) {
        if (!name) return;
        log.prompt('\n───────────────────────────────────────')
        log.prompt(`${name}`);
        log.prompt('───────────────────────────────────────')
    }

    async #handleError(e, { restart = true, show = true } = {}) {
        if (show) handler.error(e);
        if (restart && (e?.code === 423 || e?.code === 500)) {
            await this.restart();
        }
    }

    #undefinedSheet() {
        throw new Error(MESSAGES.SHEET.IN_FAIL);
    }
}