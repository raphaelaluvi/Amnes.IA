// Cena de descrição da fase três
export class DescricaoPhaseThree extends Phaser.Scene {

    // Dimensões da tela do jogo
    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        super("DescricaoPhaseThree");
    }

    // Carrega os assets antes de criar a cena
    preload() {
        this.load.on('loaderror', () => { });
        this.load.image("fundo3", "public/assets/phaseThree/fundo.jpeg");
        this.load.image("descricao3", "public/assets/phaseThree/descricao3.webp");
        this.load.image("tecla", "public/assets/tecla.webp");
        this.load.audio("fase3", "public/assets/musicas/fase3.mp3");
        this.load.image("options", "public/assets/options.webp");
    }

    create() {
        // Evita recriar a música caso a cena seja reiniciada
        try {
            if (!this.game.fase3 && this.cache.audio.exists("fase3")) {
                this.game.fase3 = this.sound.add("fase3", { loop: true, volume: 0.1 });
                this.game.fase3.play();
            }
        } catch (e) { }

        // Imagem de fundo e overlay escuro para destacar a descrição
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "fundo3").setDisplaySize(this.larguraJogo, this.alturaJogo);
        this.add.rectangle(this.larguraJogo / 2, this.alturaJogo / 2, this.larguraJogo, this.alturaJogo, 0x000000, 0.55);

        // Imagem com as instruções/descrição da fase
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "descricao3").setScale(0.55);

        // Imagem da tecla E para indicar como avançar
        this.add.image(810, 470, "tecla").setScale(0.55);

        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "DescricaoPhaseThree" });
            this.scene.pause("DescricaoPhaseThree");
        });
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.launch("Pause", { from: "DescricaoPhaseThree" });
            this.scene.pause("DescricaoPhaseThree");
        });

        // Ao pressionar E, inicia a fase
        this.input.keyboard.on('keydown-E', () => {
            this.scene.start("RoboConectaBalloes");
        });

    }

    update() {

    }

}