// TODO: do I even need a canvas anymore?
var canvas = document.getElementById("canvas");

var xlow = 20;
var xhigh = 800;
var ylow = 20;
var yhigh = 800;
var ctx = canvas.getContext("2d");
ctx.strokeStyle = "black";
// TODO: draw this with SVG?
ctx.strokeRect(xlow, ylow, xhigh, yhigh);

var svg = document.getElementById("svg");

var radius = 15;
var selectedObject = null;
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

function checkWithinBoundary(x, y, eps) {
    return (
        x > xlow + eps && 
        x < xhigh - eps && 
        y > ylow + eps && 
        y < yhigh - eps 
    );
}

function createSVGCircle(x, y, r, strokeColor) {
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "black");
    circle.setAttribute("stroke", strokeColor);
    circle.setAttribute("stroke-width", "2px");
    return circle;
}

function drawNode(event) {
    var pos = getMousePos(canvas, event);
    // ensure that nodes do not touch the boundary
    if (!checkWithinBoundary(pos.x, pos.y, radius / 2)) {
        return;
    }
    var circle = createSVGCircle(pos.x, pos.y, radius, "black");
    svg.appendChild(circle);
    nodeEdgeMap.set(circle, []);
}

// checks whether the click is in the boundary of a node
// if so, change the color of the node to grey 
// unselect --> need to change color back to black...
function checkBoundary(event, distance) {
    var pos = getMousePos(canvas, event);
    // allow more leeway for clicking (eps = 1)
    if (!checkWithinBoundary(pos.x, pos.y, 1)) {
        return -1;
    }
    for (var i = 0; i < svg.children.length; ++i) {
        var currNode = svg.children[i];
        // only consider SVG nodes that are circles
        if (currNode.nodeName === "circle") {
            var cx = currNode.getAttribute("cx");
            var cy = currNode.getAttribute("cy");
            var centerDist = Math.pow(pos.x - cx, 2) + Math.pow(pos.y - cy, 2);
            if (centerDist < Math.pow(distance, 2)) {
                return i;
            }
        } else if (currNode.nodeName === "line") {
            var x1 = parseInt(currNode.getAttribute("x1"));
            var y1 = parseInt(currNode.getAttribute("y1"));
            var x2 = parseInt(currNode.getAttribute("x2"));
            var y2 = parseInt(currNode.getAttribute("y2"));
            var posX = parseInt(pos.x);
            var posY = parseInt(pos.y);
            // TODO THIS IS WONKY FOR VERT LINES
            var inBoundary = (
                posX >= Math.min(x1, x2) - 1 && 
                posX <= Math.max(x1, x2) + 1 && 
                posY >= Math.min(y1, y2) - 1 && 
                posY <= Math.max(y1, y2) + 1 
            )
            if (x1 === x2) {
                console.log(posX, x1, x2);
                if (inBoundary) {
                    console.log("FOUND VERT");
                    return i;
                } else {
                    console.log("NOPEP")
                    continue;
                }
            }
            var slope = (y1 - y2) / (x1 - x2);
            var equation = slope * (posX - x1) + y1;
            if (inBoundary && Math.abs(equation - posY) <= 10) {
                console.log("FOUND AN EDGE");
                return i;
            }
        }
    }
    return -1;  // no matches
}

// deletes the current selected object 
function deleteSelectedObject() {
    if (selectedObject === null) {
        return;
    }
    if (selectedObject.nodeName === "circle") {
        deleteNodeEdges(selectedObject);
    } else {
        deleteEdgeFromMap(selectedObject);
    }
    svg.removeChild(selectedObject);
    selectedObject = null;
}

