let main;
window.addEventListener('load', function () {
    main = new ProgramBlock();

    addToProgramBlock(1, new MoveFoward());
    addToProgramBlock(1, new MoveFoward());

    let funcDefBlock = new FunctionDefinitionBlock("myFunc");
    addToProgramBlock(1, funcDefBlock);

    let ifBlock = new IfBlock();
    addToProgramBlock(1, ifBlock);
    updateConditionalBlock(6, new TrueConditional());
    addToProgramBlock(8, new MoveFoward());

    let ifElseBlock = new IfElseBlock();
    addToProgramBlock(1, ifElseBlock);
    updateConditionalBlock(11, new FalseConditional());
    addToProgramBlock(13, new MoveFoward());
    addToProgramBlock(14, new MoveFoward());
    addToProgramBlock(14, new MoveFoward());

    let funcCallBlock = new FunctionCallBlock("myFunc");
    addToProgramBlock(1, funcCallBlock);
    addToProgramBlock(5, new MoveFoward());

    addToProgramBlock(1, new MoveFoward());

    updateHtmlView();
})

// Runs the solution recursivley
function runSolution() {
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

    setParent(parentID) {
        this.parentID = parentID;
    }

    // virtual functions               
    run() { }
    makeHtml() { }
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

    find(id) {
        // console.log("searching program: " + this.id)
        if (this.id === id) {
            return this;
        }
        for (let b of this.blocks) {
            let found = b.find(id);
            if (found !== null) {
                return found;
            }
        }
        return null;
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block program-block`);
        html.setAttribute("parent-id", this.parentID);
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
    constructor() {
        super();
        this.conditionalBlock = new BlankConditionalBlock();
        this.programBlock = new ProgramBlock();
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block if-block`);
        html.setAttribute("parent-id", this.parentID);

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

    find(id) {
        // console.log("searching if: " + this.id)
        if (this.id === id) {
            return this;
        }

        let found = this.conditionalBlock.find(id);
        if (found !== null) {
            return found;
        }
        found = this.programBlock.find(id);
        if (found !== null) {
            return found;
        }

        return null;
    }
}

