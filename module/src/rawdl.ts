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
        public rssFeed: any; //RSS Object
        public list: any;
        
        constructor(json_path: string, rssFeed: string) {
            this.json_path = json_path;
            let listRawData = fs.readFileSync(this.json_path, 'utf8');
            this.list = JSON.parse(listRawData);
            
            this.rssFeed = rssFeed;
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
            var downloadData: DownloadData[] = [];

            this.rssFeed.items.forEach((item: any) => {
                //Prune item.title and get rid of prefix and suffix.
                
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


        //Create a torrent manager to download each torrent asynchronously to prevent memory leaks.
    }

    //Todo create a new upload Class with input of streamtape API keys and use this class to upload each downloaded torrent.

}