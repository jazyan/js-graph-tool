var mousedElement = null;

function startDrag(node) {
    console.log("start drag");
    mousedElement = node;
}

function drag(evt) {
    if (mousedElement) {
        // TODO: assume that it is a node
        console.log("dragging");
        evt.preventDefault();
        var pos = getMousePos(canvas, evt);
        mousedElement.setAttribute("cx", pos.x);
        mousedElement.setAttribute("cy", pos.y);
        // TODO: update edge after dragging
        edgeList = nodeEdgeMap.get(mousedElement);
    }
}

function endDrag(evt) {
    mousedElement = null;
}