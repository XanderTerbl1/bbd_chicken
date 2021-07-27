window.addEventListener('load', function () {
    let main = new ProgramBlock();
    main.addBlock(new IfBlock(new FalseConditional()))

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
