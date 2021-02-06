const { rawdl } = require('rawdl');

async function main() {
    const api_keys = {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD,
        folder: process.env.API_FOLDER
    };
    let time = new Date();
    console.log(`Starting Rawdl in Full Mode [${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${time.getMonth()}]`);
    let ap = new rawdl.AutoPilot('/data/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys,'/data/downloads');
    await ap.full();
}

main();