// Game Controls
const input = {
    START_GAME: 0,
    MOVE_FORWARD: 3,
    MOVE_BACKWARD: 4,
    MOVE_LEFT: 2,
    MOVE_RIGHT: 1,
}

function control(input) {
    // do pre-control stuff...
    // call the game controller
    handleKeysBlock(input);
}

let main;
let solution_div;
window.addEventListener('load', function () {
    // Initialisations
    main = new ProgramBlock();

    solution_div = document.getElementById("main-program");
    solution_div.addEventListener("dragover", allowDrop);
    solution_div.addEventListener("drop", onDrop);

    // Generate basic program
    main.setParent(-1);
    addToProgramBlock(1, new MoveForward());
    addToProgramBlock(2, new MoveForward());
    updateHtmlView();

    // control(input.START_GAME);
})

// Runs the solution recursivley
function runSolution() {
    main.run();
}

function resetSolution() {
    main = new ProgramBlock();
    main.setParent(-1);
    addToProgramBlock(main.id, new BlankProgramBlock(main.id));
    updateHtmlView();
}

// Update HTML content to reflect the current contents of "main"
function updateHtmlView() {
    solution_div.innerHTML = "";
    solution_div.appendChild(main.makeHtml());
}

// get autoincrementing id  
var getBlockId = (function () {
    var i = 1;
    return function () { return i++; }
})();

