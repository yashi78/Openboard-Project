let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor= document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let penColor ="black";
let eraserColor ="white";
let penWidth= pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;
let undoRedoTracker = []; 
let track = 0;
let undo = document.querySelector(".undo");
let redo = document.querySelector(".redo");

let mouseDown = false;


//API
let tool= canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

canvas.addEventListener("mousedown", (e)=>{
   mouseDown=true;
    let data ={
    x:e.clientX,
    y:e.clientY
}
  socket.emit("beginPath", data);
})

canvas.addEventListener("mousemove", (e)=>{
    if(mouseDown)
    {
        let data = {
        x: e.clientX,
        y: e.clientY,
        color: eraserFlag? eraserColor : penColor,
        width: eraserFlag? eraserWidth : penWidth

    }
    socket.emit("drawStroke",data);
    }
    

})
canvas.addEventListener("mouseup", (e)=>{
    mouseDown= false;

    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length-1;


})

undo.addEventListener("click",(e)=>{
   if(track > 0 )
   track--;
   let data = {
   trackValue: track,
   undoRedoTracker}
   socket.emit("redoUndo",data);
   //undoRedoCanvas(trackObj)

})


redo.addEventListener("click",(e)=>{
    if(track < undoRedoTracker.length-1)
    track++;
    let data = {
        trackValue: track,
        undoRedoTracker}
        socket.emit("redoUndo",data);
})

function undoRedoCanvas(trackObj)
{
track = trackObj.trackValue;
undoRedoTracker = trackObj.undoRedoTracker;

let url = undoRedoTracker[track];
let img = new Image();
img.src = url;
img.onload = (e) => {
    tool.drawImage(img,0,0,canvas.width, canvas.height);

}
}


function beginPath(strokeObj)
{
    tool.beginPath();
    tool.moveTo(strokeObj.x,strokeObj.y);
}

function drawStroke(strokeObj)
{
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x , strokeObj.y);
    tool.stroke();
}


pencilColor.forEach((colorElem)=>{
colorElem.addEventListener ("click",(e)=>{
    let color = colorElem.classList[0];
    penColor = color;
    tool.strokeStyle = penColor;

})
})

pencilWidthElem.addEventListener("change", (e)=>{
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;

})

eraserWidthElem.addEventListener("change", (e)=>{
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
    
})

eraser.addEventListener("click", (e)=>{
    if(eraserFlag)
    {
       tool.strokeStyle = eraserColor;
       tool.lineWidth = eraserWidth;
    }
    else{
        tool.strokeStyle = penColor;
       tool.lineWidth = penWidth;

    }
})

socket.on("beginPath", (data)=>{
    beginPath(data);
})

socket.on("drawStroke",(data) => {
    drawStroke(data);
})


socket.on("redoUndo",(data) => {
    undoRedoCanvas(data);
})