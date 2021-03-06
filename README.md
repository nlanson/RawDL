# RawDL💮
This package allows for easy scheduled seasonal anime download and subsequent upload.

## Installation

Use npm to install the package.

```bash
npm i rawdl
```

## Usage (NodeJS)
See /examples/js for more use cases.

The following instructions help you set up a directory with shows.json file and JS Script to download and upload new episodes.


1) Create a valid shows.json file. 
eg: (examples/js/shows.json)
```json
{
  "list": [
    {
      "name": "Horimiya",
      "nextEp": 4,
      "day": 0
    }
  ]
}
```

2) Create a JS or TS script to run the package AutoPilot.
eg: (examples/js/index.ts)

```javascript
//Typescript
import { rawdl } from 'rawdl';

var dirname = __dirname;
const api_keys = {
    username: '<<your api username here>>',
    password: '<<your api key here>>',
    folder: '<<your api folder id here>>'
};

async function auto() {
    //Params (shows.json, SubsPlease RSS Feed, Streamtape API Keys, Output Folder);
    let ap = new rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname+'/downloads');
    await ap.full(); //Or use ap.downloadOnly() to only download and no upload.
}

auto();

```
3) Run the script with `node index.js ` or schedule to run the script each day around the time when new episodes are released (6am JST is Optimal) with cron or your preffered task scheduler.


## Usage (Docker)
Check out /examples/docker for details.

Work to create the Docker Image is already done (see examples/docker/Dockerfile). These instructions help you to set up a directory and docker-compose.yml file to pull the image from the internet and run.


1) Create a new directory. Create a "data" folder within this new directory.


2) Within the data folder, create a valid shows.json file
eg:  (examples/docker/data/shows.json)
```json
{
  "list": [
    {
      "name": "Horimiya",
      "nextEp": 4,
      "day": 0
    }
  ]
}
```

3) Back in the new directory, create a docker-compose.yml file
eg:  (examples/docker/docker-compose.yml)
```
version: "3"

services:
  anime: 
    image: nlanson/rawdl:fd
    # There are other images for different run modes. 
    # nlanson/rawdl:fd for Full download and upload as well as file deletion upon completion.
    # nlanson/rawdl:f for Full download and upload and keeping files.
    # nlanson/rawdl:do for Download only and no upload.
    environment:
    #If you are using the Download Only Image (nlanson/rawdl:do), no environment variables are necessary.
      API_USERNAME: '<your streamtape api username>'
      API_PASSWORD: '<your streamtape api password>'
      API_FOLDER: '<your streamtape folder id>'
      TZ: Australia/Sydney # Or your preferred timezone.
    volumes:
      - "./data:/data"
    container_name: rawdl
    tty: true
    stdin_open: true
```

6) Use command `docker-compose up -d -it ` from within the new directory and the rawdl container should start. Access the container using `docker attach rawdl`. 
Now the container should read the shows.json file from the mounted ./data/shows.json and download then upload new episodes it has found.

7) Schedule the container to run daily (6am JST is best) with crontab.

## Upcoming
- Utility feature to aide creating shows.json
- Utility to aide setup of the script environment.
