// full screen 
$(document).ready(function () {
    let main = new ProgramBlock();

    // main.addBlock(new IfBlock(new TrueConditional()))
    main.addBlock(new IfBlock(new FalseConditional()))

    //
    main.run();
    main.makeHtml();
});

class Block {
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
        console.log("running program")
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
        return "<div>if  " + this.conditionalBlock.makeHtml() + this.programBlock.run() + "</div>"
    }

    run() {
        console.log("running if")
        if (this.conditionalBlock.run()) {
            this.programBlock.run();
        }
    }
}

// class NoObstacleConditional  {
class TrueConditional extends Block {
    makeHtml() { return "<span>TRUE</span>" }
    run() {
        console.log("running true conditional")
        return true;
    }
}

class FalseConditional extends Block {
    makeHtml() { return "<span>FALSE</span>" }
    run() {
        console.log("running false conditional")
        return false;
    }
}

class MoveForward extends Block {
    makeHtml() { return "<span>FALSE</span>" }
    run() {
        
    }
}