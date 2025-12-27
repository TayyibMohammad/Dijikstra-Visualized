const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const getIndex = (char) => {
    return char.charCodeAt(0) - 'a'.charCodeAt(0);
}

const grayValue = (element) => {
    const style = window.getComputedStyle(element);
    const bgColor = style.backgroundColor;
    const rgb = bgColor.match(/\d+/g);
    if (rgb) {
        const r = parseInt(rgb[0], 10);
        const g = parseInt(rgb[1], 10);
        const b = parseInt(rgb[2], 10);
        // Calculate grayscale value using luminosity method
        return Math.round(0.21 * r + 0.72 * g + 0.07 * b);
    }
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // 1. Get the size the CSS has given the canvas
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // 2. Set the internal drawing buffer to match physical pixels
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // 3. Scale the context so drawing logic remains the same
    ctx.scale(dpr, dpr);

    // 4. Redraw your content (since resizing clears the canvas)
    // If you have a draw function, call it here:
    // drawNodes(slider.value); 
}



// Initial setup
resizeCanvas();

// Optional: Listen for window resize to keep it sharp if user moves browser
window.addEventListener('resize', () => {
    if(startNodeChoosen) return ;
    nodes=[]
    
    resizeCanvas();
    makeAdjMatrix(slider.value);
    addFunctionalityToCells();    

});

var nodes = [];
var startNode = null;
var startNodeChoosen = false;
const radius = 30;
const padding = 5; // Extra space so they don't even get close

function drawArrow(x1, y1, x2, y2, radius = 30, color) {
  var headLength = 12;
  if(color==='white'){
    headLength = 15;
  }
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // 1. Calculate the start and end points on the circles' perimeters
  const startX = x1 + radius * Math.cos(angle);
  const startY = y1 + radius * Math.sin(angle);
  const endX = x2 - radius * Math.cos(angle);
  const endY = y2 - radius * Math.sin(angle);

  // 2. Draw the shaft (the line)
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  if(color==='white'){
    ctx.lineWidth = 3;
  }else{
    ctx.lineWidth = 2;
  }
  ctx.stroke();
  // 3. Draw the arrowhead at the edge of the destination node
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 6),
    endY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 6),
    endY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

var matrix = [];

function drawEdge(nodeA, nodeB, color){
    const startNode = nodes[nodeA];
    const endNode = nodes[nodeB];

    if(!startNode || !endNode) return;
    
    if(isUnDirected){
        drawArrow(startNode.x, startNode.y, endNode.x, endNode.y, 30, color);
        drawArrow(endNode.x, endNode.y, startNode.x, startNode.y, 30, color);
    }
    else{
        drawArrow(startNode.x, startNode.y, endNode.x, endNode.y, 30, color);
    }
}

function isOverlapping(newX, newY) {
    for (let node of nodes) {
        const dx = newX - node.x;
        const dy = newY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If distance is less than double the radius (+ padding), they touch
        if (distance < (radius * 2) + padding) {
            return true; 
        }
    }
    return false;
}

function generateNonOverlappingNodes(n) {
    nodes.length = 0; // Clear array
    let attempts = 0;

    console.log(canvas.width, canvas.height);
    while (nodes.length < n && attempts < 1000) {
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;

        if (!isOverlapping(x, y)) {
            nodes.push({ x, y });
        }
        attempts++;
    }
}
function drawNode(x, y, radius, label, curr=false){
    ctx.beginPath();

    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    if(startNodeChoosen){
        if(label===startNode){
            ctx.fillStyle = '#ff0000ff';
            ctx.fill()
        }

        else if(curr){
            ctx.fillStyle = '#00ff00ff';
            ctx.fill()
        }else{
            ctx.fillStyle = '#ffffff';
            ctx.fill()
        }
    }
    ctx.stroke();

    ctx.closePath();

    ctx.font = `${radius}px Arial`;

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
}



const makeAdjMatrix = (n) => { 
    
    const matrixDiv = document.getElementById('adjMatrix');
    matrixDiv.innerHTML = ""; // Clear previous content
    canvas.width = canvas.width;
    const table = document.createElement('table');
    for (let i = 0; i <= n; i++) {
        const row = document.createElement('tr');       
        for (let j = 0; j <= n; j++) {
            const cell = document.createElement('td');
            if(i===0 || j===0){

                if((i===0 && j!=0)){
                    cell.classList.add('header-cell');
                }
                
                cell.innerText = (i===0 && j===0) ? "" : (i===0 ? j-1 : i-1);
                cell.style.fontWeight = 'bold';
            }else{
                if(i!==j){
                    cell.classList.add('matrix-cell');
                    cell.classList.add((i-1)+"#"+(j-1));
                }
            }

            

            row.appendChild(cell);
        }           
        table.appendChild(row);
    }
    matrixDiv.appendChild(table);

    generateNonOverlappingNodes(n);
    for (let i = 0; i < n; i++) {
        const randomX = nodes[i].x;

        // Generate Y between radius and (canvas.height - radius)
        const randomY = nodes[i].y;
        drawNode(randomX, randomY, radius, i);
    }
}

var isUnDirected = false;



makeAdjMatrix(5)

var controlsPanel = document.getElementById('controls');
var slider = document.querySelector('input[type="range"]');
var checkbox = document.querySelector('input[type="checkbox"]');
var nLabel=document.querySelector("#controls p")

console.log(slider)


