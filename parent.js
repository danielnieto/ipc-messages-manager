"use strict"

const generateID = require("unique-id-generator");

//to store all callbacks associated with an ID
let callbacks = {};

//listener for child's response
let childListener = (args) => {
    if (!args.id) {
        throw new Error("The child's process.send function should send the ID, refer to documentation for details.");
    }

    //get the callback associated with args.id
    callbacks[args.id](args.result);
    delete callbacks[args.id];
}

let send = (child, action, args, callback) => {

    let id = generateID({
        prefix: "cb"
    });

    child.send({
        id,
        action,
        args
    });

    callbacks[id] = callback;

    //attach "childListener" to "child" only the first time "send" function is called
    if (!child.listenerAttached) {
        child.listenerAttached = true;
        child.on("message", childListener);
    }

}

module.exports = {
    send
};
