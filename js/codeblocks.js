let main;
window.addEventListener('load', function () {
    main = new ProgramBlock();
    main.addBlock(new MoveFoward());
    main.addBlock(new MoveFoward());

    // If Block
    let ifBlock = new IfBlock(new TrueConditional())
    ifBlock.programBlock.addBlock(new MoveFoward())
    main.addBlock(ifBlock);    
    updateHtmlView();
})

// Runs the solution recursivley
function runSolution(){
    main.run();
}

// Update HTML content to reflect the current contents of "main"
function updateHtmlView() {    
    document.getElementById("main-program").innerHTML = "";
    document.getElementById("main-program").appendChild(main.makeHtml());
}

// get autoincrementing id  
var getBlockId = (function () {
    var i = 1;
    return function () { return i++; }
})();

class Block {
    constructor() {
        this.id = getBlockId();
    }

    convertToElement(htmlStr) {
        var template = document.createElement('template');
        template.innerHTML = htmlStr;
        return template.content.childNodes;
    }

    // virtual functions               
    // run() {}
    // makeHtml() {}
}

class ProgramBlock extends Block {
    constructor() {
        super();
        this.blocks = []
    }

    run() {
        console.log("running  program: " + this.id);
        this.blocks.forEach(b => {
            b.run();
        });
    }

    makeHtml() {
        let html = document.createElement("div"); 
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block program-block`);
        this.blocks.forEach(b => {
            html.appendChild(b.makeHtml());
        });

        return html;   
    }

    // block-specific methods
    addBlock(block) {
        this.blocks.push(block);
    }
}

class IfBlock extends Block {
    constructor(conditionalBlock) {
        super();
        this.conditionalBlock = conditionalBlock;
        this.programBlock = new ProgramBlock();
    }

    makeHtml() {
        let html = document.createElement("div"); 
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block if-block`);
    
        html.textContent = "IF "
        html.appendChild(this.conditionalBlock.makeHtml())        
        html.appendChild(this.programBlock.makeHtml()) 
        return html;               
    }

    run() {
        console.log("running  if: " + this.id);
        if (this.conditionalBlock.run()) {
            this.programBlock.run();
        }
    }
}

class IfElseBlock extends Block {
    constructor(conditionalBlock) {
        super();
        this.conditionalBlock = conditionalBlock;
        this.trueProgramBlock = new ProgramBlock();
        this.falseProgramBlock = new ProgramBlock();
    }

    makeHtml() {
        return "<div>if  " + this.conditionalBlock.makeHtml() + this.trueProgramBlock.makeHtml() + "else  "  + this.falseProgramBlock.makeHtml() + "</div>"
    }

    run() {
        console.log("running  if else: " + this.id);
        if (this.conditionalBlock.run()) {
            this.trueProgramBlock.run();
        } else {
            this.falseProgramBlock.run();
        }
    }
}


// class NoObstacleConditional  {
class TrueConditional extends Block {
    makeHtml() { 
        let html = document.createElement("span");   
        html.setAttribute("id", `block-${this.id}`); 
        html.setAttribute("class", `block conditional-block`);
        html.textContent = "TRUE"
        return html;
    }

    run() {
        console.log("running  true: " + this.id);
        return true;
    }
}

class MoveFoward extends Block {
    makeHtml() { 
        let html = document.createElement("div");   
        html.setAttribute("id", `block-${this.id}`); 
        html.setAttribute("class", `block move-block`);
        html.textContent = "MOVE FORWARD"
        return html;
    }

    run() {
        console.log("running move forward: " + this.id);
        // TODO
        // Interact with game engine and move player forward
    }
}


// TODO
// Find a block by id.
// Adding a block using an id.
// Remove block by id.


function tempAddMoveForward(){
    main.addBlock(new MoveFoward());
    updateHtmlView();
}


