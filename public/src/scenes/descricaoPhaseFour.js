export class DescricaoPhaseFour extends Phaser.Scene {

    alturaJogo = 600;
    larguraJogo = 1000;

    // Constrói o objeto
    constructor() {
        super("DescricaoPhaseFour");
    }

    preload() {
        this.load.on('loaderror', () => { });
        this.load.image("jogoFour", "public/assets/fundoChefe.webp");
        this.load.image("descricao4", "public/assets/descricao4.webp");
        this.load.image("tecla", "public/assets/tecla.webp");

        this.load.audio("boss", "public/assets/musicas/boss.mp3");
        this.load.image("options", "public/assets/options.webp");
    }

    create() {
        try {
            if ((!this.game.boss || !this.game.boss.isPlaying) && this.cache.audio.exists("boss")) {
                this.game.boss = this.sound.add("boss", { loop: true, volume: 0.1 });
                this.game.boss.play();
            }
        } catch (e) { }

        // Imagens de fundo
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "jogoFour")
            .setDisplaySize(this.larguraJogo, this.alturaJogo);        // Retângulo para deixar fora de foco do fundo
        this.add.rectangle(this.larguraJogo / 2, this.alturaJogo / 2, this.larguraJogo, this.alturaJogo, 0x000000, 0.55);
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "descricao4").setScale(0.55);

        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "DescricaoPhaseFour" });
            this.scene.pause("DescricaoPhaseFour");
        });
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.launch("Pause", { from: "DescricaoPhaseFour" });
            this.scene.pause("DescricaoPhaseFour");
        });

        // Ao apertar a tecla E, inicia a tela da fase quatro
        this.input.keyboard.on('keydown-E', () => {
            this.scene.start("PhaseBoss", { personagem: this.registry.get('personagem') ?? 0 });
        });

        this.add.image(810, 470, "tecla").setScale(0.55);
    }

    update() {

    }

}
