import { BaseEntity } from "./baseEntity";
import { AnimatableEntity } from "./animatableEntity";
import { GameScene } from "./scene";
import { detectCollision, freeFall } from "../physics/physicsEngine";

const GameMode = {
    design: "design",
    play: "play",
    paused: "Paused"
};

Object.freeze(GameMode);
export default class Game {
    constructor(name) {
        this.name = name;
        this.TextureCache = PIXI.utils.TextureCache;
        this.scenes = [];
        this.currentSceneIndex = 0;
        this.mode = GameMode.design;

        //methods
        this.addBackground = this.addBackground.bind(this);
        this.play = this.play.bind(this);
        this.init = this.init.bind(this);
        this.stop = this.stop.bind(this);
        this.update = this.update.bind(this);
    }

    //Initializes a game with a single blank scene
    init(width, height) {
        let gameScene = new GameScene("gameScene", width, height);
        gameScene.mode = this.mode;
        gameScene.visible = true;
        this.scenes.push(gameScene);
    }

    setGameMode(mode) {
        this.mode = GameMode[mode];
        this.scenes[this.currentSceneIndex].mode = this.mode;
    }

    addBackground(texture) {
        if (texture !== null && typeof texture !== "undefined") {
            let background = new BaseEntity(texture);
            this.scenes[this.currentSceneIndex].addChild(background);
        }
    }

    play(delta) {
        this.update(delta);
    }

    stop() {
        //TODO: This method stops the game loop
    }

    update(delta) {
        const children = this.scenes[this.currentSceneIndex].children;
        children.forEach(element => {
            if (element instanceof AnimatableEntity) {
                element.transformX(1);
                freeFall(element, delta);
            }
        });
    }
}