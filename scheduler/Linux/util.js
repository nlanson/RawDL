const fs = require('fs');
const prompt = require('prompt-sync')();
const floor = Math.floor;

const path = './shows.json';
const shows = require(path);
let list = fs.readFileSync("shows.json","utf-8");
list = JSON.parse(list);


initUtil();

function initUtil() {
    let action = new String;
    let contin = false;
    while( contin != true ) {
        action = prompt("Input option: (add/rm/cancel): ");
        switch( action ) {
            case "add":
                contin = true;
                Add();
                break;
            case "rm":
                contin = true;    
                Remove();
                break;
            case "cancel":
                contin = true;
                break;
            default:
                console.log("Invalid option.");
                break;
        }//end switch
    }//end while
}//end start

function Add() {
    let name = new String;
    let toUp = new Number;
    let day = new Number;
    
    
    name = prompt('Show name (found in SubsPls RSS): ');
    toUp = prompt('What is the next airing episode? (Default = 1): ');
    day = prompt('What day of the week to fetch show? ');

    if( name == "" || day == "" ) {
        console.log("Cannot process. Not enough information.")
    } else {
        if( day > 6 || day < 0 ) {
            console.log("Invalid Date");
        } else {
            if( toUp == "" || toUp == null ) {
                toUp = 1;
            }
            let new_show = {
                "name": name,
                "toUp": floor(toUp),
                "day": floor(day)
            };
            
            list.showsArray.push(new_show);
            list = JSON.stringify(list, null, 2);
            fs.writeFileSync("shows.json",list,"utf-8");
            console.log(new_show);
        }
    }
}

function Remove() {
    console.log("\n");
    console.log("Shows scheduled for upload: ");
    console.log("----------------------------");
    for( i=0; i<list.showsArray.length; i++ ) {
        console.log(list.showsArray[i].name + " (next ep: " + list.showsArray[i].toUp);
    }
    console.log("----------------------------");
    let toRemove = prompt('Enter show remove from above (Copy Case): ');
    let removed = false;

    for( i=0; i<list.showsArray.length; i++ ) {
        if(list.showsArray[i].name == toRemove){
            list.showsArray.splice(i, 1);
            removed = true;
        }
    }

    if( removed == true ) {
        console.log("Removing...")
        list = JSON.stringify(list, null, 2);
        fs.writeFileSync("shows.json",list,"utf-8");
        console.log("Successfully Removed.")
    } else {
        console.log("Failed to remove. Show not found.")
    }
}
