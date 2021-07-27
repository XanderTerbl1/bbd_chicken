window.addEventListener('load', function () {
    let main = new ProgramBlock();
    main.addBlock(new FunctionDefinition("sco"));
    main.addBlock(new FunctionCall("scdfso"));

    // Running
    main.run();
    main.makeHtml();
})

// IIFE
var getBlockId = (function () {
    var i = 1;
    return function () { return i++;}
})();

class Block {
    constructor() {
        this.id = getBlockId();
    }

    // virtual functions               
    run() { }
    makeHtml() { return "<div>block</div>" }
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
        let html = ""
        this.blocks.forEach(b => {
            html += b.makeHtml();
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
        return "<div>if  " + this.conditionalBlock.makeHtml() + this.programBlock.makeHtml() + "</div>"
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
    makeHtml() { return "<span>TRUE</span>" }
    run() {
        console.log("running  true: " + this.id);
        return true;
    }
}

class FalseConditional extends Block {
    makeHtml() { return "<span>FALSE</span>" }
    run() {
        console.log("running  false: " + this.id);
        return false;
    }
}

class MoveForward extends Block {
    makeHtml() { return "<span>FALSE</span>" }
    run() {
        // call game engine's function to move forward
    }
}

let funcs = {}

class FunctionDefinition extends Block {
    constructor(funcName) {
        super();
        this.funcName = funcName;
        this.programBlock = new ProgramBlock();
    }

    makeHtml() { return "<span>FALSE</span>" }
    run() {
        console.log("running  function def: " + this.id);
        funcs[this.funcName] = this.programBlock;//null error check required
    }
}

class FunctionCall extends Block {
    constructor(funcName) {
        super();
        this.funcName = funcName;
    }

    makeHtml() { return "<span>FALSE</span>" }
    run() {
        console.log("running  function call: " + this.id);
        funcs[this.funcName].run();
    }
}