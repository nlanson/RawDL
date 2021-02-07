const { rawdl } = require('rawdl');
const fs = require('fs');

async function main() {
    const api_keys = {
        username: 'debug api key',
        password: 'debug api pass',
        folder: 'debug api folder'
    };

    let time = new Date();
    console.log(`Starting Rawdl in Debug Mode [${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${time.getMonth()}]`);
    let ap = new rawdl.AutoPilot('/data/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys,'/data/downloads');
    await ap.debug();
}

main();