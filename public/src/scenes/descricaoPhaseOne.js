// Exporta classe DescricaoPhaseOne
export class DescricaoPhaseOne extends Phaser.Scene {

    alturaJogo = 600;
    larguraJogo = 1000;

    // Constrói o objeto
    constructor() {
        super("DescricaoPhaseOne");
    }

    preload() {
        this.load.on('loaderror', () => { });
        this.load.image("fundo", "public/assets/phaseOne/fundo.jpg");
        this.load.image("jogoUm", "public/assets/phaseOne/fundoJogoUm.jpg");
        this.load.image("descricao", "public/assets/phaseOne/descricao.webp");

        this.load.audio("fase1", "public/assets/musicas/fase1.mp3");
        this.load.image("options", "public/assets/options.webp");
    }

    create() {
        try {
            if (!this.game.fase1 && this.cache.audio.exists("fase1")) {
                this.game.fase1 = this.sound.add("fase1", { loop: true, volume: 0.1 });
                this.game.fase1.play();
            }
        } catch (e) { }

        // Imagens de fundo
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "fundo").setScale(0.7);
        this.add.image(this.larguraJogo / 2, 350, "jogoUm").setScale(0.55);
        // Retângulo para deixar fora de foco do fundo
        this.add.rectangle(this.larguraJogo / 2, this.alturaJogo / 2, this.larguraJogo, this.alturaJogo, 0x000000, 0.55);
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "descricao").setScale(0.55);

        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "DescricaoPhaseOne" });
            this.scene.pause("DescricaoPhaseOne");
        });
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.launch("Pause", { from: "DescricaoPhaseOne" });
            this.scene.pause("DescricaoPhaseOne");
        });

        // Ao apertar a tecla E, inicia a tela da fase um
        this.input.keyboard.on('keydown-E', () => {
            this.scene.start("PhaseOne");
        });

    }

    update() {

    }

}
