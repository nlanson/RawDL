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
    console.log(uploadURL);
}
