# RawDL💮
This package allows for easy scheduled seasonal anime download and subsequent upload.

## Installation

Use npm to install the package.

```bash
npm i rawdl
```

## Usage (NodeJS)
Create a valid shows.json file: (example)
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

Script example. Set this script to run once every 24h using crontab etc.

```javascript
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
    await ap.full();
}

//OR if you want download only and not upload

async function downloadOnly() {
  let ap = new rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname+'/downloads');
    await ap.downloadOnly();
}

```

## Upcoming
- Utility feature to aide creating shows.json
