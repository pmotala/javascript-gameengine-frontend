export class GameScene extends PIXI.Container {
    constructor(name, width, height) {
        super();
        this.name = name;
        this.width = width;
        this.height = height;
        this.edgeSnap = true;
        this.vertexSnap = true;
        this.snapDistance = 20;
        this.gravity = 8;

        this.enableVertexSnap = this.enableVertexSnap.bind(this);
        this.disableVertexSnap = this.disableVertexSnap.bind(this);
        this.enableEdgeSnap = this.enableEdgeSnap.bind(this);
        this.disableEdgeSnap = this.disableEdgeSnap.bind(this);
        this.setGravity = this.setGravity.bind(this);
    }

    enableEdgeSnap() {
        this.edgeSnap = true;
    }

    disableEdgeSnap() {
        this.edgeSnap = false;
    }

    enableVertexSnap() {
        this.vertexSnap = true;
    }

    disableVertexSnap() {
        this.vertexSnap = false;
    }

    setGravity(gravity){
        this.gravity = gravity;
    }
};