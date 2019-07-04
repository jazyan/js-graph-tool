var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

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


// TODO: make sure it's in the boundary
// decide what's a boundary
function draw(event) {
    var pos = getMousePos(canvas, event)
    posX = pos.x;
    posY = pos.y;
    ctx.strokeStyle = "red";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(posX, posY, 50, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

window.onload = function () {
    canvas.onclick = function (e) {
        draw(e);
    }
}