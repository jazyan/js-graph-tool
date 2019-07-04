var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var svg = document.getElementById("svg");

ctx.strokeStyle = "black";
ctx.strokeRect(20, 20, 800, 800)

// taken from https://stackoverflow.com/a/20516496
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

function createSVGCircle(x, y, r, strokeColor) {
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", r);
    circle.setAttribute("style", "fill: none; stroke: " + strokeColor + "; stroke-width: 2px;");
    return circle;
}

// TODO: better way to find overlap?
// TODO: should prevent nodes from overlapping?
var nodeCenters = [];
var radius = 50;
// TODO: make sure it's in the boundary
// decide what's a boundary
function draw(event) {
    var pos = getMousePos(canvas, event);
    var circle = createSVGCircle(pos.x, pos.y, radius, "black");
    svg.appendChild(circle);
    nodeCenters.push([pos.x, pos.y]);
    console.log(nodeCenters);
}

// checks whether the click is in the boundary of a node
// if so, change the color of the node to red
// unselect --> need to change color back to black...
function checkBoundary(event) {
    var pos = getMousePos(canvas, event);
    posX = pos.x;
    posY = pos.y;
    for (var i = 0; i < nodeCenters.length; ++i) {
        var centerDist = Math.pow(posX - nodeCenters[i][0], 2) + Math.pow(posY - nodeCenters[i][1], 2)
        if (centerDist < Math.pow(radius, 2)) {
            console.log("HELLO" + nodeCenters[i]);
            var circle = svg.children[i+1];
            var strokeColor = "red";
            circle.setAttribute("style", "fill: none; stroke: " + strokeColor + "; stroke-width: 2px;");
            return;
        }
    }
}

window.onload = function () {
    canvas.ondblclick = function (e) {
        draw(e);
    }
    canvas.onclick = function (e) {
        checkBoundary(e);
    }
}