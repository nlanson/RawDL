"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var rawdl_1 = require("rawdl");
//Declaring global variables.
//@ts-ignore Ignore is used here to ignore the IDE from complaining about __dirname not being a known variable when infact it is.
var dirname = __dirname;
var api_keys = {
    username: '09c8392061b548eebd4e',
    password: 'Z1doL1Qjm6Fq9Yd',
    folder: 'DjOleF2OpRk'
};
/*
    Scheduled Upload Methods.
*/
function auto() {
    return __awaiter(this, void 0, void 0, function () {
        var ap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ap = new rawdl_1.rawdl.AutoPilot(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080', api_keys, dirname + '/downloads');
                    return [4 /*yield*/, ap.engage()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function semiAuto() {
    return __awaiter(this, void 0, void 0, function () {
        var scanner, dlData, torrent, upData, upload, uploadResult, track;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scanner = new rawdl_1.rawdl.Scan(dirname + '/shows.json', 'https://subsplease.org/rss/?t&r=1080');
                    return [4 /*yield*/, scanner.auto()];
                case 1:
                    dlData = _a.sent();
                    torrent = new rawdl_1.rawdl.Torrent(dlData, dirname + '/downloads');
                    return [4 /*yield*/, torrent.auto()];
                case 2:
                    upData = _a.sent();
                    upload = new rawdl_1.rawdl.Upload(upData, api_keys);
                    return [4 /*yield*/, upload.auto()];
                case 3:
                    uploadResult = _a.sent();
                    track = new rawdl_1.rawdl.Tracker(uploadResult, scanner.json_path);
                    track.auto();
                    return [2 /*return*/];
            }
        });
    });
}
function manual() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
/*
    Uploading a Video.
*/
function uploadVideos() {
    return __awaiter(this, void 0, void 0, function () {
        var upData, upload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    upData = [
                        {
                            path: 'C:/Users/Nlanson/Desktop/Coding/RawDL/examples/downloads/video.mp4',
                            newPath: 'C:/Users/Nlanson/Desktop/Coding/RawDL/examples/downloads/videoEditedTitle.mp4'
                        }
                    ];
                    upload = new rawdl_1.rawdl.Upload(upData, api_keys);
                    return [4 /*yield*/, upload.auto()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/*
    Functions
*/
auto();
//semiAuto();
//uploadVideos();
/*
Upcoming Features:
  -> Single download: Download a single episode(From the past week.)
  -> Utility: To help create shows.json, dlData and upData objects.

*/
