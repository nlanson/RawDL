const { rawdl } = require('rawdl');

async function main() {

    const api_keys = {
        username: 'a',
        password: 'a',
        folder: 'a'
    }
    
    console.log('Starting Rawdl Docker Container...')

    let ap = new rawdl.AutoPilot(__dirname+'/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, __dirname+'/downloads');

    await ap.full_delete();

}

main();