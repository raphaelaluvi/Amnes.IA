import { COLOR_FILTER_PRESETS, applyColorFilterMode, getNextColorFilterMode, getSavedColorFilterMode } from "../auxiliares/acessibilidade.js";

export class Pause extends Phaser.Scene {

    constructor() {
        super("Pause"); // Nome da cena
    }

    init(data) {
        // Guarda qual cena chamou o pause
        this.cenaAnterior = data.from;
    }

    preload() {
        // Ícones de volume
        this.load.image("volumeOn", "public/assets/volumeOn.webp");
        this.load.image("volumeOf", "public/assets/volumeOf.webp");
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Fundo escuro + painel central
        this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.7);
        this.add.rectangle(width / 2, height / 2, 580, 520, 0x111111, 0.78)
            .setStrokeStyle(2, 0xffffff, 0.25);

        this.add.text(500, 120, "PAUSADO", {
            fontSize: "40px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Botão Continuar
        const btnContinuar = this.add.text(500, 190, "Continuar", {
            fontSize: "22px",
            color: "#ffffff",
            backgroundColor: "#1a6b1a",
            padding: { x: 36, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnContinuar.on("pointerover", () => btnContinuar.setStyle({ color: "#a3f5a3" }));
        btnContinuar.on("pointerout", () => btnContinuar.setStyle({ color: "#ffffff" }));

        // Retoma o jogo
        btnContinuar.on("pointerdown", () => this.continuar());

        // Botão Tela Cheia
        const estiloTelaCheia = {
            fontSize: "22px",
            color: "#ffffff",
            backgroundColor: "#1a3d6b",
            padding: { x: 30, y: 8 }
        };

        const btnTelaCheia = this.add.text(500, 260, "Tela Cheia", estiloTelaCheia)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        btnTelaCheia.on("pointerover", () => btnTelaCheia.setStyle({ color: "#aaccff" }));
        btnTelaCheia.on("pointerout", () => btnTelaCheia.setStyle({ color: "#ffffff" }));

        // Alterna fullscreen
        btnTelaCheia.on("pointerdown", () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                btnTelaCheia.setText("Tela Cheia");
            } else {
                this.scale.startFullscreen();
                btnTelaCheia.setText("Sair da Tela Cheia");
            }
        });

        // Acessibilidade - filtro de cor
        let colorMode = getSavedColorFilterMode();

        this.add.text(500, 320, "Modo de Visão", {
            fontSize: "22px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Mostra modo atual
        const txtColorMode = this.add.text(500, 350, COLOR_FILTER_PRESETS[colorMode].label, {
            fontSize: "26px",
            color: "#9bddff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Botão trocar filtro
        const btnColorMode = this.add.text(500, 400, "Trocar Filtro", {
            fontSize: "22px",
            color: "#ffffff",
            backgroundColor: "#3a2e66",
            padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnColorMode.on("pointerover", () => btnColorMode.setStyle({ color: "#d8c7ff" }));
        btnColorMode.on("pointerout", () => btnColorMode.setStyle({ color: "#ffffff" }));

        // Alterna filtro
        btnColorMode.on("pointerdown", () => {
            colorMode = getNextColorFilterMode(colorMode);
            const appliedMode = applyColorFilterMode(this.game, colorMode);
            colorMode = appliedMode;
            txtColorMode.setText(COLOR_FILTER_PRESETS[colorMode].label);
        });

        // Botão voltar ao menu
        const btnMenu = this.add.text(400, 470, "Menu", {
            fontSize: "28px",
            color: "#ffffff",
            backgroundColor: "#6b1a1a",
            padding: { x: 24, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnMenu.on("pointerover", () => btnMenu.setStyle({ color: "#ffaaaa" }));
        btnMenu.on("pointerout", () => btnMenu.setStyle({ color: "#ffffff" }));

        // Para músicas e volta ao menu
        btnMenu.on("pointerdown", () => {
            const trilhasAtivas = ["quarto", "fase1", "fase2", "fase3", "fase4", "boss"];

            trilhasAtivas.forEach((nome) => {
                if (this.game[nome]) {
                    this.game[nome].stop();
                    this.game[nome] = null;
                }
            });

            this.scene.stop(this.cenaAnterior);
            this.scene.start("Welcome");
        });

        // Botão de mute (ícone)
        let mutado = this.sound.mute;

        const btnMute = this.add.image(600, 470, mutado ? "volumeOf" : "volumeOn")
            .setScale(0.10)
            .setInteractive({ useHandCursor: true });

        // Hover visual
        btnMute.on("pointerover", () => btnMute.setAlpha(0.75));
        btnMute.on("pointerout", () => btnMute.setAlpha(1));

        // Alterna som
        btnMute.on("pointerdown", () => {
            mutado = !mutado;
            this.sound.mute = mutado;
            btnMute.setTexture(mutado ? "volumeOf" : "volumeOn");
        });

        // ESC retoma o jogo
        this.input.keyboard.once("keydown-ESC", () => this.continuar());
    }

    continuar() {
        // Retoma cena anterior e fecha pause
        this.scene.resume(this.cenaAnterior);
        this.scene.stop("Pause");
    }
}