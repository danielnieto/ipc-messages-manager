# ipc-messages-manager
Manage communication between parent and child processes through IPC asynchronously in NodeJS.

## Why?

When trying to use child process' functions from the parent process, you need to set up a bunch of listeners on both sides, and if you need to get a response to a specific function call asynchronously forget about it. Listening for messages does not allow to identify which response corresponds to which request(call to a child's function).

This packages solves this problem, allows you to easily call a function on a child process spawned with `child_process.spawn()`, and have a `callback` for it.

### Problem to solve:

(on parent process)

```js
let child = spawn("node", ["./child.js"], {stdio:["pipe", "pipe", "pipe", "ipc"]});

child.send("asyncRequest1", "doSomething");

child.send("asyncRequest2", "doSomethingDifferent");

child.on("message", function(reponse){

	//this "response" is for asyncRequest1 or asyncRequest2???
	console.log(reponse);
});

```

## How to use it?

1.- Install it in your project:

`npm install ipc-messages-manager -S`

2.- Require it:

* on parent process
`var ipcManager_parent = require("ipc-messages-manager").parent;`

* on child process
`var ipcManager_child = require("ipc-messages-manager").child;`

3.- Spawn the child process (on parent process)

```js
var child = require("child_process").spawn("node", ["./child-process.js"], {stdio:["pipe", "pipe", "pipe", "ipc"]});

```

4.- Send message from the parent to child:

```js
ipcManager_parent.send(child, "actionToPerform", {param1:"foo", param2:"bar"}, function(result){
        console.log("response to this message was " + result);
    });
```

5.- Listen for this message on the child, and provide an answer to it:

```js
ipcManager_child.actions.on("actionToPerform", function(args, callback){
	var result = doProcess(args.param1, args.param2);
	callback(result);
});
```

or, register a function to be called for each action, all at once:

```js
ipcManager_child.setActions({
	"actionToPerform": function(args, callback){
		var result = doProcess(args.param1, args.param2);
		callback(result);
	},
	"secondActionToPerform": function(args, callback){
		doAsyncProcess(args.param1, function(result){
			callback(result);
		});
    }
});
```

## Parent's API
### send(child, action, args, callback)

#### child
Type: `child_process` <br>

The child process to whom it will send the message, it should be a process spawned with `child_process.spawn()` method and with an IPC channel already setup

#### action
Type: `String` <br>

A string to identify the action that needs to be performed on the child instance and answer back to the parent. For example, let's say the child has a `addTwoNumbers()` function and the parent wants to call it, then it is suggested to set `action` to be `addTwoNumbers` to make logical sense, but it's not required.

#### args
Type: `Object` <br>

An object containing the arguments needed to perform "action". These arguments can later be retrieved on the child's listener function. In the example above for action `addTwoNumbers`, this `args` object could be something like `{number1: 5, number2: 10}`.

### callback([response])
Type: `Function` <br>

Function to be called when the child responds back with an answer to this action(message)

The `response` object will be what the child sent back.

## Child's API

### setActions(actions)

#### actions
Type: `Object` <br>

An object containing each action as keys and the value is the function that's going to be executed when that action is requested.

Each function takes 2 parameters, the first one is the `args` object which contains all arguments (or parameters) for the action requested, and the second one is the `callback` that needs to be called to return the response back to the parent.

<br>
Example:

```js
var actions = {
addTwoNumbers: function(args, callback){
						var sum = addTwoNumbers(args.number1, args.number2);
						callback(sum);
					},
anotherAction: function(argsm callback){
						callback("anotherAction performed");
					},
...
}
```

### ipcManager_child.actions

Alternatively you can listen (and respond) for specific actions with the `ipcManager_child.actions` EventEmitter by listening with the `on` method in the following way:

```js
ipcManager_child.actions.on("addTwoNumbers", function(args, callback){
	var sum = addTwoNumbers(args.number1, args.number2);
	callback(sum);
});
```

## Questions
Feel free to open Issues to ask questions about using this package, PRs are very welcome and encouraged.

**SE HABLA ESPAÑOL**

## License

MIT © Daniel Nieto
