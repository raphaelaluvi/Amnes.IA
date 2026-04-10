export class AnimacaoPhaseFour extends Phaser.Scene {

    // Dimensões do jogo
    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        super("animacaoPhase4");
    }

    preload() {
        // Carrega o vídeo de transição
        this.load.video("transicao", "public/assets/transicao.webm");
    }

    create() {
        // Adiciona o vídeo centralizado
        const video = this.add.video(this.larguraJogo / 2, this.alturaJogo / 2, "transicao");
        video.setDisplaySize(this.larguraJogo, this.alturaJogo); // Ajusta ao tamanho da tela
        video.play(false); // Reproduz sem loop

        // Quando o vídeo termina, muda de cena
        video.on("complete", () => {
            this.scene.start("DescricaoPhaseFour");
        });

        // Botão de pause no canto inferior direito
        const btnPause = this.add.image(955, 570, "options")
            .setScale(0.1)
            .setDepth(100)
            .setInteractive({ useHandCursor: true });

        // Ao clicar no botão, abre menu de pause
        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "animacaoPhase4" });
            this.scene.pause("animacaoPhase4");
        });

        // Tecla ESC também abre o pause
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.launch("Pause", { from: "animacaoPhase4" });
            this.scene.pause("animacaoPhase4");
        });

        // Tecla E pula a animação
        this.input.keyboard.on('keydown-E', () => {
            this.scene.start("DescricaoPhaseFour");
        });
    }

    update() { } // Loop de atualização (não utilizado)

}