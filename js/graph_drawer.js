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
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", strokeColor);
    circle.setAttribute("stroke-width", "2px");
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
function checkBoundary(event, distance) {
    var pos = getMousePos(canvas, event);
    for (var i = 0; i < nodeCenters.length; ++i) {
        var centerDist = Math.pow(pos.x - nodeCenters[i][0], 2) + Math.pow(pos.y - nodeCenters[i][1], 2)
        if (centerDist < Math.pow(distance, 2)) {
            console.log("HELLO" + nodeCenters[i]);
            return i;
        }
    }
    return -1;  // no matches
}

// TODO: this selected node nonsense
var selectedNode = null;
function deleteNode(event) {
    if (selectedNode != null) {
        svg.removeChild(circle);
    }
}

function colorCircle(index) {
    var circle = svg.children[index+1];
    var strokeColor = "black";
    var currColor = circle.getAttribute("stroke");
    if (currColor === "black") {
        strokeColor = "red";
        selectedNode = circle;
    } else {
        selectedNode = null;
    }
    circle.setAttribute("stroke", strokeColor);
}

// TODO: figure out how to make this work
document.onkeydown = function (e) {
    if (e.shiftKey) {
        deleteNode(e);
    }
}

window.onload = function () {
    canvas.ondblclick = function (e) {
        // to ensure that the nodes don't overlap
        // they have to be 2 * radius away from each other
        var index = checkBoundary(e, radius * 2);
        if (index === -1) {
            draw(e);
        }
    }
    canvas.onclick = function (e) {
        var index = checkBoundary(e, radius);
        if (index >= 0) {
            colorCircle(index);
        }
    }
}