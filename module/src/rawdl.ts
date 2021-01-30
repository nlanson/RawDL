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
        newTitle: string
    }

    interface UploadData {
        path: string,
        newPath: string
    }

    interface Streamtape_API_Keys {
        username: string,
        password: string,
        folder?: string
    }
    
    export class AutoPilot {
        private json_path: string;
        public rssFeed: string;
        private outFolder: string;
        private api_keys: Streamtape_API_Keys;

        constructor(json_path: string, rssFeed: string, api_keys: Streamtape_API_Keys, outFolder?: string) {
            this.json_path = json_path;
            this.rssFeed = rssFeed;
            this.outFolder = (outFolder) ? outFolder:__dirname+'/downloads';
            this.api_keys = api_keys;
        }

        async engage() {
            let scanner = new Scan(this.json_path, this.rssFeed);
            let dlData = await scanner.auto();
            let torrent = new Torrent(dlData, this.outFolder);
            let upData = await torrent.auto();
            let upload = new Upload(upData, this.api_keys);
            await upload.auto();
        }

    }
    
    export class Scan { //This class will scan for released episodes under the shows.json filter.
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

        public async auto(): Promise<Array<DownloadData>> {
            await this.parseRSS();
            let showsToCheck = this.getCheckWorthyShowsByDay();
            let dlData = this.getAvailShows(showsToCheck);
            return dlData;
        }
        
        public async parseRSS(): Promise<void> {
            this.rssFeed = await parser.parseURL(this.rssFeed).catch((err) => {
                throw new Error(`RSS Parse Error: \n ${err}`);
            })
        }
        
        public getCheckWorthyShowsByDay(): ShowData[] { //This function creates a list of shows that are potentially available for download.    
            if ( this.list.list.length == 0 ) throw new Error('List length is Zero.');
            
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

        public getAvailShows(checkList: ShowData[]): DownloadData[] { //This function filters out unreleased shows from the Checklist and returns a list of shows that are available for download.
            this.findTitleSliceVal();
            var downloadData: DownloadData[] = [];

            this.rssFeed.items.forEach((item: any) => {
                let modifiedTitle = item.title.slice(13, item.title.length - this.title_slice_val); //Slice item.title to remove SubsPlease Prefix and Suffix.
                
                let found = false;
                let i = 0;

                while ( i < checkList.length && found != true ) {  
                    let nextEp:number|string = checkList[i].nextEp;
                    nextEp = (nextEp < 10)? "0"+nextEp.toString():nextEp;
                    let lookingFor = checkList[i].name + " - " + nextEp;
                    
                    if ( lookingFor == modifiedTitle ) {
                        found = true; 
                        let newTitle = modifiedTitle.replace(/\s/g, '-'); //Remove illegal chars from title.
                        newTitle = newTitle.replace('(', '');
                        newTitle = newTitle.replace(')', '');
                        let dlData = {
                            title: item.title, //To access the video without its name changed
                            link: item.link, //To download the torrent
                            newTitle: newTitle //The path that the video shall become.
                        };

                        downloadData.push(dlData);
                    }

                    i++;
                }
            });

            //Increment shows.json nextEp count here and writefile either here or at the end.

            return downloadData;
        }

        private findTitleSliceVal() {
            this.title_slice_val = (this.rssFeed.description.length == 40) ? 23:22; //If RSS Description is 40 Chars long, set the slice value to 23. Else 22.
        }


        //Create a torrent manager to download each torrent asynchronously to prevent memory leaks.
    }



    export class Torrent {
        private dlDataList: Array<DownloadData>;
        private outFolder: string;

        constructor(dlDataList: Array<DownloadData>, outFolder?: string) {
            this.dlDataList = dlDataList;
            this.outFolder = (outFolder) ? outFolder:__dirname+'/downloads';
            //this.createOutFolder();
        }

        public async auto(): Promise<Array<UploadData>> { //Auto torrent manager. Asyncronous download + upload.
            this.createOutFolder();
            console.log('Torrent AutoPilot Engaged');

            let uploadData: Array<UploadData> = [];
            for ( let i = 0; i < this.dlDataList.length; i++ ) {
                let path = await this.download(this.dlDataList[i]); //Returns the path of the downloaded video.
                let upData = {
                    path: path,
                    newPath: this.outFolder + '/' + this.dlDataList[i].newTitle + '.mkv' //Combining the output folder and new title to create the new Path.
                }
                uploadData.push(upData);
            }

            return uploadData;
        }

        private async createOutFolder() {
            console.log(this.outFolder);
            if (!fs.existsSync(this.outFolder)) {
                fs.mkdirSync(this.outFolder);
                console.log(`Output folder created at ${this.outFolder}`);
            }
        }

        public changeOutFolder(newDir: string) {
            this.outFolder = newDir;
            this.createOutFolder();
        }

        public async download(dlData: DownloadData):Promise<string> { //Takes in DL Data for a single episode and downloads and returns the directory of the downloaded torrent.
            var client = new WebTorrent();
            var options = {
                path: this.outFolder
            }
            
            return new Promise((resolve, reject) => {
                console.log('  -> Webtorrent has recieved a new torrent.')
                client.add(dlData.link, options, (torrent) => {
                    torrent.on('done', () => {
                        console.log('    -> Download Finished')
                        torrent.destroy();
                        client.destroy();
                        let torrentDir = this.outFolder + '/' + torrent.name;
                        resolve(torrentDir);
                    });
                    torrent.on('error', (err) => {
                        throw new Error(`Torrent Client Error: ${err}`);
                    })
                })
            })
        }

    }



    export class Upload {
        private api_keys: Streamtape_API_Keys;
        private uploadDataList: Array<UploadData>;

        constructor( uploadDataList: Array<UploadData>, api_keys: Streamtape_API_Keys ) {
            this.api_keys = api_keys;
            this.uploadDataList = uploadDataList;
        }

        public async auto() {
            console.log('Upload Autopilot Engaged');
            for ( let i=0; i<this.uploadDataList.length; i++ ) {
                let path = this.rename(this.uploadDataList[i]);
                let link = await this.getUploadLink();
                await this.upload(path, link);
            }
        }
        
        public rename(upData: UploadData): string {
            fs.rename(upData.path, upData.newPath, () => {});

            return upData.newPath
        }
        
        public async  getUploadLink(): Promise<any> {
            let url = (this.api_keys.folder) ? `https://api.streamtape.com/file/ul?login=${this.api_keys.username}&key=${this.api_keys.password}&folder=${this.api_keys.folder}` : `https://api.streamtape.com/file/ul?login=${this.api_keys.username}&key=${this.api_keys.password}`
           
            return new Promise((resolve, reject) => {
                let data:any = '';
                https.get(url, (res) => {
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        data = JSON.parse(data);
                        let link = data.result.url;
                        resolve(link);
                    });
                }).on('error', (err) => {
                    throw new Error(`Upload URL failed to GET: ${err}`);
                });
            });
        }

        public async upload(path: string, link: string) {
            let command = "curl -F data=@" + path + " " + link;
            //console.log(command);
            try {
                console.log('  -> Starting Upload');
                await exec(command);
                console.log('  -> Upload Finished');
            } catch (err) {
                throw new Error(`CURL Upload Error: ${err}`);
            }
        }

    }

    //Todo create a new upload Class with input of streamtape API keys and use this class to upload each downloaded torrent.

}