const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

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

    resizeCanvas();
    makeAdjMatrix(slider.value);
    addFunctionalityToCells();    

});

const nodes = [];
const radius = 20;
const padding = 3; // Extra space so they don't even get close

function drawEdge(nodeA, nodeB){
    const startNode = nodes[nodeA];
    const endNode = nodes[nodeB];

    if(!startNode || !endNode) return;

    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);
    ctx.lineTo(endNode.x, endNode.y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
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
function drawNode(x, y, radius, label){
    ctx.beginPath();

    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
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
    nLabel.innerHTML="";
    var value = slider.value;
    nLabel.innerHTML = `Value of n is ${value}`;
    makeAdjMatrix(value);
    addFunctionalityToCells();
});

checkbox.addEventListener('change', function() {
    isUnDirected = checkbox.checked;
    makeAdjMatrix(slider.value);
    addFunctionalityToCells();
});


const addFunctionalityToCells = () => {


    var cells = document.getElementsByClassName('matrix-cell');
    Array.from(cells).forEach(cell => {
        cell.addEventListener('click', function() {     
            var cellX = this.classList[1].split('#')[0];
            var cellY = this.classList[1].split('#')[1]; 
            if (this.style.backgroundColor === 'white' || this.style.backgroundColor === '' ) {
                cell.classList.add('filled');
                drawEdge(parseInt(cellX), parseInt(cellY))
                if(isUnDirected){
                    var symmetricCell = document.getElementsByClassName(cellY + '#' + cellX)[0];
                    symmetricCell.classList.add('filled');
                }
            } else {
                cell.classList.remove('filled');
                if(isUnDirected){
                    var symmetricCell = document.getElementsByClassName(cellY + '#' + cellX)[0];
                    symmetricCell.classList.remove('filled');
                }
            }
        })

    });

}

addFunctionalityToCells();






