import { rawdl } from 'rawdl';

async function auto() {
    //@ts-ignore Ignore is used here to ignore the IDE from complaining about __dirname not being a known variable when infact it is.
    var dirname = __dirname;
    
    let api_keys  = {
        username: '09c8392061b548eebd4e',
        password: 'Z1doL1Qjm6Fq9Yd',
        folder: 'DjOleF2OpRk'
    };
    let ap = new rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname+'/downloads');
    await ap.engage();
    
}

async function semiAuto() {
    //@ts-ignore Ignore is used here to ignore the IDE from complaining about __dirname not being a known variable when infact it is.
    var dirname = __dirname;
    let api_keys  = {
        username: '09c8392061b548eebd4e',
        password: 'Z1doL1Qjm6Fq9Yd',
        folder: 'DjOleF2OpRk'
    };

    let scanner = new rawdl.Scan(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080');
    let dlData = await scanner.auto();
    let torrent = new rawdl.Torrent(dlData, dirname+'/downloads');
    let upData = await torrent.auto();
    let upload = new rawdl.Upload(upData, api_keys);
    await upload.auto();
}

auto();