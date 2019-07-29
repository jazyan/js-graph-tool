// taken from https://stackoverflow.com/a/20516496
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

var XLOW = 20;
var XHIGH = 800;
var YLOW = 20;
var YHIGH = 800;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.strokeStyle = "black";
ctx.strokeRect(XLOW, YLOW, XHIGH, YHIGH);

function checkWithinCanvas(x, y, eps) {
    return checkWithinBoundary(x, y, XLOW, XHIGH, YLOW, YHIGH, eps);
}

function checkWithinBoundary(x, y, xlo, xhi, ylo, yhi, eps) {
    return (
        x > xlo + eps &&
        x < xhi - eps &&
        y > ylo + eps &&
        y < yhi - eps
    );
}