class IfElseBlock extends Block {
    constructor() {
        super();
        this.conditionalBlock = new BlankConditionalBlock();
        this.trueProgramBlock = new ProgramBlock();
        this.falseProgramBlock = new ProgramBlock();
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block if-else-block`);
        html.setAttribute("parent-id", this.parentID);

        html.textContent = "IF "
        html.appendChild(this.conditionalBlock.makeHtml())
        html.appendChild(this.trueProgramBlock.makeHtml())

        let elseDiv = document.createElement("div");
        elseDiv.textContent = "ELSE "
        html.appendChild(elseDiv);
        html.appendChild(this.falseProgramBlock.makeHtml())
        return html;
    }

    run() {
        console.log("running  if else: " + this.id);
        if (this.conditionalBlock.run()) {
            this.trueProgramBlock.run();
        } else {
            this.falseProgramBlock.run();
        }
    }

    find(id) {
        // console.log("searching if/else: " + this.id)
        if (this.id === id) {
            return this;
        }

        let found = this.conditionalBlock.find(id);
        if (found !== null) {
            return found;
        }
        found = this.trueProgramBlock.find(id);
        if (found !== null) {
            return found;
        }
        found = this.falseProgramBlock.find(id);
        if (found !== null) {
            return found;
        }

        return null;
    }
}

class TrueConditional extends Block {
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block conditional-block`);
        html.setAttribute("parent-id", this.parentID);
        html.textContent = "TRUE"
        return html;
    }

    run() {
        console.log("running  true: " + this.id);
        return true;
    }

    find(id) {
        // console.log("searching cond: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class FalseConditional extends Block {
    makeHtml() { 
        let html = document.createElement("span");   
        html.setAttribute("id", `block-${this.id}`); 
        html.setAttribute("class", `block conditional-block`);
        html.setAttribute("parent-id", this.parentID);
        html.textContent = "FALSE"
        return html;
    }

    run() {
        console.log("running  false: " + this.id);
        return false;
    }

    find(id) {
        // console.log("searching cond: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

let funcs = {};
class FunctionDefinitionBlock extends Block {
    constructor(funcName) {
        super();
        this.funcName = funcName;
        this.programBlock = new ProgramBlock();
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("id", `block-${this.id}`)
        html.setAttribute("class", `block function-def-block`)
        html.setAttribute("parent-id", this.parentID);
        html.textContent = "NEW FUNCTION " + this.funcName
        html.appendChild(this.programBlock.makeHtml())
        return html;
    }
    run() {
        console.log("running  function def: " + this.id)
        funcs[this.funcName] = this.programBlock;//null error check required
    }

    find(id) {
        // console.log("searching func def: " + this.id)
        if (this.id === id) {
            return this;
        }
        let found = this.programBlock.find(id);
        if (found !== null) {
            return found;
        }
        return null;
    }
}

class FunctionCallBlock extends Block {
    constructor(funcName) {
        super();
        this.funcName = funcName;
    }

    makeHtml() {
        let html = document.createElement("div")
        html.setAttribute("id", `block-${this.id}`)
        html.setAttribute("class", `block function-call-block`)
        html.setAttribute("parent-id", this.parentID);
        html.textContent = "EXECUTE FUNCTION " + this.funcName
        return html;
    }
    run() {
        console.log("running  function call: " + this.id)
        funcs[this.funcName].run();
    }
    find(id) {
        // console.log("searching func call: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class MoveFoward extends Block {
    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block move-block`);
        html.setAttribute("parent-id", this.parentID);
        html.textContent = "MOVE FORWARD"
        return html;
    }

    run() {
        console.log("running move forward: " + this.id);
        player.movePlayer(1);
    }

    find(id) {
        // console.log("searching move fwd: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class BlankConditionalBlock extends Block {
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block blank-block`);
        html.textContent = "...";
        return html;
    }

    run() {
        console.log("running blank: " + this.id);
    }

    find(id) {
        // console.log("searching blank: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

function blockIsProgramBlock(block) {
    return block instanceof ProgramBlock;
}

function blockIsConditional(block) {
    return block instanceof TrueConditional || block instanceof FalseConditional || block instanceof BlankConditionalBlock;
}

function blockAcceptsConditional(block) {
    return block instanceof IfBlock || block instanceof IfElseBlock;
}

function addToProgramBlock(id, block) {
    if (blockIsConditional(block) || blockIsProgramBlock(block)) {
        console.log("Second parameter of method 'addToProgramBlock' must be an ID of a non-conditional, non-program block type.")
        return 0;
    }
    let parent = main.find(id);
    if (!blockIsProgramBlock(parent)) {
        console.log("First parameter of method 'addToProgramBlock' must be an ID of a program block type.")
        return 0;
    }
    block.setParent(id);
    parent.addBlock(block);
    updateHtmlView();
    return 1;
}

function updateConditionalBlock(id, block) {
    if (!blockIsConditional(block)) {
        console.log("Second parameter of method 'updateConditionalBlock' must be a conditional block type.")
        return 0;
    }
    let parent = main.find(id);
    if (!blockAcceptsConditional(parent)) {
        console.log("First parameter of method 'updateConditionalBlock' must be an ID of an if or if/else block type.")
        return 0;
    }
    parent.conditionalBlock = block;
    updateHtmlView();
    return 1;
}

function removeFromProgBlock(id) {
    let block = main.find(id);
    if (blockIsConditional(block) || blockIsProgramBlock(block)) {
        console.log("First parameter of method 'removeFromProgBlock' must be an ID of a non-conditional, non-program block type.")
        return 0;
    }
    let parent = main.find(parseInt(block.makeHtml().getAttribute("parent-id")));
    if (!blockIsProgramBlock(parent)) {
        console.log("Logic error from method 'removeFromProgBlock' - block parent ID not initialized correctly.")
        return 0;
    }
    parent.blocks.splice(parent.blocks.indexOf(block), 1);
    updateHtmlView();
    return 1;
}


function tempAddMoveForward(){
    addToProgramBlock(1, new MoveFoward());
    updateHtmlView();
}

