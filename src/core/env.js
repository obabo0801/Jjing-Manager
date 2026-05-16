import { parse } from 'dotenv';
import { setLanguage, MESSAGES } from '#i18n';
import * as handler from '#services/handler';
import { decode } from '#utils/base64';
import * as file from '#utils/file';
import * as log from '#utils/log';
import * as config from '#utils/config';

export function parseEnv(name, show = true) {
    try {
        const path = file.find(name);

        if (!path) {
            setLanguage(process.env.LANGUAGE ??
                config.get()?.['language']);
            return;
        }

        const env = file.read(path);
        const parsed = parse(decode(env));

        process.env = {
            ...process.env,
            ...parsed
        }

        for (const k in parsed) {
            if (process.env[k]) {
                process.env[k] = 
                decode(process.env[k]);
            }
        }

        setLanguage(process.env.LANGUAGE ??
            config.get()?.['language']);

        if (show) {
            log.load(MESSAGES.ENV.SUCCESS);
        }
    } catch (e) {
        if (show) {
            log.error(MESSAGES.ENV.FAIL);
            handler.error(e);
        }
    }
}