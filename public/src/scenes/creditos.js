// Exporta classe Creditos
export class Creditos extends Phaser.Scene {

    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        super("Creditos");
    }

    preload() {
        this.load.image("voltar", "public/assets/start/voltar.webp");
        this.load.image("fundostart", "public/assets/start/fundostart.webp")
        this.load.image("creditos_img", "public/assets/creditos.webp");
    }

    create() {

        // Fundo
        const fundo = this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "fundostart");
        const scaleX = this.larguraJogo / fundo.width;
        const scaleY = this.alturaJogo / fundo.height;
        const scale = Math.max(scaleX, scaleY);
        fundo.setScale(scale);

        // Escuro cobre exatamente a imagem de fundo
        this.add.rectangle(
            this.larguraJogo / 2,
            this.alturaJogo / 2,
            fundo.width * scale,
            fundo.height * scale,
            0x000000,
            0.7
        );

        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2.2, "creditos_img").setScale(0.4);

        //botão voltar
        const voltarBtn = this.add.image(this.larguraJogo / 2, this.alturaJogo * 0.81, "voltar").setInteractive();
        voltarBtn.setScale(0.5);
        voltarBtn.on("pointerover", () => {
            this.input.setDefaultCursor("pointer");
        });
        voltarBtn.on("pointerout", () => {
            this.input.setDefaultCursor("default");
        });
        voltarBtn.on("pointerdown", () => {
            this.scene.start("Welcome");
        });

    }

    update() {

    }
}