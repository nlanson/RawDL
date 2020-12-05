//Dependencies
const https = require('https');
const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');
const WebTorrent = require('webtorrent');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const hbjs = require('handbrake-js');
const { encode } = require('punycode');

//Reading shows.json
const jsonPath = __dirname +  '/shows.json';
const shows = require(jsonPath);
let rawdata = fs.readFileSync(jsonPath);
let list = JSON.parse(rawdata); //use list to refer to shows.json contents

//initializing variables
let link = new String;
let title = new String;
const promises = [];

main();

async function main() {
    //let rssLink = "https://subsplease.org/rss/?t&r=720"; //nyaa URL (720p)
    let rssLink1080 = "https://subsplease.org/rss/?t&r=1080" //nyaa URL (1080p)
    //let rssMagLink = "https://subsplease.org/rss/?r=720"; //magnet URL
    let feed = await parser.parseURL(rssLink1080);
    console.log(feed.title);
    var today = new Date();
    var day = today.getDay();

    feed.items.forEach(item => {
        var str_len = item.title.length -23; //-22 for 720p  
        var pathTitle = item.title;
        item.title = item.title.slice(13, str_len);
        let i = 0;
        let found = false;
        while( i < list.showsArray.length && found != true ) {
            var toUp = list.showsArray[i].toUp.toString();
            if( toUp < 10 ) {
                toUp = "0" + toUp.toString();
            }
            let lookingFor = list.showsArray[i].name + " - " + toUp;
            //console.log(lookingFor + " : " + item.title);
            
            if( lookingFor == item.title && shows.showsArray[i].day == day ){
                found == true;
                link = item.link;
                title = item.title;
                title = title.replace(/\s/g, '-');
                console.log("Found match: " + pathTitle);
                list.showsArray[i].toUp = list.showsArray[i].toUp + 1;
                fs.writeFile(jsonPath, JSON.stringify(list, null, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                });
                
                promises.push(startTorrent(title, link, pathTitle));
            }
            i++;
        }
    });
    await Promise.all(promises)
    .then(response => {
        console.log(response + "All promises have been fulfilled. Terminating.");
        process.exit(0);
    })
    .catch(error => {
        console.log(error);
        process.exit(1);
    });
}


async function startTorrent(title, link, pathTitle) {
    let result = await asyncTorrentDownload(title, link, pathTitle);
    result.catch((err) => {
        console.log(err);
    })
}


function asyncTorrentDownload(title, link, pathTitle) {
    return new Promise((resolve, reject) => {
        var client = new WebTorrent()
        var options = {
            path: "/media/nlanson/ndrive/upload/" //__dirname + "/dl/" // Folder to download files to (default=`/tmp/webtorrent/`) Change to /media/nlanson/ndrive for pi
        };

        client.add(link, options, function (torrent) {
            console.log('Client is downloading:', torrent.name);

            torrent.on('done', async function () {
                console.log("Download finished for: ", torrent.name);
                var oldPath = options.path + pathTitle;
                var newPath = options.path + title;
                //newPath = __dirname + "/dl/" + title; //remove this line for pi
                fs.rename(oldPath, newPath, () => { console.log("File Renamed!") });
                //encodedPath = await encode();
                torrent.destroy();
                client.destroy( () => {
                    getUploadLink(newPath, () => {
                        fs.unlink(newPath, () => { console.log(torrent.name + " has been uploaded and deleted.") });
                        resolve('Resolved');
                    });
                }); //end client destroy
            });//end torrent.on done

            torrent.on('error', function (err) {
                reject('Torrent client error: ', err);
            });//end torrent.error
        });//end add
        
        client.on('error', function (err) {
            client.destroy(() => { reject('Torrent client error: ', err) });
        });//end error
    });
}


async function getUploadLink(newPath, _callback) {
    console.log("Grabbing upload link...");
    let data = '';
    
    https.get("https://api.streamtape.com/file/ul?login=09c8392061b548eebd4e&key=Z1doL1Qjm6Fq9Yd&folder=DjOleF2OpRk" , (res) => {
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          data = JSON.parse(data);
          //console.log("Streamtape Upload URL: " + data.result.url);
          uploadVid(data.result.url, newPath, _callback);
        });
    }).on("error", (err) => {
        reject('Upload link retrieval failed: ', err);
    });
}


function uploadVid(uploadUrl, vidPath, _callback) {
    console.log(vidPath);
    var command = "curl -F data=@" + vidPath + " " + uploadUrl;
    curl(command, _callback);
}


async function curl(command, _callback) {
    try {
        console.log("Uploading...")
        await exec(command);
    } catch(err) { 
        reject('cURL failed: ', err);
    };
    _callback();
};

async function encodeVideo(mkvPath) {
    let mp4Path = mkvPath.slice(0, mkvPath - 4) + ".mp4";
    return new Promise((resolve, reject) => {
        hbjs.spawn({ input: mkvPath, output: mp4Path })
        .on('error', err => {
            console.log(err);
            reject(false);
        })
        .on('begin', progress => {
            console.log("Start encoding.");
        })
        .on('end', () => {
            console.log("Encoding finished.");
        })
        .on('complete', () => {
            resolve(mp4Path);
        });
    })
}
