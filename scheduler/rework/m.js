//Dependencies
const https = require('https');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

//External Dependencies
const Parser = require('rss-parser');
const parser = new Parser();
const WebTorrent = require('webtorrent');
const { builtinModules } = require('module');

//Classes
class json {
    constructor(directory)
    {
        this.directory = directory;
        this.shows = require(directory);
        this.rawdata = fs.readFileSync(directory);
        this.upToProcessList = JSON.parse(this.rawdata)
    }
    
    write(object){
        fs.writeFile(this.directory, JSON.stringify(object, null, 2), function writeJSON(err) {
            if (err) return console.log(err);
        });
        this.upToProcessList = object;
    }
}

class rssClass {
    constructor() {
        this.parserModule = require('rss-parser');
        this.parser = new this.parserModule();
        this.rss1080 = 'https://subsplease.org/rss/?t&r=1080';
        this.rss720 = 'https://subsplease.org/rss/?t&r=720';
        this.initRSS();
    }

    async initRSS() {
        console.log('init RSS');
        this.feed = await this.parser.parseURL(this.rss1080);
    }
}

class torrent {
    constructor(title, link, path) {
        this.link = link;
        this.title = title;
        this.path = path;
    }

    download() {
        
    }
}

module.exports.json = json;
module.exports.rss = rssClass;
module.exports.torrent = torrent;