# Leap JS

Welcome to the Leap JavaScript framework. This is intended for use with the Leap (https://www.leapmotion.com/).

## Installation

If you're using npm, you can use `npm install leapjs`.

## Usage

### Using the javascript event loop

```javascript
Leap.loop(function(frame) {
  // ... your code here
})
```

### WARNING

Leap.loop uses requestAnimationFrame internally, which *will not run* inside the
background page of a Chrome extension, due to Chrome's implementation of it.

In general, browsers optimize the load of requestAnimationFrame based on load, element visibility,
battery status, etc. Chrome has chosen to optimize this by omitting the functionality
altogether in the background.js of its extensions.

So, if you're hacking on a Chrome extension, and you need to receive frames inside background.js,
the best solution for now is to use the "Do-it-yourself loop" described below.

### Do-it-yourself loop

To use the leap motion api do the following...

```javascript
var controller = new Leap.Controller();
controller.on('frame', function() {
  console.log("hello")
  console.log(controller.frame().id)
  console.log(controller.frame().fingers.length)
  console.log(controller.frame().finger(0))
})
controller.connect()
```

## Examples

Inside the examples directory are a few great examples. To get them running, do the following:

* Run `npm install`
* Run `make serve`
* Point your browser at http://localhost:8080/examples and enjoy

## Tests

There are currently rudamentary tests. To get them running, do the following:

* Run `npm install`
* Run `make test`
