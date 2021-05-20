import { AnimatableEntity } from "./animatableEntity";
import Game from "./game";
import EventType from "/public/scripts/common/constants/eventType.js";
import CardBuilder from "/public/scripts/view-components/cards/cardBuilder.js";
import { Card, Button, PresetColours, PresetFontSize } from "/public/scripts/view-components/cards/card.js";

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
        // this.initializeEntitySettings = this.initializeEntitySettings.bind(this);
        this.translateEntityHandler = this.translateEntityHandler.bind(this);
        this.scaleEntityHandler = this.scaleEntityHandler.bind(this);
        this.rotateEntityHandler = this.rotateEntityHandler.bind(this);
        this.entityTransformedHandler = this.entityTransformedHandler.bind(this);
    }

    //Transformations Event Handlers
    translateEntityHandler(ev){
        ev.preventDefault();
            const fData = new FormData(ev.target);
            const formValues = {};

            for (let keyval of fData.entries()) {
                formValues[keyval[0]] = keyval[1];
            }

            this.games[this.currentGameIndex].getCurrentSelectedEntity().translateEntity(parseFloat(formValues.x), parseFloat(formValues.y));
    }

    rotateEntityHandler(ev){
        ev.preventDefault();
        const fData = new FormData(ev.target);
        const formValues = {};

        for (let keyval of fData.entries()) {
            formValues[keyval[0]] = keyval[1];
        }

        console.log(formValues);

        this.games[this.currentGameIndex].getCurrentSelectedEntity().rotateEntity(parseFloat(formValues.degrees));
    }

    scaleEntityHandler(ev){
        ev.preventDefault();
        const fData = new FormData(ev.target);
        const formValues = {};

        for (let keyval of fData.entries()) {
            formValues[keyval[0]] = keyval[1];
        }

        this.games[this.currentGameIndex].getCurrentSelectedEntity().scaleEntity(parseFloat(formValues.x), parseFloat(formValues.y))
    }

    entityTransformedHandler(){
        const selectedEntity = this.games[this.currentGameIndex].getCurrentSelectedEntity();
        if(selectedEntity){
            // position
         document.getElementById("xPosition").value = selectedEntity.transform.position.x.toFixed(2);
         document.getElementById("yPosition").value = selectedEntity.transform.position.y.toFixed(2);

         // Scale
         document.getElementById("xScale").value = selectedEntity.transform.scale.x.toFixed(2);
         document.getElementById("yScale").value = selectedEntity.transform.scale.y.toFixed(2);

         // Rotation
         document.getElementById("rotationDeg").value = selectedEntity.transform.rotation.toFixed(2)
        }
    }

    degrees_to_radians(degrees) {
        var pi = Math.PI;
        return degrees * (pi / 180);
    }

    setupEventListeners(){
        const playButton = document.querySelector("#play-button");
        playButton.addEventListener("click", this.playGame, false);

        const stopButton = document.querySelector("#stop-button");
        stopButton.addEventListener("click", this.stopGame, false);

         this._entityContainerId = "entities";
        this._entities = document.getElementById(this._entityContainerId);

        this._positionForm = document.getElementById("positionForm");
        this._rotationForm = document.getElementById("rotationForm");
        this._scaleForm = document.getElementById("scaleForm");

        window.addEventListener("entityChanged", this.entityTransformedHandler);
        this._positionForm.addEventListener(EventType.FORM.SUBMIT, this.translateEntityHandler);
        this._rotationForm.addEventListener(EventType.FORM.SUBMIT, this.rotateEntityHandler);
        this._scaleForm.addEventListener(EventType.FORM.SUBMIT, this.scaleEntityHandler);
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

        this.setupEventListeners();

        //Pre-load default assets here (Assets that come with the engine)
        this.loader.baseUrl = "/public/assets/";

        this.loadDefaultAssets();
        this.createGame("Test Game");

        this.games[this.currentGameIndex].scenes.forEach((scene) => {
            this.stage.addChild(scene);
        });
        // this.initializeEntitySettings();

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

    saveGame() { 
        const gameState = {};
        this.games[this.currentGameIndex].scenes.forEach(scene => {
            const sceneProperties = {
                name: scene.name,
                height: scene.height,
                width: scene.width,
                gravity: scene.gravity,
                children: [],
            };

            let entityProperties;
            gameState[scene.name] = sceneProperties;

            scene.children.forEach(child => {
                let scale = {x: child.scale._x, y: child.scale._y};
                entityProperties = {
                    name: child.name,
                    type: child.type,
                    xPosition: child.x,
                    yPosition: child.y,
                    mass: child.mass,
                    acceleration: child.acceleration,
                    texture: child._texture.textureCacheIds,
                    scale: scale,
                    rotation: child.angle,
                };
                gameState[scene.name].children.push(entityProperties);
                console.log(child.transform);
            });
        });

        //Send save request from here JSON.stringify(gameState)
    }

    createGameEntity(texture = PIXI.utils.TextureCache["blueTile"]) {
        const index = this.games[this.currentGameIndex].scenes[0].children.length;

        const gameEntity = new AnimatableEntity(texture, "untitled" + index);
        gameEntity.x = this.renderer.screen.width / 2;
        gameEntity.y = this.renderer.screen.height / 2;
        this.games[this.currentGameIndex].getCurrentScene().setSelectedEntityName(gameEntity.name);
        this.games[this.currentGameIndex].scenes[0].addChild(gameEntity);
    }

    playGame() {
        // this.games[this.currentGameIndex].setGameMode("play");
        // console.log(this.games[this.currentGameIndex]);
        this.saveGame();
    }

    stopGame() {
        this.games[this.currentGameIndex].setGameMode("design");
    }
}
