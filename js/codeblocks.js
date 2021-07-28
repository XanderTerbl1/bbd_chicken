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
window.addEventListener('load', function () {
    main = new ProgramBlock();
    main.setParent(-1);

    // addToProgramBlock(1, new MoveBlock(input.MOVE_FORWARD));
    // addToProgramBlock(2, new MoveBlock(input.MOVE_LEFT));

    // let ifBlock = new IfBlock();
    // addToProgramBlock(3, ifBlock);
    // updateConditionalBlock(5, new TrueConditional());
    // addToProgramBlock(6, new MoveBlock(input.MOVE_BACKWARD));

    // addToProgramBlock(4, new MoveBlock(input.MOVE_RIGHT));
    // addToProgramBlock(10, new MoveBlock(input.MOVE_FORWARD));

    updateHtmlView();
})

// Runs the solution recursivley
function runSolution() {
    control(input.START_GAME);
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

// Drag helpers
function allowDrop(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
    let data = JSON.parse(event.dataTransfer.getData("data"));

    // dragged from Toolbox to a Solution Block
    if (data.from == "toolbox" && event.target.hasAttribute("data-block-id")) {
        dragToolboxToSolution(data.type, event.target.getAttribute("data-block-id"))
    }

    // add other source-destination pairs
}

class Block {
    constructor() {
        this.id = getBlockId();
    }

    setParent(parentID) {
        this.parentID = parentID;
    }

    // virtual functions               
    run() { }
    makeHtml() { }
}

class ProgramBlock extends Block {
    constructor(left = true) {
        super();
        this.blocks = []
        this.left = left;
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
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block program-block`);
        html.setAttribute("parent-id", this.parentID);
        this.blocks.forEach(b => {
            html.appendChild(b.makeHtml());
        });

        // Add drag listeners
        html.addEventListener("dragover", allowDrop);
        html.addEventListener("drop", onDrop);
        return html;
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
        html.setAttribute("data-block-id", this.id);
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

// class IfElseBlock extends Block {
//     constructor() {
//         super();
//         this.conditionalBlock = new BlankConditionalBlock(this.id);
//         this.trueProgramBlock = new BlankProgramBlock(this.id);
//         this.falseProgramBlock = new BlankProgramBlock(this.id, false);
//     }

//     makeHtml() {
//         let html = document.createElement("div");
//                 html.setAttribute("data-block-id", this.id);;
//         html.setAttribute("class", `block if-else-block`);
//         html.setAttribute("parent-id", this.parentID);

//         html.textContent = "IF "
//         html.appendChild(this.conditionalBlock.makeHtml())
//         html.appendChild(this.trueProgramBlock.makeHtml())

//         let elseDiv = document.createElement("div");
//         elseDiv.textContent = "ELSE "
//         html.appendChild(elseDiv);
//         html.appendChild(this.falseProgramBlock.makeHtml())
//         return html;
//     }

//     run() {
//         console.log("running  if else: " + this.id);
//         if (this.conditionalBlock.run()) {
//             this.trueProgramBlock.run();
//         } else {
//             this.falseProgramBlock.run();
//         }
//     }

//     find(id) {
//         // console.log("searching if/else: " + this.id)
//         if (this.id === id) {
//             return this;
//         }

//         let found = this.conditionalBlock.find(id);
//         if (found !== null) {
//             return found;
//         }
//         found = this.trueProgramBlock.find(id);
//         if (found !== null) {
//             return found;
//         }
//         found = this.falseProgramBlock.find(id);
//         if (found !== null) {
//             return found;
//         }

//         return null;
//     }
// }

class TrueConditional extends Block {
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("data-block-id", this.id);
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
        html.setAttribute("data-block-id", this.id);
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

class BlankConditionalBlock extends Block {
    constructor(parentID) {
        super();
        this.parentID = parentID;
    }
    makeHtml() {
        let html = document.createElement("span");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block blank-block`);
        html.textContent = "...";
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
    constructor(parentID, left = true) {
        super();
        this.parentID = parentID;
        this.left = left;
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

let funcs = {};
class FunctionDefinitionBlock extends Block {
    constructor(funcName) {
        super();
        this.funcName = funcName;
        this.programBlock = new ProgramBlock();
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("data-block-id", this.id);
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
        html.setAttribute("data-block-id", this.id);
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

class MoveBlock extends Block {
    constructor(direction) {
        super();
        this.direction = direction;
    }
    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("data-block-id", this.id);
        html.setAttribute("class", `block move-block`);
        html.setAttribute("parent-id", this.parentID);
        switch (this.direction) {
            case input.MOVE_LEFT:
                html.textContent = "MOVE LEFT";
                break;
            case input.MOVE_RIGHT:
                html.textContent = "MOVE RIGHT";
                break;
            case input.MOVE_BACKWARD:
                html.textContent = "MOVE BACKWARD";
                break;
            default:
                html.textContent = "MOVE FORWARD";
                break;
        }

        return html;
    }

    run() {
        switch (this.direction) {
            case input.MOVE_LEFT:
                console.log("running move left: " + this.id);
                control(input.MOVE_LEFT);
                break;
            case input.MOVE_RIGHT:
                console.log("running move right: " + this.id);
                control(input.MOVE_RIGHT);
                break;
            case input.MOVE_BACKWARD:
                console.log("running move backward: " + this.id);
                control(input.MOVE_BACKWARD);
                break;
            default:
                console.log("running move forward: " + this.id);
                control(input.MOVE_FORWARD);
                break;
        }
    }

    find(id) {
        // console.log("searching move fwd: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

// class MoveBackward extends Block {
//     makeHtml() {
//         let html = document.createElement("div");
//                 html.setAttribute("data-block-id", this.id);;
//         html.setAttribute("class", `block move-block`);
//         html.setAttribute("parent-id", this.parentID);
//         html.textContent = "MOVE BACKWARD"
//         return html;
//     }

//     run() {
//         console.log("running move backward: " + this.id);
//         control(input.MOVE_BACKWARD);
//     }

//     find(id) {
//         // console.log("searching move backward: " + this.id)
//         if (this.id === id) {
//             return this;
//         }
//         return null;
//     }
// }

// class MoveLeft extends Block {
//     makeHtml() {
//         let html = document.createElement("div");
//                 html.setAttribute("data-block-id", this.id);;
//         html.setAttribute("class", `block move-block`);
//         html.setAttribute("parent-id", this.parentID);
//         html.textContent = "MOVE LEFT"
//         return html;
//     }

//     run() {
//         console.log("running move left: " + this.id);
//         control(input.MOVE_LEFT);
//     }

//     find(id) {
//         // console.log("searching move left: " + this.id)
//         if (this.id === id) {
//             return this;
//         }
//         return null;
//     }
// }

// class MoveRight extends Block {
//     makeHtml() {
//         let html = document.createElement("div");
//                 html.setAttribute("data-block-id", this.id);;
//         html.setAttribute("class", `block move-block`);
//         html.setAttribute("parent-id", this.parentID);
//         html.textContent = "MOVE RIGHT"
//         return html;
//     }

//     run() {
//         console.log("running move right: " + this.id);
//         control(input.MOVE_RIGHT);
//     }

//     find(id) {
//         // console.log("searching move right: " + this.id)
//         if (this.id === id) {
//             return this;
//         }
//         return null;
//     }
// }

function blockIsProgramBlock(block) {
    return block instanceof ProgramBlock;
}

function blockIsConditional(block) {
    return block instanceof TrueConditional || block instanceof FalseConditional || block instanceof BlankConditionalBlock;
}

function blockAcceptsConditional(block) {
    // return block instanceof IfBlock || block instanceof IfElseBlock;
    return block instanceof IfBlock;
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
        block.setParent(1);
        main.blocks.unshift(block);
        updateHtmlView();
        return 1;
    }
    let parent = main.find(prevBlock.parentID);
    if (prevBlock instanceof BlankProgramBlock) {
        parent.programBlock = new ProgramBlock();
        parent.programBlock.setParent(prevBlock.parentID);
        parent.programBlock.addBlock(block);
    } else {
        let pos = parent.blocks.indexOf(prevBlock);
        block.setParent(prevBlock.parentID);
        parent.blocks.splice(pos+1, 0, block);
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
    let progBlock = main.find(parseInt(block.makeHtml().getAttribute("parent-id")));
    if (!blockIsProgramBlock(progBlock)) {
        console.log(progBlock)
        console.log("Logic error from method 'removeFromProgBlock' - block parent ID not initialized correctly.")
        return 0;
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
    IF_BLOCK: IfBlock,
}

function populateToolbox() {
    // Add all available block-templates to the toolbox
    let toolbox = document.getElementById("toolbox");
    toolbox.innerHTML = "";
    for (const key in toolbox_tools) {
        let tool = document.createElement("div");
        tool.setAttribute("data-block-type", key);
        tool.setAttribute("class", `toolbox-block`);
        tool.setAttribute("draggable", 'true');
        tool.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("data", JSON.stringify({ "from": "toolbox", "type": key }));
        });
        tool.textContent = key;
        toolbox.appendChild(tool);
    }
    toolbox.addEventListener("dragover", allowDrop);
    toolbox.addEventListener("drop", onDrop);
}
populateToolbox();



// All drag functions parameters are (DRAGGED_OBJECTED, DROPPED_ON_OBJECT) 

// they dragged an toolbox object to the solution
function dragToolboxToSolution(toolbox_type, solution_dest_id) {
    console.log(`Attempting to add new ${toolbox_type} to block id ${solution_dest_id}`)
    block = new toolbox_tools[toolbox_type]();
    addToProgramBlock(solution_dest_id, block);
}

function dragSolutionToToolbox(toolbox_obj, solution_dest) {
}

function dragSolutionToSolution(solution_obj, solution_dest) {
    // remove from soluto
}

// TODO
// Add drop on toolbox -> drops are remove/
// Update all IDs to data-block-id's [done]
// make everything draggable that requires it
// Add allowDrop and ondrop where needed (program block and ?)