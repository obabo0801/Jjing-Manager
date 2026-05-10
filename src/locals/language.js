import * as en from './en.js';
import * as ko from './ko.js';

const locales = { en, ko }

export let MESSAGES = en.MESSAGES;

export function setLanguage(lang) {
    MESSAGES = (locales[lang]
        || locales.en).MESSAGES;
}