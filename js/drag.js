var mousedElement = null;

function startDrag(node) {
    console.log("start drag");
    mousedElement = node;
}

function drag(evt) {
    if (!mousedElement) {
        return;
    }
    // TODO: assume that it is a node
    console.log("dragging");
    evt.preventDefault();
    var pos = getMousePos(canvas, evt);
    var edgesToModify = [];
    for (var i = 0; i < edgeList.length; ++i) {
        var node1 = edgeList[i][0];
        var node2 = edgeList[i][1];
        var edge = edgeList[i][2];
        // TODO: condense below lol
        if (mousedElement === node1){
            var x1 = parseInt(pos.x);
            var y1 = parseInt(pos.y);
            var x2 = parseInt(node2.getAttribute("cx"));
            var y2 = parseInt(node2.getAttribute("cy"));
            var bp1 = computeBoundaryPoint(x1, y1, x2, y2);
            var bp2 = computeBoundaryPoint(x2, y2, x1, y1);
            edge.setAttribute("x1", bp1[0]);
            edge.setAttribute("y1", bp1[1]);
            edge.setAttribute("x2", bp2[0]);
            edge.setAttribute("y2", bp2[1]);
        } else if (mousedElement === node2) {
            var x1 = parseInt(node1.getAttribute("cx"));
            var y1 = parseInt(node1.getAttribute("cy"));
            var x2 = parseInt(pos.x);
            var y2 = parseInt(pos.y);
            var bp1 = computeBoundaryPoint(x1, y1, x2, y2);
            var bp2 = computeBoundaryPoint(x2, y2, x1, y1);
            edge.setAttribute("x1", bp1[0]);
            edge.setAttribute("y1", bp1[1]);
            edge.setAttribute("x2", bp2[0]);
            edge.setAttribute("y2", bp2[1]);
        }
    }
    mousedElement.setAttribute("cx", pos.x);
    mousedElement.setAttribute("cy", pos.y);
}

function endDrag(evt) {
    mousedElement = null;
}