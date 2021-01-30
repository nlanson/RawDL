const mjs = require('./m');
const showsjson = __dirname +  '/shows.json'; //path to shows.json

main();
async function main() {
    //Announce Start
    console.log(`RawDL - Seasonal Downloader`); 

    let json = new mjs.json(showsjson);
    let rss = new mjs.rss();
}
