const uploadModule = require('./module/upModule');

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
    feed.items.forEach(item => {
        item.title = rss.trim1080(item.title);
        if(item.title == uploadDetails.name) {
            link = item.link
        }
    });
    
    if(!rss.linkIsNull(link)) {
        uploadDetails.addLink(link);
        let result = await uploadDetails.download();
        console.log(result);
    } else {
        console.log("No match found. Exiting");
        process.exit(0);
    }

}
