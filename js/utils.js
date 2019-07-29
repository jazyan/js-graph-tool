// taken from https://stackoverflow.com/a/20516496
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

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

// taken from https://stackoverflow.com/a/6091752
function computeBoundaryPoint(x1, y1, x2, y2) {
    var theta = Math.atan2(y2 - y1, x2 - x1);
    return [x1 + radius * Math.cos(theta), y1 + radius * Math.sin(theta)]
}

// checks whether the click is in the boundary of a node
// if so, change the color of the node to grey 
// unselect --> need to change color back to black...
function checkBoundary(event, distance) {
    var pos = getMousePos(canvas, event);
    // allow more leeway for clicking (eps = 1)
    if (!checkWithinCanvas(pos.x, pos.y, 1)) {
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
            var inBoundary = checkWithinBoundary(
                posX, 
                posY, 
                Math.min(x1, x2), 
                Math.max(x1, x2), 
                Math.min(y1, y2), 
                Math.max(y1, y2), 
                1
            )
            if (x1 === x2 || y1 === y2) {
                console.log(posX, x1, x2);
                if (inBoundary) {
                    console.log("FOUND VERT / HOR LINE");
                    return i;
                } else {
                    console.log("NOPEP")
                    continue;
                }
            }
            var slope = (y1 - y2) / (x1 - x2);
            var equationY = slope * (posX - x1) + y1;
            var equationX = (posY - y1) / slope + x1;
            var inEquation = (Math.abs(equationY - posY) <= 5) || (Math.abs(equationX - posX) <= 5);
            if (inBoundary && inEquation) {
                console.log("FOUND AN EDGE");
                return i;
            }
        }
    }
    return -1;  // no matches
}