// Drag helpers
function allowDrop(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
    let data = JSON.parse(event.dataTransfer.getData("data"));
    console.log(`${data.id} dropped from ${data.from}`)

    if (data.from == "toolbox" && event.target.hasAttribute("data-block-id")) {
        console.log("adding from toolbox to solution")
        dragToolboxToSolution(data.id, event.target.getAttribute("data-block-id"))
    }

    // dragged from solution to toolbox
    let toolbox_drop = event.target.hasAttribute("data-block-type") || (event.target.id == "toolbox")
    if (data.from == "solution" && toolbox_drop) {
        console.log("removing solution block (dropped in toolbox)")
        dragSolutionToToolbox(data.id);
    }

    // add other source-destination pairs
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Block {
    constructor() {
        this.id = getBlockId();
    }

    setParent(parentID) {
        this.parentID = parentID;
    }

    addCommonHtml(element) {
        element.setAttribute("data-block-id", this.id);
        return element;
    }

    // virtual functions               
    async run() { 
        await sleep(400);        
    }
    makeHtml() { }
}


class ProgramBlock extends Block {
    constructor() {
        super();
        this.blocks = []
    }

    async run() {
        await super.run();
        console.log("running  program: " + this.id);
        for (let i = 0; i < this.blocks.length; i++) {
            await this.blocks[i].run();
        }
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
        html.setAttribute("class", `block program-block`);
        this.blocks.forEach(b => {
            html.appendChild(b.makeHtml());
        });
        return this.addCommonHtml(html);
    }

    // block-specific methods
    addBlock(block) {
        block.setParent(this.id);
        this.blocks.push(block);
    }
}

class IfBlock extends Block {
    constructor() {
        super();
        this.conditionalBlock = new BlankConditionalBlock(this.id);
        this.programBlock = new BlankProgramBlock(this.id);
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("class", `block if-block`);
        html.textContent = "IF "
        html.appendChild(this.conditionalBlock.makeHtml())
        html.appendChild(this.programBlock.makeHtml())
        html.setAttribute("draggable", 'true');
        let blockId = this.id;
        html.addEventListener("dragstart", function (event) {
            startDrag(event, "solution", blockId)
        });
        return this.addCommonHtml(html);
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
        this.conditionalBlock = new BlankConditionalBlock(this.id);
        this.programBlocks = [new BlankProgramBlock(this.id), new BlankProgramBlock(this.id)];
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("data-block-id", this.id);;
        html.setAttribute("class", `block if-else-block`);
        html.textContent = "IF "
        html.appendChild(this.conditionalBlock.makeHtml())
        html.appendChild(this.programBlocks[0].makeHtml())
        let elseDiv = document.createElement("div");
        elseDiv.textContent = "ELSE "
        html.appendChild(elseDiv);
        html.appendChild(this.programBlocks[1].makeHtml())
        html.setAttribute("draggable", 'true');
        let blockId = this.id;
        html.addEventListener("dragstart", function (event) {
            startDrag(event, "solution", blockId)
        });
        return this.addCommonHtml(html);
    }

    run() {
        console.log("running  if else: " + this.id);
        if (this.conditionalBlock.run()) {
            this.programBlocks[0].run();
        } else {
            this.programBlocks[1].run();
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
        found = this.programBlocks[0].find(id);
        if (found !== null) {
            return found;
        }
        found = this.programBlocks[1].find(id);
        if (found !== null) {
            return found;
        }

        return null;
    }
}

class WhileBlock extends Block {
    constructor() {
        super();
        this.conditionalBlock = new BlankConditionalBlock(this.id);
        this.programBlock = new BlankProgramBlock(this.id);
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("class", `block if-block`);
        html.textContent = "WHILE  "
        html.appendChild(this.conditionalBlock.makeHtml())
        html.appendChild(this.programBlock.makeHtml())
        html.setAttribute("draggable", 'true');
        let blockId = this.id;
        html.addEventListener("dragstart", function (event) {
            startDrag(event, "solution", blockId)
        });
        return this.addCommonHtml(html);
    }

    async run() {
        console.log("running  while: " + this.id);
        while (this.conditionalBlock.run()) {
            await this.programBlock.run();
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

class TrueConditional extends Block {
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("class", `block conditional-block`);
        html.textContent = "TRUE"
        return this.addCommonHtml(html);
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
        html.setAttribute("class", `block conditional-block`);
        html.textContent = "FALSE"
        return this.addCommonHtml(html);
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

class ClosestFrontBlock extends Block {
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block conditional-block`);
        html.textContent = "CLOSEST CAR IS AHEAD";
        return html;
    }

    run() {
        console.log("running closest in front conditional: " + this.id);
        return findClosestDirec() === input.MOVE_FORWARD;
    }

    find(id) {
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class ClosestBackBlock extends Block {
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block conditional-block`);
        html.textContent = "CLOSEST CAR IS BEHIND";
        return html;
    }

    run() {
        console.log("running closest behind conditional: " + this.id);
        return findClosestDirec() === input.MOVE_BACKWARD;
    }

    find(id) {
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class ClosestLeftBlock extends Block {
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block conditional-block`);
        html.textContent = "CLOSEST CAR IS LEFT";
        return html;
    }

    run() {
        console.log("running closest left conditional: " + this.id);
        return findClosestDirec() === input.MOVE_LEFT;
    }

    find(id) {
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class ClosestRightBlock extends Block {
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block conditional-block`);
        html.textContent = "CLOSEST CAR RIGHT";
        return html;
    }

    run() {
        console.log("running closest right conditional: " + this.id);
        return findClosestDirec() === input.MOVE_RIGHT;
    }

    find(id) {
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class BlankConditionalBlock extends Block {
    constructor(parentID) {
        super();
        this.parentID = parentID;
    }
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block blank-block`);
        html.textContent = "< .... >";
        return html;
    }

    run() {
        console.log("running blank conditional: " + this.id);
    }

    find(id) {
        // console.log("searching blank: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class BlankProgramBlock extends Block {
    constructor(parentID) {
        super();
        this.parentID = parentID;
    }
    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block blank-block`);
        html.textContent = "...";
        return html;
    }

    run() {
        console.log("running blank program: " + this.id);
    }

    find(id) {
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

// let funcs = {};
// class FunctionDefinitionBlock extends Block {
//     constructor(funcName) {
//         super();
//         this.funcName = funcName;
//         this.programBlock = new ProgramBlock();
//     }

//     makeHtml() {
//         let html = document.createElement("div");
//         html.setAttribute("data-block-id", this.id);
//         html.setAttribute("class", `block function-def-block`)
//         html.textContent = "NEW FUNCTION " + this.funcName
//         html.appendChild(this.programBlock.makeHtml())
//         return html;
//     }
//     run() {
//         console.log("running  function def: " + this.id)
//         funcs[this.funcName] = this.programBlock;//null error check required
//     }

//     find(id) {
//         // console.log("searching func def: " + this.id)
//         if (this.id === id) {
//             return this;
//         }
//         let found = this.programBlock.find(id);
//         if (found !== null) {
//             return found;
//         }
//         return null;
//     }
// }

// class FunctionCallBlock extends Block {
//     constructor(funcName) {
//         super();
//         this.funcName = funcName;
//     }

//     makeHtml() {
//         let html = document.createElement("div")
//         html.setAttribute("data-block-id", this.id);
//         html.setAttribute("class", `block function-call-block`)
//         html.textContent = "EXECUTE FUNCTION " + this.funcName
//         return html;
//     }
//     run() {
//         console.log("running  function call: " + this.id)
//         funcs[this.funcName].run();
//     }
//     find(id) {
//         // console.log("searching func call: " + this.id)
//         if (this.id === id) {
//             return this;
//         }
//         return null;
//     }
// }


class MoveForward extends Block {
    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block move-block`);
        html.textContent = "MOVE FORWARD";
        html.setAttribute("draggable", 'true');
        let blockId = this.id;
        html.addEventListener("dragstart", function (event) {
            startDrag(event, "solution", blockId)
        });
        return html;
    }


    async run() {
        await super.run();
        control(input.MOVE_FORWARD);
    }

    find(id) {
        // console.log("searching move fwd: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}


class MoveBackward extends Block {
    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block move-block`);
        html.textContent = "MOVE BACKWARD";
        html.setAttribute("draggable", 'true');
        let blockId = this.id;
        html.addEventListener("dragstart", function (event) {
            startDrag(event, "solution", blockId)
        });
        return html;
    }

    run() {
        console.log("running move backward: " + this.id);
        control(input.MOVE_BACKWARD);
    }

    find(id) {
        // console.log("searching move backward: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class MoveLeft extends Block {
    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block move-block`);
        html.textContent = "MOVE LEFT";
        html.setAttribute("draggable", 'true');
        let blockId = this.id;
        html.addEventListener("dragstart", function (event) {
            startDrag(event, "solution", blockId)
        });
        return html;
    }

    run() {
        console.log("running move left: " + this.id);
        control(input.MOVE_LEFT);
    }

    find(id) {
        // console.log("searching move left: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

class MoveRight extends Block {
    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block move-block`);
        html.textContent = "MOVE RIGHT";
        html.setAttribute("draggable", 'true');
        let blockId = this.id;
        html.addEventListener("dragstart", function (event) {
            startDrag(event, "solution", blockId)
        });
        return html;
    }

    run() {
        console.log("running move right: " + this.id);
        control(input.MOVE_RIGHT);
    }

    find(id) {
        // console.log("searching move right: " + this.id)
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
    return block instanceof TrueConditional || block instanceof FalseConditional || 
    block instanceof BlankConditionalBlock || block instanceof ClosestFrontBlock ||
    block instanceof ClosestBackBlock || block instanceof ClosestLeftBlock ||
    block instanceof ClosestRightBlock;
}

function blockAcceptsConditional(block) {
    return block instanceof IfBlock || block instanceof IfElseBlock || block instanceof WhileBlock;
}

function addToProgramBlock(id, block) {
    if (blockIsConditional(block) || blockIsProgramBlock(block)) {
        console.log("Second parameter of method 'addToProgramBlock' must be an ID of a non-conditional, non-program block type.")
        return 0;
    }
    let prevBlock = main.find(id);
    if (blockIsConditional(prevBlock)) {
        console.log("First parameter of method 'addToProgramBlock' must be an ID of a non-conditional block type.")
        return 0;
    }
    if (prevBlock.parentID === -1) {//adding on line 1
        block.setParent(main.id);
        main.blocks.unshift(block);
        updateHtmlView();
        return 1;
    }
    let parent = main.find(prevBlock.parentID);
    if (prevBlock instanceof BlankProgramBlock) {
        if (parent.parentID === -1) {//restarting after solutions reset
            parent.blocks.pop();
            parent.addBlock(block);
        } else if (parent instanceof IfElseBlock) {
            let pos = parent.programBlocks.indexOf(prevBlock);
            parent.programBlocks[pos] = new ProgramBlock();
            parent.programBlocks[pos].setParent(prevBlock.parentID);
            parent.programBlocks[pos].addBlock(block);
        } else {
            parent.programBlock = new ProgramBlock();
            parent.programBlock.setParent(prevBlock.parentID);
            parent.programBlock.addBlock(block);
        }
    } else {
        let pos = parent.blocks.indexOf(prevBlock);
        block.setParent(prevBlock.parentID);
        parent.blocks.splice(pos + 1, 0, block);
    }
    updateHtmlView();
    return 1;
}

function updateConditionalBlock(id, block) {
    if (!blockIsConditional(block)) {
        console.log("Second parameter of method 'updateConditionalBlock' must be a conditional block type.")
        return 0;
    }
    let prevConditional = main.find(id);
    let parent = main.find(prevConditional.parentID);
    if (!blockAcceptsConditional(parent)) {
        console.log("First parameter of method 'updateConditionalBlock' must be an ID of an if or if/else block type.")
        return 0;
    }
    block.setParent(prevConditional.parentID);
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
    let progBlock = main.find(block.parentID);
    if (!blockIsProgramBlock(progBlock)) {
        console.log("Logic error from method 'removeFromProgBlock' - block parent ID not initialized correctly.")
        return 0;
    }
    if (main.blocks.length === 1) {//remove only block
        resetSolution();
        return 1;
    }
    if (progBlock.blocks.length === 1) {
        let parent = main.find(progBlock.parentID);
        parent.programBlock = new BlankProgramBlock(progBlock.parentID);
    } else {
        progBlock.blocks.splice(progBlock.blocks.indexOf(block), 1);
    }
    updateHtmlView();
    return 1;
}


function tempAddMoveForward() {
    main.addBlock(new MoveBlock(input.MOVE_FORWARD));
    updateHtmlView();

}

// All code-blocks the user has access to
const toolbox_tools = {
    "IF_BLOCK": IfBlock,
    "IF_ELSE_BLOCK": IfElseBlock,
    "WHILE": WhileBlock,
    "TRUE": TrueConditional,
    "FALSE": FalseConditional,
    "CLOSEST_FRONT": ClosestFrontBlock,
    "CLOSEST_BACK": ClosestBackBlock,
    "CLOSEST_LEFT": ClosestLeftBlock,
    "CLOSEST_RIGHT": ClosestRightBlock,
    "MOVE_FORWARD": MoveForward,
    "MOVE_BACKWARD": MoveBackward,
    "MOVE_LEFT": MoveLeft,
    "MOVE_RIGHT": MoveRight,
}

function startDrag(event, from, id) {
    event.dataTransfer.setData("data", JSON.stringify({ "from": from, "id": id }));
}

function populateToolbox() {
    // Add all available block-templates to the toolbox
    let toolbox = document.getElementById("toolbox");
    toolbox.innerHTML = "";
    for (const key in toolbox_tools) {
        let tool = document.createElement("span");
        tool.setAttribute("data-block-type", key);
        tool.setAttribute("class", `toolbox-block tb-${key}`);
        tool.setAttribute("draggable", 'true');
        tool.addEventListener("dragstart", function (event) {
            startDrag(event, "toolbox", key)
        });
        tool.textContent = key;
        toolbox.appendChild(tool);
    }

    toolbox.addEventListener("dragover", allowDrop);
    toolbox.addEventListener("drop", onDrop);
}
populateToolbox();

// dragged an toolbox object to the solution
function dragToolboxToSolution(toolbox_type, solution_dest_id) {
    console.log(`Attempting to add new ${toolbox_type} to block id ${solution_dest_id}`)
    let block = new toolbox_tools[toolbox_type]();

    if (["TRUE", "FALSE", "CLOSEST_FRONT", "CLOSEST_BACK", "CLOSEST_LEFT", "CLOSEST_RIGHT"].includes(toolbox_type)) {
        updateConditionalBlock(parseInt(solution_dest_id), block);
    } else {
        addToProgramBlock(parseInt(solution_dest_id), block);
    }
}

// solution to toolbox (i.e. remove)
function dragSolutionToToolbox(solution_block_id) {
    removeFromProgBlock(solution_block_id);
}

function dragSolutionToSolution(solution_obj, solution_dest) {
    // remove from soluto
}