function deleteEdgeFromMap(toDeleteEdge) {
    for (var [node, edgeList] of nodeEdgeMap) {
        for (var i = 0; i < edgeList.length; ++i) {
            if (toDeleteEdge === edgeList[i]) {
                edgeList.splice(i, 1);
                break;  // there should only be one occurrence of edge
            }
        }
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
    line.setAttribute("stroke-width", 6);
    line.setAttribute("stroke", "blue");
    svg.appendChild(line);
    return line;
}

function selectEdge(edge) {
    edge.setAttribute("stroke", "grey");
}

function deselectEdge(edge) {
    edge.setAttribute("stroke", "blue");
}

function selectNode(node) {
    node.setAttribute("stroke", "grey");
    node.setAttribute("fill", "grey");
}

function deselectNode(node) {
    node.setAttribute("stroke", "black");
    node.setAttribute("fill", "black");
}

function clickEdge(edge) {
    if (selectedObject === null) {
        selectEdge(edge);
        selectedObject = edge;
    } else if (selectedObject.nodeName === "circle") {
        deselectNode(selectedObject);
        selectEdge(edge);
        selectedObject = edge;
    } else if (selectedObject === edge) {
        deselectEdge(edge);
        selectedObject = null;
    } else {
        // selectedObject is a line other than current edge
        deselectEdge(selectedObject)
        selectEdge(edge);
        selectedObject = edge;
    }
}

function clickNode(node) {
    if (selectedObject === null) {
        // if there's no currently selected node, the circle becomes the node
        selectNode(node);
        selectedObject = node;
    } else if (selectedObject.nodeName === "line") {
        deselectEdge(selectedObject);
        selectNode(node);
        selectedObject = node;
    } else if (selectedObject === node) {
        // if the currently selected node is the circle, deselect it
        deselectNode(node);
        selectedObject = null;
    } else {
        // there is a selected circle, and our current circle is another node
        // that means we want to draw an edge! then deselect the node
        x1 = parseInt(selectedObject.getAttribute("cx"));
        y1 = parseInt(selectedObject.getAttribute("cy"));
        x2 = parseInt(node.getAttribute("cx"));
        y2 = parseInt(node.getAttribute("cy"));
        var line = drawEdge(x1, y1, x2, y2);
        // add edge to nodeEdgeMap        
        var n1Edges = nodeEdgeMap.get(selectedObject);
        n1Edges.push(line);
        var n2Edges = nodeEdgeMap.get(node);
        n2Edges.push(line);
        // deselect currently selected node
        deselectNode(selectedObject);
        selectedObject = null;
    }
}

document.onkeydown = function (e) {
    if (e.keyCode == 8) {  // backspace
        deleteSelectedObject();
    }
}

window.onload = function () {
    // double click creates a node
    canvas.ondblclick = function (e) {
        // to ensure that the nodes don't overlap
        // they have to be 2 * radius away from each other
        var index = checkBoundary(e, radius * 2);
        if (index == -1) {
            drawNode(e);
        }
    }
    // single click selects / deselects node
    // as well as creates edge
    // TODO: delete edge
    canvas.onclick = function (e) {
        var index = checkBoundary(e, radius);
        if (index > 0) {
            var node = svg.children[index];
            if (node.nodeName === "line") {
                clickEdge(node);
            } else {
                clickNode(node);
            }
        }
    }
}

// SVG to PNG logic below
// taken from https://stackoverflow.com/a/28226736
var btn = document.querySelector('button');

function triggerDownload (imgURI) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
    });
    var a = document.createElement('a');
    a.setAttribute('download', 'graph.png');
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');
    a.dispatchEvent(evt);
}

btn.addEventListener('click', function () {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var data = (new XMLSerializer()).serializeToString(svg);
    var DOMURL = window.URL || window.webkitURL || window;
    
    var img = new Image();
    var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svgBlob);
    
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);
        var imgURI = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        triggerDownload(imgURI);
    };
    img.src = url;
});

// TODO: dragging logic
// TODO: taken from https://www.kirupa.com/html5/drag.htm, but doesn't quite work
var initialX;
var initialY;
var currentX;
var currentY;
var draggedObject = null;
svg.addEventListener("mousedown", dragStart, false);
svg.addEventListener("mouseup", dragEnd, false);
svg.addEventListener("mousemove", drag, false);

function dragStart(e) {
    var index = checkBoundary(e, radius);
    if (index > 0) {
        draggedObject = svg.children[index];
        initialX = draggedObject.getAttribute("cx");
        initialY = draggedObject.getAttribute("cy");
    }
    console.log("START DRAG");
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    draggedObject = null;
}

function drag(e) {
    console.log("dragging");
    if (draggedObject != null) {
        var currentPos = getMousePos(e);
        currentX = currentPos.x;
        currentY = currentPos.y;
        draggedObject.setAttribute("cx", currentX);
        draggedObject.setAttribute("cy", currentY);
    }
}