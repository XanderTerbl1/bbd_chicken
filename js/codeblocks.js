let main;
window.addEventListener('load', function () {
    main = new ProgramBlock();

    main.addBlock(new MoveFoward());
    
    let funcDefBlock = new FunctionDefinitionBlock("myFunc");
    funcDefBlock.programBlock.addBlock(new MoveFoward());
    funcDefBlock.programBlock.addBlock(new MoveFoward());
    main.addBlock(funcDefBlock);
    let ifElseBlock = new IfElseBlock(new TrueConditional);
    ifElseBlock.trueProgramBlock.addBlock(new MoveFoward());
    ifElseBlock.falseProgramBlock.addBlock(new MoveFoward());
    main.addBlock(ifElseBlock);
    let funcCallBlock = new FunctionCallBlock("myFunc");
    main.addBlock(funcCallBlock);

    // If Block
    let ifBlock = new IfBlock(new FalseConditional())
    ifBlock.programBlock.addBlock(new MoveFoward())
    main.addBlock(ifBlock);
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
        console.log("searching program: " + this.id)
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

    find(id) {
        console.log("searching if: " + this.id)
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
    constructor(conditionalBlock) {
        super();
        this.conditionalBlock = conditionalBlock;
        this.trueProgramBlock = new ProgramBlock();
        this.falseProgramBlock = new ProgramBlock();
    }

    makeHtml() {
        let html = document.createElement("div");
        html.setAttribute("id", `block-${this.id}`);
        html.setAttribute("class", `block if-else-block`);

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
        console.log("searching if/else: " + this.id)
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


// class WhileBlock extends Block {
//     constructor(conditionalBlock) {
//         super();
//         this.conditionalBlock = conditionalBlock;
//         this.programBlock = new ProgramBlock();
//     }

//     makeHtml() {
//         let html = document.createElement("div");
//         html.setAttribute("id", `block-${this.id}`);
//         html.setAttribute("class", `block while-block`);

//         html.textContent = "WHILE "
//         html.appendChild(this.conditionalBlock.makeHtml())
//         html.appendChild(this.programBlock.makeHtml())
//         return html;
//     }

//     run() {
//         console.log("running  while: " + this.id);
//         while (this.conditionalBlock.run()) {
//             this.programBlock.run();
//         }
//     }
// }



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

    find(id) {
        console.log("searching cond: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}

let funcs = {}
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
        html.textContent = "NEW FUNCTION " + this.funcName
        html.appendChild(this.programBlock.makeHtml())
        return html;
    }
    run() {
        console.log("running  function def: " + this.id)
        funcs[this.funcName] = this.programBlock;//null error check required
    }

    find(id) {
        console.log("searching func def: " + this.id)
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
        html.textContent = "EXECUTE FUNCTION " + this.funcName
        return html;
    }
    run() {
        console.log("running  function call: " + this.id)
        funcs[this.funcName].run();
    }
    find(id) {
        console.log("searching func call: " + this.id)
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
        html.textContent = "FALSE"
        return html;
    }

    run() {
        console.log("running false: " + this.id);
        return false;
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
        player.movePlayer(1);
    }

    find(id) {
        console.log("searching move fwd: " + this.id)
        if (this.id === id) {
            return this;
        }
        return null;
    }
}


function tempAddMoveForward() {
    // main.addBlock(new MoveFoward());
    // updateHtmlView();
    let b = main.find(17);
    console.log(b)
}


