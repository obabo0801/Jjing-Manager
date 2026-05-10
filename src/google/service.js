import { google } from 'googleapis';

import { MESSAGES } from '#message';
import { error } from '#handler';

import * as log from '#log';

export class GoogleService {
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
                    client_email: process.env[this.email],
                    private_key: process.env[this.key]
                        ?.replace(/\\n/g, '\n')},
                scopes: [
                    this.scope || process.env.GOOGLE_SCOPE
                ]
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
                error(sheet.error);
            }
        } catch (e) {
            log.error(MESSAGES.AUTH.FAIL);
            error(e);
        }
    }

    async stop(skip = false) {
        try {
            if (skip) {
                this.cache?.clear();
                
                if (this.auth?.close) {
                    await this.auth.close();
                }
                
                return;
            }

            this.#printBanner();

            if (!this.isReady()) {
                return log.warn(MESSAGES.SHEET.STOPPED);
            }

            this.cache?.clear();

            if (this.auth?.close) {
                await this.auth.close();
            }

            log.load(MESSAGES.SHEET.OUT_SUCCESS);

            return true;
        } catch (e) {
            log.load(MESSAGES.SHEET.OUT_FAIL);
            error(e);

            return false;
        }
    }

    async getStatus() {
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
                spreadsheetId: process.env[this.sheetId]
            });

            return { ok: true, error: undefined };
        } catch (e) {
            return { ok: false, error: e };
        }
    }

    async get(range) {
        const { data } = await this.sheets.spreadsheets.values.get({
            spreadsheetId: process.env[this.sheetId],
            range
        });

        return data.values ?? [];
    }

    async set(range, values) {
        await this.sheets.spreadsheets.values.update({
            spreadsheetId: process.env[this.sheetId],
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [values] }
        });
    }

    #printBanner(name = '') {
        if (!name) {
            name = this.name;
        }
    
        if (!name) return;
        log.prompt('')
        log.prompt('─────────────────────────')
        log.prompt(`${name}`);
        log.prompt('─────────────────────────')
    }
}