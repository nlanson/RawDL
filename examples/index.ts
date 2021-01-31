import { rawdl } from 'rawdl';

//Declaring global variables.
//@ts-ignore Ignore is used here to ignore the IDE from complaining about __dirname not being a known variable when infact it is.
var dirname = __dirname;
const api_keys = {
    username: '09c8392061b548eebd4e',
    password: 'Z1doL1Qjm6Fq9Yd',
    folder: 'DjOleF2OpRk'
};


/*
    Scheduled Upload Methods.
*/

async function auto() { //Lazy Mode
    //Create a new instance of AP with necessary params (shows.json, SubsPlease RSS Feed, Streamtape API Keys, Output Folder);
    let ap = new rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname+'/downloads');
    await ap.engage();
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

async function manual() { //Hardcode Mode.
    //Module can work with individual methods being changed together. Allows for more customisable code.
}


/*
    Uploading a Video.
*/

async function uploadVideos() {
    let upData = [ //Array of videos to upload. Use same path & newPath properties to not change name. Could also be a param.
        {
            path: 'C:/Users/Nlanson/Desktop/Coding/RawDL/examples/downloads/video.mp4',
            newPath: 'C:/Users/Nlanson/Desktop/Coding/RawDL/examples/downloads/videoEditedTitle.mp4'
        }
    ]
    
    let upload = new rawdl.Upload(upData, api_keys);    
    await upload.auto();
}



/*
    Functions
*/

auto();
//semiAuto();
//uploadVideos();


/*
Upcoming Features:
  -> Single download: Download a single episode(From the past week.)
  -> Utility: To help create shows.json, dlData and upData objects.

*/
