"use strict";

import { AnimatableEntity } from "./animatableEntity";
import { BaseEntity } from "./baseEntity";
import Game from "./game";
import EventType from "/public/scripts/common/constants/eventType.js";
import workspaceNavigation from "/public/scripts/workspaceNav.js";
import CardBuilder from "/public/scripts/view-components/cards/cardBuilder.js";
import { Card, Button, PresetColours, PresetFontSize } from "/public/scripts/view-components/cards/card.js";
import Form from "/public/scripts/common/utility/forms/form.js";
import { EventTypeAndHandler } from "/public/scripts/common/utility/events/events.js";

const EngineModes = {
    designing: "Designing",
    playing: "Playing",
    paused: "Paused",
};

Object.freeze(EngineModes);
export class CoreEngine {
    constructor() {
        //Instance variables
        this.loader = new PIXI.Loader();
        this.stage = new PIXI.Container();
        this.currentGameIndex = 0;
        this.games = [];
        this._entityContainerId = "entities";
        this._entities = document.getElementById(this._entityContainerId);

        this._posForm = document.getElementById("positionForm");
        this._rotForm = new Form("rotationForm");

        this._posForm.onsubmit = (ev) => {
            const values = Array.from(document.querySelectorAll("#positionForm input")).reduce(
                (acc, input) => ({ ...acc, [input.id]: input.value }),
                {}
            );
        };

        this.currentMode = EngineModes.designing;

        //methods
        this.init = this.init.bind(this);
        this.loadTexturesFromLocal = this.loadTexturesFromLocal.bind(this);
        this.loadTextureToWorkspace = this.loadTextureToWorkspace.bind(this);
        this.bulkUploadTexturesToWorkspace = this.bulkUploadTexturesToWorkspace.bind(this);
        this.createGame = this.createGame.bind(this);
        this.loadDefaultAssets = this.loadDefaultAssets.bind(this);
        this.createGameEntity = this.createGameEntity.bind(this);
        this.render = this.render.bind(this);
        this.playGame = this.playGame.bind(this);
        this.stopGame = this.stopGame.bind(this);
    }

    init() {
        const renderer = PIXI.autoDetectRenderer({
            antalias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
            width: 1000,
            height: 700,
        });
        this.renderer = renderer;

        const engineView = document.getElementById("engine-view");
        engineView.appendChild(renderer.view);

        const playBtn = document.querySelector("#play-button");
        playBtn.addEventListener("click", this.playGame, false);

        const stopBtn = document.querySelector("#stop-button");
        stopBtn.addEventListener("click", this.stopGame, false);

        //Pre-load default assets here (Assets that come with the engine)
        this.loader.baseUrl = "/public/assets/";

        this.loadDefaultAssets();
        this.createGame("Test Game");

        this.games[this.currentGameIndex].scenes.forEach((scene) => {
            this.stage.addChild(scene);
        });

        PIXI.Ticker.shared.add(this.render);
    }

    render(delta) {
        this.renderer.clear();
        if (this.games[this.currentGameIndex].mode === "play") {
            this.games[this.currentGameIndex].play(delta);
        }
        this.renderer.render(this.stage);
    }

    loadDefaultAssets() {
        this.loader
            .add("blueTile", "images/blueTile.png")
            .add("brownTile", "images/brownTile.png")
            .add("blackTile", "images/blackTile.png")
            .add("greenTile", "images/greenTile.png")
            .add("yellowTile", "images/yellowTile.png")
            .add("redTile", "images/redTile.png")
            .add("whiteTile", "images/whiteTile.png")
            .add("orangeTile", "images/orangeTile.png")
            .add("background", "images/background.jpg");

        this.loader.onComplete.add(this.bulkUploadTexturesToWorkspace);
        this.loader.load();
    }

    bulkUploadTexturesToWorkspace(loader, resources) {
        for(var property in resources){
            let resource = resources[property];
            let name = resource.name;
            let url = resource.url;
            this.loadTextureToWorkspace(name, url);
        }
    }

    loadTextureToWorkspace(name, path) {
        const builder = new CardBuilder();

        const card = new Card();
        card.title = name;
        card.image = path;
        card.colour = PresetColours.Light;

        var buttons = new Array();

        const button = new Button();
        button.title = "Add";
        button.id = name;
        button.colour = PresetColours.Primary;
        button.fontSize = PresetFontSize.Smaller;
        button.action = (ev) => {
            ev.preventDefault();
            const create = ev.target.id;

            console.log(create);
            this.createGameEntity(PIXI.utils.TextureCache[create]);
        };
        buttons.push(button);

        card.buttons = buttons;

        let cardWrapper = builder.createInlineCard(card);
        this._entities.appendChild(cardWrapper);
    }

    //Event handler for reading images from the local machine and uploading them
    //into the engine's TextureCache (PIXI.utils.TextureCache)
    loadTexturesFromLocal(event) {
        let input = event.target;
        let selectedFiles = input.files;

        for (let i = 0; i < selectedFiles.length; i++) {
            let reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result;
                let texture = new PIXI.BaseTexture(img.src);
                PIXI.Texture.addToCache(texture, input.files[i].name);
            };
            reader.readAsDataURL(input.files[i]);
        }
    }

    createGame(gameName) {
        let game = new Game(gameName);
        game.init(this.renderer.view.width, this.renderer.view.height);
        this.games.push(game);
    }

    deleteGame(gameName) { }

    saveGame() { }

    createGameEntity(texture = PIXI.utils.TextureCache["blueTile"]) {
        //Creates an entity at the center of the current game scene with the default
        //texture and default title
        const index = this.games[this.currentGameIndex].scenes[0].children.length;

        const gameEntity = new AnimatableEntity(texture, "untitled" + index);
        gameEntity.x = this.renderer.screen.width / 2;
        gameEntity.y = this.renderer.screen.height / 2;
        this.games[this.currentGameIndex].scenes[0].setSelectedEntityName(gameEntity.name);
        this.games[this.currentGameIndex].scenes[0].addChild(gameEntity);
    }

    playGame() {
        this.games[this.currentGameIndex].setGameMode("play");
    }

    stopGame() {
        this.games[this.currentGameIndex].setGameMode("design");
    }
}
