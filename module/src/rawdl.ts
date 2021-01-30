//Dependencies
import WebTorrent = require('webtorrent') ;
import Parser = require('rss-parser');
import * as https from 'https';
import * as fs from 'fs';
import * as util from 'util';

const parser = new Parser();
const exec = util.promisify(require('child_process').exec);

export namespace rawdl {
    
    
    export class showsList{
        private json_path: string;
        private list: any;
        
        constructor(json_path: string) {
            this.json_path = json_path;
            let listRawData = fs.readFileSync(this.json_path, 'utf8');
            this.list = JSON.parse(listRawData);
        }

        testFunction(){
            console.log(this.list);
        }
    }

}