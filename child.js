"use strict"

const EventEmitter = require('events');

let actionsStore = {}
let actionsEmitter = new EventEmitter();

//listen for messages from the parent process
process.on("message", (args) => {
    
    //function to send a message back to the parent, containing the result of the action requested
    let responder = (result) => {
        args.result = result;
        process.send(args);
    }

    //retrieve what function to call when a message is received
    let action = actionsStore[args.action];

    //if no action was registered through "setActions" method, then emit an event for that action
    if (typeof action === "function") {
        action(args.args, responder);
    } else {
        actionsEmitter.emit(args.action, args.args, responder);
    }

});

let setActions = (actions) => {
    actionsStore = Object.assign({}, actionsStore, actions);
};

module.exports = {
    setActions,
    actions: actionsEmitter
};
