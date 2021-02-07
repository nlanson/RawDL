//Dependencies
import WebTorrent = require('webtorrent');
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

    export interface DownloadData {
        title: string, //Torrent Title
        link: string, //Torrent Link
        newTitle: string, //Torrent Rename Title (Passed into UploadData for rename)
        changes: Json_Changes //Json Changes 
    }

    export interface UploadData {
        path: string, //Current video Path
        newPath: string, //New video path (From DownloadData newTitle)
        changes: Json_Changes //Json Changes
    }

    export interface Streamtape_API_Keys {
        username: string,
        password: string,
        folder?: string
    }

    export interface Json_Changes {
        real: Boolean //To validate if changes are real
        current: ShowData //Current shows.json entry to contrast new against.
        new: ShowData
    }
    
    export class AutoPilot {
        private json_path: string;
        public rssFeed: string;
        private outFolder: string;
        private api_keys: Streamtape_API_Keys;

        constructor(json_path: string, rssFeed: string, api_keys?: Streamtape_API_Keys, outFolder?: string) {
            this.json_path = json_path;
            this.rssFeed = rssFeed;
            this.outFolder = (outFolder) ? outFolder:__dirname+'/downloads';
            this.api_keys = (api_keys) ? api_keys: {
                username: '',
                password: ''
            }
        }

        public async full() {
            if (this.api_keys.username == '' || this.api_keys.password == '') throw new Error('Cannot upload without API Keys.');
            
            try {
                let scanner = new Scan(this.json_path, this.rssFeed);
                let dlData: DownloadData[] = await scanner.auto(); //Contains Torrent Info eg: Link, Rename Title, and JSON changes.
                let torrent = new Torrent(dlData, this.outFolder);
                let upData: UploadData[] = await torrent.auto(); //Contains Upload Data eg: current path & rename path.
                let upload = new Upload(upData, this.api_keys, false); //Upload but dont delete.
                let uploadResult: Json_Changes[] = await upload.auto(); //Contains JSON Changes to validate and write.
                let track = new Tracker(uploadResult, this.json_path);
                track.auto();
            } catch (err) {
                console.log(err);
            }
        }

        public async full_delete() {
            if (this.api_keys.username == '' || this.api_keys.password == '') throw new Error('Cannot upload without API Keys.');
            
            try {
                let scanner = new Scan(this.json_path, this.rssFeed);
                let dlData: DownloadData[] = await scanner.auto(); //Contains Torrent Info eg: Link, Rename Title, and JSON changes.
                let torrent = new Torrent(dlData, this.outFolder);
                let upData: UploadData[] = await torrent.auto(); //Contains Upload Data eg: current path & rename path.
                let upload = new Upload(upData, this.api_keys, true); //Upload and then delete
                let uploadResult: Json_Changes[] = await upload.auto(); //Contains JSON Changes to validate and write.
                let track = new Tracker(uploadResult, this.json_path);
                track.auto();
            } catch (err) {
                console.log(err);
            }
        }

        public async downloadOnly() {
            try {
                let scanner = new Scan(this.json_path, this.rssFeed);
                let dlData: DownloadData[] = await scanner.auto();
                let torrent = new Torrent(dlData, this.outFolder);
                let upData: UploadData[] = await torrent.auto();
                
                let changes: Json_Changes[] = [];
                for(let i=0; i<upData.length; i++) {
                    changes.push(upData[i].changes);
                }
                let track = new Tracker(changes, this.json_path);
                track.auto();
            } catch (err) {
                console.log(err);
            }
        }

        public async debug() {
            console.log('Nothing to debug.')
        }

    }
    
    export class Scan { //This class will scan for released episodes under the shows.json filter.
        public json_path: string;
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
            });
        }
        
        public getCheckWorthyShowsByDay(): ShowData[] { //This function creates a list of shows that are potentially available for download.    
            if ( this.list.list.length == 0 ) throw new Error('List length is Zero.');
            
            var today = new Date();
            var day = today.getDay();
            var shows: ShowData[] = [];
            this.list.list.forEach((show:any) => {
                if ( show.day == day ) {
                    shows.push(show)
                    /* 
                    Todo: Push the current ep + the next two eps just in case.
                         - Push a show with the nextEp counter ++
                    */
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
                    let nextEpString = (nextEp < 10)? "0"+nextEp.toString():nextEp;
                    let lookingFor = checkList[i].name + " - " + nextEpString;
                    
                    if ( lookingFor == modifiedTitle ) {
                        found = true; 
                        let newTitle = modifiedTitle.replace(/\s/g, '-'); //Remove illegal chars from title.
                        newTitle = newTitle.replace('(', '');
                        newTitle = newTitle.replace(')', '');

                        let change = { //Creating a change instance to be passed on.
                            current: checkList[i],
                            new: { ...checkList[i], nextEp: checkList[i].nextEp + 1 }, //Copy all of checkList[i] exept nextEp which will be checkList[i].nextEp + 1
                            real: true
                        }
                        
                        let dlData = {
                            title: item.title, //To access the video without its name changed
                            link: item.link, //To download the torrent
                            newTitle: newTitle, //The path that the video shall become.
                            changes: change
                        };

                        downloadData.push(dlData);
                    }               

                    i++;
                }
            });

            return downloadData;
        }

        private findTitleSliceVal(): void {
            this.title_slice_val = (this.rssFeed.description.length == 40) ? 23:22; //If RSS Description is 40 Chars long, set the slice value to 23. Else 22.
        }

        private writeJSON(list: any): void { //Makeshift
            console.log('write function');
            fs.writeFileSync(this.json_path, JSON.stringify(list, null, 2))
        }


        //Create a torrent manager to download each torrent asynchronously to prevent memory leaks.
    }



    export class Torrent {
        private dlDataList: Array<DownloadData>;
        private outFolder: string;

        constructor(dlDataList: Array<DownloadData>, outFolder?: string) {
            this.dlDataList = dlDataList;
            if (this.dlDataList.length == 0 ) throw new Error('Download Data List is Empty.')
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
                    newPath: this.outFolder + '/' + this.dlDataList[i].newTitle + '.mkv', //Combining the output folder and new title to create the new Path.
                    changes: (this.dlDataList[i].changes) ? this.dlDataList[i].changes:{
                        current: {
                            name: '',
                            nextEp: 0,
                            day: -1
                        },
                        new: {
                            name: '',
                            nextEp: 0,
                            day: -1
                        },
                        real: false
                    }
                }
                uploadData.push(upData);
            }

            return uploadData;
        }

        private async createOutFolder(): Promise<void> {
            //console.log(this.outFolder);
            if (!fs.existsSync(this.outFolder)) {
                fs.mkdirSync(this.outFolder);
                console.log(`Output folder created at ${this.outFolder}`);
            }
        }

        public changeOutFolder(newDir: string): void {
            this.outFolder = newDir;
            this.createOutFolder();
        }

        public async download(dlData: DownloadData):Promise<string> { //Takes in DL Data for a single episode and downloads and returns the directory of the downloaded torrent.
            var client = new WebTorrent();
            var options = {
                path: this.outFolder
            }
            return new Promise((resolve, reject) => {
                client.add(dlData.link, options, (torrent) => {
                    console.log(`  -> Downloading: ${torrent.name}`);
                    
                    //Ram monitoring listener. Can be removed
                    torrent.on('download', () => {
                        let usage = process.memoryUsage().heapUsed;
                        let avail = process.memoryUsage().heapTotal;
                        process.stdout.write(`  -> Memory Usage: ${Math.floor(usage/1024/1024)}/${Math.floor(avail/1024/1024)}MB \r`);
                    })

                    torrent.on('done', () => {
                        console.log(`  -> Download Finished - File Size: ${Math.floor(torrent.downloaded/1024/1024)}MB`);
                        torrent.destroy();
                        client.destroy();
                        torrent.removeAllListeners();
                        client.removeAllListeners();
                        let torrentDir = this.outFolder + '/' + torrent.name;
                        resolve(torrentDir);
                    });
                    torrent.on('error', (err) => {
                        throw new Error(`Torrent Client Error: ${err}`);
                    })
                })
            })
        }

        private monitorHeap(torrent: WebTorrent.Torrent) {
            var done = false; //RAM CHECK FLAG
            
            do {
                let usage = process.memoryUsage().heapUsed;
                let avail = process.memoryUsage().heapTotal;
                process.stdout.write(`  -> Memory Usage: ${Math.floor(usage/1024/1024)}/${Math.floor(avail/1024/1024)}MB \r`);
                setTimeout(() => {}, 500);
            } while (done == false);

            torrent.on('done', () => done = true);

        }

    }



    export class Upload {
        private api_keys: Streamtape_API_Keys;
        private uploadDataList: Array<UploadData>;
        public deleteFile: Boolean

        constructor( uploadDataList: Array<UploadData>, api_keys: Streamtape_API_Keys, deleteFile?: Boolean ) {
            this.api_keys = api_keys;
            this.uploadDataList = uploadDataList;
            this.deleteFile = (deleteFile) ? deleteFile:false;
        }

        public async auto() {
            console.log('Upload Autopilot Engaged');
            if(this.uploadDataList.length == 0) throw new Error(`Upload List was Empty`);
            var changesList: Array<Json_Changes> = [];
            for ( let i=0; i<this.uploadDataList.length; i++ ) {
                let path = this.rename(this.uploadDataList[i]);
                let link = await this.getUploadLink();
                let result: Json_Changes = await this.upload(path, link, this.uploadDataList[i].changes);
                changesList.push(result);
                if (this.deleteFile) this.delete(path);
            }
            return changesList;
        }
        
        public rename(upData: UploadData): string {
            fs.rename(upData.path, upData.newPath, () => {});

            return upData.newPath
        }
        
        public async getUploadLink(): Promise<any> {
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

        public async upload(path: string, link: string, changes?: Json_Changes): Promise<Json_Changes> {
            let command = "curl -F data=@" + path + " " + link;
            //console.log(command);
            try {
                console.log(`  -> Uploading ${path}`);
                await exec(command);
                console.log('    -> Upload Finished');
            } catch (err) {
                throw new Error(`CURL Upload Error: ${err}`);
            }

            if(!changes) {
                changes = {
                    current: {
                        name: '',
                        nextEp: -1,
                        day: -1
                    },
                    new: {
                        name: '',
                        nextEp: -1,
                        day: -1
                    },
                    real: false
                }
            }
            return (changes);
        }

        public delete(path: string) {
            fs.unlinkSync(path);
        }

    }

    export class Tracker {
        private changes: Json_Changes[];
        private json_path: string;
        private list: any;
        private listInstance: any;

        constructor(changes: Json_Changes[], json_path: any) {
            this.changes = changes;
            this.json_path = json_path;
            let listRawData = fs.readFileSync(this.json_path, 'utf8');
            this.list = JSON.parse(listRawData);
            this.listInstance = this.list;
        }

        public auto(): void {
            console.log('Tracker AutoPilot Engaged');
            for(let i=0; i<this.changes.length;i++) {
                let verifiedChange = (this.verifyChanges(this.changes[i])) ? true:false;
                if ( verifiedChange == true ) {
                    console.log('  -> Verified');
                    this.updateInstance(this.changes[i]);
                } else {
                    console.log('  -> Change was not verified.');
                }
            }
            this.writeChanges();
        }

        public verifyChanges(change: Json_Changes): Boolean {
            console.log(`  -> Verifying Change for: ${change.current.name}`);

            let ver = (change:Json_Changes, instance: Array<ShowData>):Boolean => { //This function is the logic that returns true or false for verified.
                
                if ( change.real == false ) return false;
                if ( change.new.name == '' || change.new.nextEp < 0 ) return false;
                if ( change.current.name == '' || change.current.nextEp < 0 ) return false;
                
                let i: number = 0;
                let found:Boolean = false;
                while ( i < instance.length && found != true ) {
                    if (instance[i].name == change.current.name && instance[i].nextEp == change.current.nextEp) {
                        found = true;
                        return true;
                    }
                    i++;
                }
                return false;
            }
            let verification = (ver(change, this.listInstance.list)) ? true:false; //let verification = ver(change, this.listInstance.list)
            return verification;
        }

        public updateInstance(change: Json_Changes): void {
           let i=0;
           let found = false;
           while(i<this.listInstance.list.length && found != true) {
            if( this.listInstance.list[i].name == change.current.name && this.listInstance.list[i].nextEp == change.current.nextEp) {
                found = true;
                //this.listInstance.list[i] = change.new;
                this.listInstance.list.splice(i, 1, change.new)
            }

            i++
           }
        }

        public writeChanges(): void {
            fs.writeFileSync(this.json_path, JSON.stringify(this.listInstance, null, 2))
        }
    }

}