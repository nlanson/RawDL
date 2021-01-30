//Dependencies
import WebTorrent = require('webtorrent') ;
import Parser = require('rss-parser');
import * as https from 'https';
import * as fs from 'fs';
import * as util from 'util';

const parser = new Parser();
const exec = util.promisify(require('child_process').exec);

export namespace rawdl {
    
    interface ShowData {
        name: string,
        nextEp: number,
        day: number
    }

    interface DownloadData {
        title: string,
        link: string,
        path: string
    }
    
    export class Checker{
        private json_path: string;
        private title_slice_val: number;
        public rssFeed: any; //RSS Object
        public list: any;
        
        constructor(json_path: string, rssFeed: string) {
            this.json_path = json_path;
            let listRawData = fs.readFileSync(this.json_path, 'utf8');
            this.list = JSON.parse(listRawData);
            
            this.rssFeed = rssFeed;
            this.title_slice_val = 23 //Default set to 23 to deal with 1080p Title Slice
        }

        public async parseRSS() {
            this.rssFeed = await parser.parseURL(this.rssFeed);
        }
        
        public getCheckWorthyShowsByDay(): ShowData[] {
            var today = new Date();
            var day = today.getDay();
            var shows: ShowData[] = [];
            this.list.list.forEach((show:any) => {
                if ( show.day == day ) {
                    shows.push(show) // Todo: Push the current ep + the next two eps just in case.
                }
            });
            return(shows);
        }

        public getAvailShows(checkList: ShowData[]): DownloadData[] {
            this.findTitleSliceVal();
            var downloadData: DownloadData[] = [];

            this.rssFeed.items.forEach((item: any) => {
                item.title = item.title.slice(13, item.title.length - this.title_slice_val); //Slice item.title to remove SubsPlease Prefix and Suffix.
                
                let found = false;
                let i = 0;

                while ( i < checkList.length && found != true ) {  
                    let nextEp:number|string = checkList[i].nextEp;
                    nextEp = (nextEp < 10)? "0"+nextEp.toString():nextEp;
                    let lookingFor = checkList[i].name + " - " + nextEp;
                    
                    if ( lookingFor == item.title ) {
                        found = true; 
                        let path = item.title.replace(/\s/g, '-'); //Remove illegal chars from title.
                        path = path.replace('(', '');
                        path = path.replace(')', '');
                        let dlData = {
                            title: item.title,
                            link: item.link,
                            path: path
                        }
                        downloadData.push(dlData);
                    }

                    i++;
                }
            });

            return downloadData;
        }

        private findTitleSliceVal() {
            this.title_slice_val = (this.rssFeed.description.length == 40) ? 23:22; //If RSS Description is 40 Chars long, set the slice value to 23. Else 22.
        }


        //Create a torrent manager to download each torrent asynchronously to prevent memory leaks.
    }

    //Todo create a new upload Class with input of streamtape API keys and use this class to upload each downloaded torrent.

}