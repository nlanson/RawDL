import { rawdl } from 'rawdl';

//Declaring global variables.
//@ts-ignore Ignore is used here to ignore the IDE from complaining about __dirname not being a known variable when infact it is.
var dirname = __dirname;
const api_keys = {
    username: '09c8392061b548eebd4e',
    password: 'Z1doL1Qjm6Fq9Yd',
    folder: 'DjOleF2OpRk'
};


async function auto() { //Lazy Mode
    //Create a new instance of AP with necessary params (shows.json, SubsPlease RSS Feed, Streamtape API Keys, Output Folder);
    let ap = new rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname+'/downloads');
    await ap.engage();
}

async function semiAuto() { //Somewhat Lazy Mode.
    //Scanning for new releases by day.
    let scanner = new rawdl.Scan(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080');
    // let dlData = await scanner.auto();
    // //Download available new releases.
    // let torrent = new rawdl.Torrent(dlData, dirname+'/downloads');
    // let upData = await torrent.auto();
    let upData = [
        {
            path:'C:/Users/Nlanson/Desktop/Coding/RawDL/module/examples/downloads/h.mp4',
            newPath: 'C:/Users/Nlanson/Desktop/Coding/RawDL/module/examples/downloads/horimiya.mp4',
            changes: {
                current: {
                    "name": "Horimiya",
                    "nextEp": 4,
                    "day": 0
                },
                new: {
                    "name": "Horimiya",
                    "nextEp": 5,
                    "day": 0
                }
            }
        }
    ];
    //Upload the completed downloads.
    let upload = new rawdl.Upload(upData, api_keys);
    let uploadResult = await upload.auto();
    let track = new rawdl.Tracker(uploadResult, scanner.json_path);
    track.auto();
}

semiAuto();

/*
Upcoming Features:
  -> Single download: Download a single episode(From the past week.)
  -> Utility: To help create shows.json, dlData and upData objects.

*/
