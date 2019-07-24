// TODO: delete a vertex, must delete edges
// TODO: delete edge

var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");
ctx.strokeStyle = "black";
ctx.strokeRect(20, 20, 800, 800)

var svg = document.getElementById("svg");

var radius = 25;
var selectedNode = null;
// map of nodes keys to edge list values
var nodeEdgeMap = new Map();

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
    circle.setAttribute("fill", "white");
    circle.setAttribute("stroke", strokeColor);
    circle.setAttribute("stroke-width", "2px");
    return circle;
}

// TODO: better way to find overlap?
// TODO: make sure it's within canvas boundary
// decide what's a boundary
function drawNode(event) {
    var pos = getMousePos(canvas, event);
    var circle = createSVGCircle(pos.x, pos.y, radius, "black");
    svg.appendChild(circle);
    nodeEdgeMap.set(circle, []);
}

// checks whether the click is in the boundary of a node
// if so, change the color of the node to red
// unselect --> need to change color back to black...
function checkBoundary(event, distance) {
    var pos = getMousePos(canvas, event);
    for (var i = 0; i < svg.children.length; ++i) {
        var currNode = svg.children[i];
        // only consider SVG nodes that are circles
        if (currNode.nodeName !== "circle") {
            continue;
        }
        var cx = currNode.getAttribute("cx");
        var cy = currNode.getAttribute("cy");
        var centerDist = Math.pow(pos.x - cx, 2) + Math.pow(pos.y - cy, 2);
        if (centerDist < Math.pow(distance, 2)) {
            return i;
        }
    }
    return -1;  // no matches
}

// deletes the current selectedNode
function deleteNode() {
    if (selectedNode != null) {
        deleteNodeEdges(selectedNode);
        svg.removeChild(selectedNode);
        selectedNode = null;
    }
}

// given a node that is to be deleted
// delete its edges, and all references to its edges
// that includes references in the edge lists of other nodes
function deleteNodeEdges(toDeleteNode) {
    var edges = nodeEdgeMap.get(toDeleteNode);
    for (var [node, edgeList] of nodeEdgeMap) {
        if (node === toDeleteNode) {
            continue;
        }
        var toDelete = []
        for (var i = 0; i < edges.length; ++i) {
            for (var j = 0; j < edgeList.length; ++j) {
                if (edges[i] === edgeList[j]) {
                    toDelete.push(j);
                }
            }
        }
        for (var i = toDelete.length - 1; i >= 0; --i) {
            edgeList.splice(toDelete[i], 1);
        }
    }
    for (var i = 0; i < edges.length; ++i) {
        svg.removeChild(edges[i]);
    }
    nodeEdgeMap.delete(toDeleteNode);
}

// taken from https://stackoverflow.com/a/6091752
function computeBoundaryPoint(x1, y1, x2, y2) {
    var theta = Math.atan2(y2 - y1, x2 - x1);
    return [x1 + radius * Math.cos(theta), y1 + radius * Math.sin(theta)]
}

// given node centers (x1, y1) of circle C1 and (x2, y2) of circle C2
// draw an edge from the boundary of C1 to the boundary of C2
function drawEdge(x1, y1, x2, y2) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var bp1 = computeBoundaryPoint(x1, y1, x2, y2);
    var bp2 = computeBoundaryPoint(x2, y2, x1, y1);
    line.setAttribute("x1", bp1[0]);
    line.setAttribute("y1", bp1[1]);
    line.setAttribute("x2", bp2[0]);
    line.setAttribute("y2", bp2[1]);
    line.setAttribute("stroke-width", 1.5);
    line.setAttribute("stroke", "black");
    svg.appendChild(line);
    return line;
}

// this is more like deselect / select logic
// with drawing edge logic
// TODO: find a better name
function colorCircle(index) {
    var circle = svg.children[index];
    if (selectedNode == null) {
        // if there's no currently selected node, the circle
        // becomes the node
        circle.setAttribute("stroke", "red");
        selectedNode = circle;
    } else if (selectedNode == circle) {
        // if the currently selected node is the circle, deselect it
        selectedNode.setAttribute("stroke", "black");
        selectedNode = null;
    } else {
        // there is a selected node, and our current circle is another node
        // that means we want to draw an edge! then deselect the node
        x1 = parseInt(selectedNode.getAttribute("cx"));
        y1 = parseInt(selectedNode.getAttribute("cy"));
        x2 = parseInt(circle.getAttribute("cx"));
        y2 = parseInt(circle.getAttribute("cy"));
        var line = drawEdge(x1, y1, x2, y2);
        
        var n1Edges = nodeEdgeMap.get(selectedNode);
        n1Edges.push(line);

        var n2Edges = nodeEdgeMap.get(circle);
        n2Edges.push(line);

        selectedNode.setAttribute("stroke", "black");
        selectedNode = null;
    }
}

document.onkeydown = function (e) {
    if (e.keyCode == 8) {  // backspace
        deleteNode();
    }
}

window.onload = function () {
    canvas.ondblclick = function (e) {
        // to ensure that the nodes don't overlap
        // they have to be 2 * radius away from each other
        var index = checkBoundary(e, radius * 2);
        if (index == -1) {
            drawNode(e);
        }
    }
    canvas.onclick = function (e) {
        var index = checkBoundary(e, radius);
        if (index > 0) {
            colorCircle(index);
        }
    }
}