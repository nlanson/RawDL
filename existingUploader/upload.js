const uploadModule = require('./module/upModule');

var uploadDetails = uploadModule.tuSingle.init();

var api = new uploadModule.api(
    "09c8392061b548eebd4e",
    "Z1doL1Qjm6Fq9Yd",
    "DjOleF2OpRk"
);
var uploadURL = api.constructURL();
console.log(uploadURL);
