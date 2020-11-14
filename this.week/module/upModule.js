const https = require('https');
const fs = require('fs');
const WebTorrent = require('webtorrent');
const Parser = require('rss-parser');
const parser = new Parser();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const prompt = require('prompt-sync')();
const hbjs = require('handbrake-js');

class toUploadSingle {
    constructor(name, episode) {
        this.name =  name;
        this.episode = episode;
    }

    static init() {
        let showname = prompt("Show name? (From SubsPls RSS): ");
        let upEp = prompt("Which episode? ");
        let returnClass = new toUploadSingle(showname, upEp);
        return returnClass;
    }

    addLink(link) {
        this.link = link;
    }

    download() {
        let videoName = this.name + "---" + this.episode + ".mkv";
        videoName = videoName.replace(/\s/g, '-');
        let options = {
            path: "/media/nlanson/ndrive/upload/"
        }
        this.videoPath = options.path + videoName;

        return new Promise((resolve, reject) => {
            var client = new WebTorrent();
            client.add(this.link, options, function (torrent) {
                console.log("Downloading: " + torrent.name);

                torrent.on('done', function() {
                    fs.rename( options.path + torrent.name, options.path + videoName, (err) => {
                        if(err != null) {
                            console.log("FS Rename Error: " + err);
                        }
                    });
                    torrent.destroy();
                    client.destroy( () => {
                        resolve('resolved');
                    });
                });
                torrent.on('error', function(err) {
                    console.log("Torrent error: " + err);
                    reject('rejected');
                });
            });
            client.on('error', function(err){
                console.log("Client error: " + err);
                reject('rejected');
            });
        })
    }

    buildCommand(url) {
        var command = "curl -F data=@" + this.postPath + " " + url;
        this.command = command;
        console.log(this.command);
        return command;
    }

    async upload() {
        return new Promise(async (resolve, reject) => {
            let failed = false;
            let error
            try {
                console.log("Uploading " + this.videoName + "...");
                await exec(this.command);
            } catch(err) {
                error = err;
                failed = true;
            }
            if ( failed == true ) {
                reject('Upload failed:\n', err);
            }
            if ( failed == false ) {
                resolve('upload complete!');
            }
        })
    }

    async encode() {
        let prePath = this.videoPath;
        this.postPath = this.videoPath.slice(0, this.videoPath.length - 4) + ".mp4";
        return new Promise((resolve, reject) => {
            hbjs.spawn({ input: this.videoPath, output: this.postPath })
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
                resolve(true);
            });
        })
    }
    
    delete() {
        fs.unlink(this.videoPath);
        fs.unlink(this.postPath);
    }



}

class api {
    constructor(login, pass, fid) {
        this.login = login;
        this.pass = pass;
        this.fid = fid;
    }

    constructURL() {
        let url = "https://api.streamtape.com/file/ul?login=" + this.login + "&key=" + this.pass + "&folder=" + this.fid;
        this.url = url;
        return url;
    }

    uploadGetter() {
        return new Promise((res, rej) => {
            https.get(this.url, (resp) => {
                let data = '';

                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    data = JSON.parse(data);
                    res(data);
                });

                }).on("error", (err) => {
                    console.log("Error: " + err.message);
                    rej('st rejected');
                });
        });
    }
}

class rss {
    constructor(link) {
        this.link = link
    }

    async getFeed() {
        return new Promise((res, rej) => {
            let feed = parser.parseURL(this.link);
            if(1==1){
                res(feed);
            } else {
                rej("rss rejected");
            }
            
        });
    }

    trim1080(title) {
        let strlen = title.length - 28;
        let rtitle = title.slice(13, strlen);
        return rtitle;
    }

    trim720(title) {
        let strlen = title.length - 22;
        let rtitle = title.slice(13, strlen);
        return rtitle;
    }

    linkIsNull(link) {
        if(link == null) {
            return true;
        } else {
            return false;
        }
    }
}






module.exports.tuSingle = toUploadSingle
module.exports.api = api;
module.exports.rss = rss;