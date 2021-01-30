import { rawdl } from 'rawdl';

async function main() {
    //@ts-ignore Ignore is used here to ignore the IDE from complaining about __dirname not being a known variable when infact it is.
    var dirname = __dirname;

    var scanner = new rawdl.Scan(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080');
    let dlData = await scanner.auto();
    let torrent = new rawdl.Torrent(dlData, dirname+'/downloads');
    let upData = await torrent.auto();
    
    console.log(upData);
    // let upData = [{
    //     path: `C:/Users/Nlanson/Desktop/Coding/RawDL/module/examples/downloads/h.mp4`,
    //     newPath: `C:/Users/Nlanson/Desktop/Coding/RawDL/module/examples/horimiya.mp4`
    // }]
    let upload = new rawdl.Upload(upData, {
        username: '09c8392061b548eebd4e',
        password: 'Z1doL1Qjm6Fq9Yd',
        folder: 'DjOleF2OpRk'
    });
    await upload.auto();
    
    
}

main();