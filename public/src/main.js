import { Welcome } from "./scenes/welcome.js";
import { PhaseOne } from "./scenes/phaseOne.js";
import { DescricaoPhaseOne } from "./scenes/descricaoPhaseOne.js";
import { InicioPhaseTwo } from "./scenes/inicioPhaseTwo.js";
import { PhaseTwo } from "./scenes/phaseTwo.js";
import { Room } from "./scenes/room.js";
import { Creditos } from "./scenes/creditos.js";
import { CharSelect } from "./scenes/charSelect.js";
import { Cutscene } from "./scenes/cutScene.js";
import { quadro } from "./scenes/quadro.js";
import { DescricaoPhaseThree } from "./scenes/descricaoPhaseThree.js";
import { RoboConectaBalloes } from "./scenes/phaseThree.js";
import { AnimacaoPhaseFour } from "./scenes/animacaoPhase4.js";
import { DescricaoPhaseFour } from "./scenes/descricaoPhaseFour.js";
import { PhaseBoss } from "./scenes/PhaseBoss.js";
import { CutsceneFinal } from "./scenes/cutSceneFinal.js";
import { Pause } from "./scenes/pause.js";
import { applySavedColorFilterMode } from "./auxiliares/acessibilidade.js";
import { Ending } from "./scenes/ending.js";

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    backgroundColor: "#000000",
    pixelArt: true,
    roundPixel: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
    },

    scene: [
        Welcome,
        CharSelect,
        Cutscene,
        Creditos,
        Room,
        DescricaoPhaseOne,
        PhaseOne,
        InicioPhaseTwo,
        PhaseTwo,
        DescricaoPhaseThree,
        RoboConectaBalloes,
        AnimacaoPhaseFour,
        DescricaoPhaseFour,
        PhaseBoss,
        CutsceneFinal,
        Ending,
        Pause,
        quadro,
    ]
};

const game = new Phaser.Game(config);
applySavedColorFilterMode(game);