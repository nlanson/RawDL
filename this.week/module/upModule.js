const https = require('https');
const fs = require('fs');
const WebTorrent = require('webtorrent');
const Parser = require('rss-parser');
const parser = new Parser();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const prompt = require('prompt-sync')();

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
        return this.link;
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