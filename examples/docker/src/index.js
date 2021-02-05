const rawdl = require('rawdl');

async function main() {
    const api_keys = {
        username: '',
        password: '',
        folder: ''
    };

    console.log('Starting Rawdl Package...')

    let ap = new rawdl.rawdl.AutoPilot('/data/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys,'/data/downloads');

    console.log(ap.json_path)

    //await ap.full();
    //await ap.downloadOnly();
    await ap.full_delete();
}



main();