slider.addEventListener('change', function() {


    if(startNodeChoosen) return;
    
    matrix=[]
    var n= parseInt(this.value);
    matrix = Array.from({ length: n }, () => Array(n).fill(0));
    
    nLabel.innerHTML="";
    var value = slider.value;
    nLabel.innerHTML = `Value of n is ${value}`;
    makeAdjMatrix(value);
    addFunctionalityToCells();
});

checkbox.addEventListener('change', function() {
    if(startNodeChoosen) return ;
    isUnDirected = checkbox.checked;
    makeAdjMatrix(slider.value);
    addFunctionalityToCells();
});


const addFunctionalityToCells = () => {

    if(startNodeChoosen) return ;

    startNodeChoosen = false;
    startNode = null;
    var cells = document.getElementsByClassName('matrix-cell');
    Array.from(cells).forEach(cell => {
        cell.addEventListener('click', function() {     
            var cellX = this.classList[1].split('#')[0];
            var cellY = this.classList[1].split('#')[1]; 

            //  (x)------------>(y)


            
            const grayV = grayValue(this);
            console.log(grayV); 
            if(grayV===0) {
                var newGrayV=255;
                drawEdge(parseInt(cellX), parseInt(cellY), 'white')
                matrix[cellX][cellY]=0;
                if(!isUnDirected){
                    drawEdge(parseInt(cellY), parseInt(cellX), 'black')
                }
                if(isUnDirected){

                    var symmetricCell = document.getElementsByClassName(cellY + '#' + cellX)[0];
                    symmetricCell.style.backgroundColor = `rgb(${newGrayV},${newGrayV},${newGrayV})`;
                    matrix[cellY][cellX]=0;
                }
            }
            else{
                const step = 25.5;
                var newGrayV = Math.max(0, grayV - step);
                matrix[cellX][cellY]+=0.2;
                console.log(newGrayV);
                if(newGrayV===229.5){
                    drawEdge(parseInt(cellX), parseInt(cellY), 'black')
                }
                if(isUnDirected){
                    var symmetricCell = document.getElementsByClassName(cellY + '#' + cellX)[0];
                    matrix[cellY][cellX]=((255 - grayV)/255)*2;
                    symmetricCell.style.backgroundColor = `rgb(${newGrayV},${newGrayV},${newGrayV})`;
                }
                
            }
            this.style.backgroundColor = `rgb(${newGrayV},${newGrayV},${newGrayV})`;
            // var op
        })

    });

    var headerCells = document.getElementsByClassName('header-cell');
    Array.from(headerCells).forEach(headerCell => {
        headerCell.addEventListener('click', function() {

            if(!startNodeChoosen){
                startNode = parseInt(this.innerText);
                startNodeChoosen = true;
                NodeX = nodes[startNode].x;
                NodeY = nodes[startNode].y;
                drawNode(NodeX, NodeY, radius, startNode);
                this.style.backgroundColor = '#ff0000ff';
                const tableVisual = document.querySelector('#distancevisual table');
                const row = document.createElement('tr');
                row.innerHTML = `
                <td classname='node'>${startNode}</td>
                <td classname='distance'>0</td>
                <td classname='parent'>-</td>`;
                tableVisual.appendChild(row);
                for(let i=0;i<nodes.length;i++){
                    if(i!==startNode){
                        const row = document.createElement('tr');
                        row.innerHTML = `<td classname='node'>${i}</td>
                        <td classname='distance'>∞</td>
                        <td classname='parent'>-</td>`;
                        tableVisual.appendChild(row);                        
                    }
                }

                checkbox.disabled=true;
                slider.disabled=true;
            }

            Dijikstra(matrix, startNode);

        })
    })    


}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function Dijikstra(matrix, startNode) {
    // Implementation of Dijkstra's algorithm will go here
    console.log("Starting Dijkstra's Algorithm from node:", startNode);
    const n = matrix.length;
    const distances = Array(n).fill(Infinity);
    const visited = Array(n).fill(false);
    const parents = Array(n).fill(null);
    distances[startNode] = 0;

    for (let i = 0; i <= n - 1; i++) {
        const u = minDistance(distances, visited);
        if(u===-1 || distances[u] === Infinity) break; // All reachable nodes processed
        visited[u] = true;
        console.log("Visiting node:", u);
        const NodeCurr = nodes[u];
        drawNode(NodeCurr.x, NodeCurr.y, radius, u, true);

        await sleep(1000); // Pause for visualization
        for (let v = 0; v < n; v++) {
            if(matrix[u][v] > 0 && !visited[v]) {
                const weight = matrix[u][v];
                const newDist = distances[u] + weight;
                if (newDist < distances[v]) {
                    distances[v] = newDist;
                    parents[v] = u;
                    updateTableUI(v, distances[v], u);
                }
            }
        }
        drawNode(NodeCurr.x, NodeCurr.y, radius, u, false);

    
    }
} 

function minDistance(distances, visited) {
    let min = Infinity;
    let minIndex = -1; 

    for (let v = 0; v < distances.length; v++) {
        if (!visited[v] && distances[v] <= min ) {
            min = distances[v];
            minIndex = v;
        }
    }
    return minIndex;
}


function updateTableUI(node, distance, parent) {
    const table = document.querySelector('#distancevisual table');
    const rows = table.getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');

        if (parseInt(cells[0].innerText) === node) {
            cells[1].innerText = distance === Infinity ? '∞' : distance;
            cells[2].innerText = parent === null ? '-' : parent;
            break;
        }
    }
}


addFunctionalityToCells();








