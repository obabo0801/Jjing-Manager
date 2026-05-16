import * as cli from '#cli';
import * as discord from '#discord';
import * as google from '#google';

(async () => {
    await cli.start([
        { name: 'DISCORD', ref: discord },
        { name: 'GOOGLE', ref: google }]);
})();