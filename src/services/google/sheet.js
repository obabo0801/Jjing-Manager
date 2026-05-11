import { google } from 'googleapis';

import { MESSAGES } from '#i18n';
import * as log from '#log';

export class GoogleSheet {
    constructor() {
        this.cache = new Map();
        this.auth = null;
        this.sheets = null;
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

            if (await this.isReady?.().ok) {
                return log.load(MESSAGES.SHEET.RUNNING);
            }

            this.auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: this.getEmail(),
                    private_key: this.#getKey()
                        ?.replace(/\\n/g, '\n')},
                scopes: this.scopes || this.#scopes()
            });

            const client = await this.auth.getClient();

            this.sheets = google.sheets({
                version: 'v4',
                auth: client
            });

            log.load(MESSAGES.AUTH.SUCCESS);

            const sheet = await this.isReady();
            if (sheet.ok) {
                log.load(MESSAGES.SHEET.IN_SUCCESS);
            } else {
                log.error(MESSAGES.SHEET.IN_FAIL);
                this.error(sheet.error);
            }
        } catch (e) {
            log.error(MESSAGES.AUTH.FAIL);
            this.error(e)
        }
    }

    async restart() {
        await this.stop(true);
        await this.start();
    }

    async stop(skip = false) {
        try {
            if (skip) {
                this.cache.clear();
                this.auth = null;
                this.sheets = null;
                return;
            }

            this.#printBanner();

            if (!this.isReady()) {
                return log.warn(MESSAGES.SHEET.STOPPED);
            }

            this.cache.clear();
            this.auth = null;
            this.sheets = null;

            log.load(MESSAGES.SHEET.OUT_SUCCESS);

            return true;
        } catch (e) {
            log.load(MESSAGES.SHEET.OUT_FAIL);
            this.error(e);

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

    normalize(value) {
        return String(value ?? '').trim();
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
            await this.sheets.spreadsheets.get({
                spreadsheetId: this.getSheetId()
            });

            return { ok: true, error: undefined };
        } catch (e) {
            return { ok: false, error: e };
        }
    }

    async get(range, { value = 'FORMATTED_VALUE', cache = true } = {}) {
        const key = `${range}:${value}`;
        const cached = this.cache.get(key);

        if (cache && cached && Date.now() - cached.time < 5000) {
            return cached.data.map(row => [...row]);
        }

        try {
            const { data } = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.getSheetId(),
                range,
                valueRenderOption: value
            });

            const values = data.values;

            if (cache) {
                this.cache.set(key, { time: Date.now(), data: values });
            }
            
            return values;
        } catch (e) {
            return null;
        }
    }

    async set(range, ...values) {
        try {
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.getSheetId(),
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [values] }
            });

            this.clear(range);
        } catch (e) {
            this.error(e);
        }
    }

    async find(range, col, value, options = {}) {
        const rows = await this.get(range, options);
        const target = this.normalize(value);

        return rows.find(row => 
            this.normalize(row[col]) === target
        ) ?? null;
    }

    async find(range, { col = 0, value = '', options = {} } = {}) {
        const rows = await this.get(range, options);
        const target = this.normalize(value);

        return rows.find(row => 
            this.normalize(row[col]) === target
        ) ?? null;
    }

    async index(range, options = {}) {
        const rows = await this.get(range, options);
        const target = this.normalize(options.value);
        
        const index = rows.findIndex(row => 
            this.normalize(row[options.col]) === target
        );

        return index === -1
            ? { result: null, row: null }
            : { result, row: rows[index] };
    }

    async index(range, { col = 0, value = '', options = {} } = {}) {
        const rows = await this.get(range, options);
        const target = this.normalize(value);

        return rows.find(row => 
            this.normalize(row[col]) === target
        ) ?? null;
    }

    async append(range, ...values) {
        try {
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.getSheetId(),
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {values: [values]}
            });
        } catch (e) {
            this.error(e)
        }
    }

    async update(range, row, ...values) {
        try {
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.getSheetId(),
                range: this.buildRange(range, row),
                valueInputOption: 'USER_ENTERED',
                requestBody: {values: [values]}
            });
        } catch (e) {
            this.error(e)
        }
    }

    clear(range = null) {
        if (!range) return this.cache.clear();

        for (const key of this.cache.keys()) {
            if (key.startsWith(range)) {
                this.cache.delete(key);
            }
        }
    }

    #scopes() {
        return 'https://www.googleapis.com/auth/spreadsheets'
    }

    #printBanner(name = '') {
        if (!name) {
            name = this.getName();
        }
    
        if (!name) return;
        log.prompt('')
        log.prompt('─────────────────────────')
        log.prompt(`${name}`);
        log.prompt('─────────────────────────')
    }

    error(error) {
        const errors = [
            [400, MESSAGES.SHEET.ERROR400],
            [401, MESSAGES.SHEET.ERROR401],
            [403, MESSAGES.SHEET.ERROR403],
            [404, MESSAGES.SHEET.ERROR404],
            [500, MESSAGES.SHEET.ERROR500],
        ];
        
        for (const [code, message] of errors) {
            if (error?.code === 500) {
                this.restart();
            }

            if (error?.code === code) {
                return log.error(message);
            }
        }
    }
}