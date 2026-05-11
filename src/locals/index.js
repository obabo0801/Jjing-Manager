import * as en from './en.js';
import * as ko from './ko.js';

export const locales = {
    en : en.MESSAGES,
    ko : ko.MESSAGES
}

export let MESSAGES = en;

export function getLanguage() {
    return MESSAGES || locales.en;
}

export function setLanguage(lang) {
    const languages = {
        en: locales.en,
        eng: locales.en,
        english: locales.en,

        ko: locales.ko,
        kor: locales.ko,
        korean: locales.ko
    };

    MESSAGES = languages[
        lang.trim().toLowerCase()
    ] ?? locales.en;
}