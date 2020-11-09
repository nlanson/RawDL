const https = require('https');
const fs = require('fs');
const WebTorrent = require('webtorrent');
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
}

class api {
    constructor(login, pass, fid) {
        this.login = login;
        this.pass = pass;
        this.fid = fid;
    }

    constructURL() {
        let url = "https://api.streamtape.com/file/ul?login=" + this.login + "&key=" + this.pass + "&folder=" + this.fid;
        return url;
    }
}






module.exports.tuSingle = toUploadSingle
module.exports.api = api;