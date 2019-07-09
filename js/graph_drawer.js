var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");
ctx.strokeStyle = "black";
ctx.strokeRect(20, 20, 800, 800)

var svg = document.getElementById("svg");

var radius = 25;
var selectedNode = null;

// taken from https://stackoverflow.com/a/20516496
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
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
// TODO: make sure it's within canvas boundary
// decide what's a boundary
function draw(event) {
    var pos = getMousePos(canvas, event);
    var circle = createSVGCircle(pos.x, pos.y, radius, "black");
    svg.appendChild(circle);
    console.log(svg.childNodes);
    console.log(svg.children);
}

// checks whether the click is in the boundary of a node
// if so, change the color of the node to red
// unselect --> need to change color back to black...
function checkBoundary(event, distance) {
    var pos = getMousePos(canvas, event);
    // first child of SVG is script, so start at index 1
    if (svg.children.length < 2) {
        return -1;
    }
    for (var i = 1; i < svg.children.length; ++i) {
        var currCircle = svg.children[i];
        var cx = currCircle.getAttribute("cx");
        var cy = currCircle.getAttribute("cy");
        var centerDist = Math.pow(pos.x - cx, 2) + Math.pow(pos.y - cy, 2);
        if (centerDist < Math.pow(distance, 2)) {
            console.log("HELLO" + currCircle);
            return i;
        }
    }
    return -1;  // no matches
}

function deleteNode(event) {
    if (selectedNode != null) {
        svg.removeChild(selectedNode);
        selectedNode = null;
    }
}

function colorCircle(index) {
    var circle = svg.children[index];
    var strokeColor = "black";
    var currColor = circle.getAttribute("stroke");
    if (currColor === "black") {
        strokeColor = "red";
        // check if there's currently a selected node
        // and deselect it by changing the color back to black
        if (selectedNode != null) {
            selectedNode.setAttribute("stroke", "black"); 
        }
        selectedNode = circle;
    } else {
        // current node is red, so it is currently selected. deselect it
        selectedNode = null;
    }
    circle.setAttribute("stroke", strokeColor);
}

document.onkeydown = function (e) {
    if (e.keyCode == 8) {  // backspace
        deleteNode(e);
    }
}

window.onload = function () {
    canvas.ondblclick = function (e) {
        // to ensure that the nodes don't overlap
        // they have to be 2 * radius away from each other
        var index = checkBoundary(e, radius * 2);
        if (index == -1) {
            draw(e);
        }
    }
    canvas.onclick = function (e) {
        var index = checkBoundary(e, radius);
        if (index > 0) {
            colorCircle(index);
        }
    }
}