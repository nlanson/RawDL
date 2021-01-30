import { rawdl } from 'rawdl';

async function main() {
    var checker = new rawdl.Checker(__dirname+'/shows.json', 'https://subsplease.org/rss/?t&r=1080');
    await checker.parseRSS();
    let showsToCheck = checker.getCheckWorthyShowsByDay();
    console.log(showsToCheck);
    let dlData = checker.getAvailShows(showsToCheck);
    console.log(dlData);
}

main();
