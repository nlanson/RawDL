import { rawdl } from 'rawdl';

//Declaring global variables.
//@ts-ignore Ignore is used here to ignore the IDE from complaining about __dirname not being a known variable when infact it is.
var dirname = __dirname;
const api_keys = {
    username: '<<streamtape api username>>',
    password: '<<streamtape api password>>',
    folder: '<<streamtape folder id>>'
};


/*
    Scheduled Upload Methods.
*/

async function auto() { //Lazy Mode
    //Create a new instance of AP with necessary params (shows.json, SubsPlease RSS Feed, Streamtape API Keys, Output Folder);
    let ap = new rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname+'/downloads');
    await ap.full();
}

async function auto_Download_Only() {
    console.log('download only');
    let ap = new rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname+'/downloads');
    await ap.downloadOnly();
}

async function semiAuto() { //Somewhat Lazy Mode. Seperated into seperate classes.
    //Scanning for new releases by day.
    let scanner = new rawdl.Scan(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080');
    let dlData = await scanner.auto();

    //Download available new releases.
    let torrent = new rawdl.Torrent(dlData, dirname+'/downloads');
    let upData = await torrent.auto();

    //Upload the completed downloads.
    let upload = new rawdl.Upload(upData, api_keys);
    let uploadResult = await upload.auto();

    //Update the shows.json
    let track = new rawdl.Tracker(uploadResult, scanner.json_path);
    track.auto();
}



/*
    Functions
*/

auto();
//auto_Download_Only();
//semiAuto();



/*
Upcoming Features:
  -> Single download: Download a single episode(From the past week.)
  -> Utility: To help create shows.json, dlData and upData objects.

*/
