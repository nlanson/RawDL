//Dependencies
import WebTorrent = require('webtorrent') ;
import Parser = require('rss-parser');
import * as https from 'https';
import * as fs from 'fs';
import * as util from 'util';

const parser = new Parser();
const exec = util.promisify(require('child_process').exec);

export namespace rawdl {
    
    
    export class Checker{
        private json_path: string;
        private rssFeed: any; //RSS Object
        private list: any;
        
        constructor(json_path: string, rssFeed: string) {
            this.json_path = json_path;
            let listRawData = fs.readFileSync(this.json_path, 'utf8');
            this.list = JSON.parse(listRawData);
            
            this.rssFeed = rssFeed;
        }

        async parseRSS() {
            this.rssFeed = await parser.parseURL(this.rssFeed);
        }

        async checkForShowsByDay() {
            //Loop over feed and list to extract download link for available shows.
        }

        //Create a torrent manager to download each torrent asynchronously to prevent memory leaks.
    }

    //Todo create a new upload Class with input of streamtape API keys and use this class to upload each downloaded torrent.

}