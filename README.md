# RawDL💮
This package allows for easy scheduled seasonal anime download and subsequent upload.

## Installation

Use npm to install the package.

```bash
npm i rawdl
```

## Usage
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
    username: '09c8392061b548eebd4e',
    password: 'Z1doL1Qjm6Fq9Yd',
    folder: 'DjOleF2OpRk'
};


async function auto() {
    //Params (shows.json, SubsPlease RSS Feed, Streamtape API Keys, Output Folder);
    let ap = new rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname+'/downloads');
    await ap.engage();
}

```

## Upcoming
- Utility feature to aide creating shows.json
