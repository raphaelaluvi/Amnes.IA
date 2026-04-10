// Exporta classe Welcome
export class Welcome extends Phaser.Scene {

    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        super("Welcome");
    }

    preload() {
        this.load.on('loaderror', () => { });
        this.load.image("fundostart", "public/assets/start/fundostart.webp");
        this.load.image("playbtn", "public/assets/start/play.webp");
        this.load.image("creditos", "public/assets/start/credits.webp");

        this.load.audio("menuMusic", "public/assets/musicas/tema.mp3");
        this.load.image("options", "public/assets/options.webp");
    }

    create() {
        try {
            if (!this.game.menuMusic && this.cache.audio.exists("menuMusic")) {
                this.game.menuMusic = this.sound.add("menuMusic", { loop: true, volume: 0.1 });
                this.game.menuMusic.play();
            }
        } catch (e) { }

        // Fundo
        const fundo = this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "fundostart");
        const scaleX = this.larguraJogo / fundo.width;
        const scaleY = this.alturaJogo / fundo.height;
        const scale = Math.max(scaleX, scaleY);
        fundo.setScale(scale);

        // Botão Play
        const playBtn = this.add.image(this.larguraJogo / 2, this.alturaJogo * 0.75, "playbtn").setInteractive();
        playBtn.setScale(0.5);
        playBtn.on("pointerover", () => {
            this.input.setDefaultCursor("pointer"); // cursor muda para pointer
        });
        playBtn.on("pointerout", () => {
            this.input.setDefaultCursor("default"); // cursor volta ao normal
        });
        playBtn.on("pointerdown", () => {
            this.scene.start("CharSelect"); // inicia a cena de seleção de personagem
        });

        // Botão Options
        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "Welcome" });
            this.scene.pause("Welcome");
        });
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.launch("Pause", { from: "Welcome" });
            this.scene.pause("Welcome");
        });

        // Botão Créditos
        const creditBtn = this.add.image(this.larguraJogo / 2, this.alturaJogo * 0.85, "creditos").setInteractive();
        creditBtn.setScale(0.5);
        creditBtn.on("pointerover", () => {
            this.input.setDefaultCursor("pointer"); // cursor muda para pointer
        });
        creditBtn.on("pointerout", () => {
            this.input.setDefaultCursor("default"); // cursor volta ao normal
        });
        creditBtn.on("pointerdown", () => {
            this.scene.start("Creditos"); // inicia a cena de créditos
        });
    }

    update() {

    }

}