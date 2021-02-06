const { rawdl } = require('rawdl');

async function main() {
    let time = new Date();
    console.log(`Starting Rawdl in Download Only Mode [${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${time.getMonth()}]`);
    let ap = new rawdl.AutoPilot('/data/shows.json', 'https://subsplease.org/rss/?t&r=1080', undefined, '/data/downloads');
    await ap.downloadOnly();
}

main();