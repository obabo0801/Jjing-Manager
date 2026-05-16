import {
    SlashCommandBuilder
} from 'discord.js';
import { on } from '#services/handler';
import * as log from '#utils/log';

export default {
    name: 'example',

    commands: [
        new SlashCommandBuilder()
            .setName('example')
            .setDescription('example description')
    ],

    customIds: [
        'example_btn'
    ],

    events() {
        on('chatInputCommand', (i) => {
            console.log(i);
        });
    },
}