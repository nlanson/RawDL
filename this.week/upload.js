const uploadModule = require('./module/upModule');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

main();



async function main() {
    var uploadDetails = uploadModule.tuSingle.init();
    //console.log(uploadDetails.name);
    //console.log(uploadDetails.episode);

    var api = new uploadModule.api(
        "09c8392061b548eebd4e",
        "Z1doL1Qjm6Fq9Yd",
        "DjOleF2OpRk"
    );
    var uploadURL = api.constructURL();
    uploadURL = await api.uploadGetter();
    uploadURL = uploadURL.result.url;

    rss = new uploadModule.rss("https://subsplease.org/rss/?t&r=1080");
    feed = await rss.getFeed();
    let link;
    let result;
    const promises = [];
    feed.items.forEach(async (item) => {
        item.title = rss.trim1080(item.title);
        if(item.title == uploadDetails.name) {
            link = item.link
            uploadDetails.addLink(link);
            promises.push(uploadDetails.download());
        }
    });
    //[SubsPlease] Tonikaku Kawaii - 06 (1080p) [3E765447].mkv
    let uploadResult;
    if ( promises.length != 0 ) {
        await Promise.all(promises)
        .then(async () => {
            await uploadDetails.encode();
            uploadDetails.buildCommand(uploadURL);
            uploadResult = await uploadDetails.upload();
            console.log(uploadResult);
            uploadDetails.delete();
        })
        .catch(error => {
            console.log(error);
            process.exit(1);
        });
    }
}
