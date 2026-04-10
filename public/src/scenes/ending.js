export class Ending extends Phaser.Scene {
 
    alturaJogo = 600;
    larguraJogo = 1000;
 
    constructor() {
        super("Ending"); // Nome da cena
    }
 
    init(data) {
        // Recebe personagem (fallback 0)
        this.personagemNum = data.personagem ?? 0;
    }
 
    preload() { }
 
    create() {
        // Fundo escuro
        this.add.rectangle(
            this.larguraJogo / 2,
            this.alturaJogo / 2,
            this.larguraJogo,
            this.alturaJogo,
            0x0a0f1e
        );
 
        this.criarEstrelas();   // Fundo animado
        this.criarParticulas(); // Partículas flutuantes
 
        // Título animado
        const titulo = this.add.text(this.larguraJogo / 2, 180, "PARABÉNS!", {
            fontFamily: "Arial Black, Arial",
            fontSize: "72px",
            color: "#7CFC00",
            fontStyle: "bold",
            stroke: "#004400",
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);
 
        // Entrada do título
        this.tweens.add({
            targets: titulo,
            alpha: 1,
            scale: 1,
            duration: 700,
            ease: "Back.Out",
            delay: 400
        });
 
        // Pulso contínuo
        this.time.delayedCall(1200, () => {
            this.tweens.add({
                targets: titulo,
                scale: 1.04,
                yoyo: true,
                repeat: -1,
                duration: 1200,
                ease: "Sine.InOut"
            });
        });
 
        // Mensagem principal
        const msg = this.add.text(
            this.larguraJogo / 2, 310,
            "Você derrotou o chefão e concluiu\na jornada sobre IA!",
            {
                fontFamily: "Arial",
                fontSize: "26px",
                color: "#e0e0e0",
                align: "center",
                lineSpacing: 10,
                wordWrap: { width: 800 }
            }
        ).setOrigin(0.5).setAlpha(0);
 
        // Animação da mensagem
        this.tweens.add({
            targets: msg,
            alpha: 1,
            y: 300,
            duration: 600,
            delay: 900,
            ease: "Power2"
        });
 
        // Texto de instrução (pisca)
        this.textoEnter = this.add.text(
            this.larguraJogo / 2, 430,
            "Pressione ENTER para voltar ao menu",
            {
                fontFamily: "Arial",
                fontSize: "20px",
                color: "#ffd166"
            }
        ).setOrigin(0.5).setAlpha(0);
 
        // Fade + loop piscante
        this.time.delayedCall(1600, () => {
            this.tweens.add({
                targets: this.textoEnter,
                alpha: 1,
                duration: 400,
                onComplete: () => {
                    this.tweens.add({
                        targets: this.textoEnter,
                        alpha: 0.2,
                        yoyo: true,
                        repeat: -1,
                        duration: 800,
                        ease: "Sine.InOut"
                    });
                }
            });
        });
 
        // Captura tecla ENTER
        this.teclaEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
 
    criarEstrelas() {
        const graphics = this.add.graphics();
 
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, this.larguraJogo);
            const y = Phaser.Math.Between(0, this.alturaJogo);
            const r = Math.random() < 0.3 ? 2 : 1;
            const alpha = Phaser.Math.FloatBetween(0.2, 0.9);
 
            // Desenha estrela
            graphics.fillStyle(0xffffff, alpha);
            graphics.fillCircle(x, y, r);
 
            // Algumas piscam
            if (Math.random() < 0.4) {
                const estrela = this.add.circle(x, y, r, 0xffffff, alpha);
 
                this.tweens.add({
                    targets: estrela,
                    alpha: 0.1,
                    yoyo: true,
                    repeat: -1,
                    duration: Phaser.Math.Between(800, 2500),
                    ease: "Sine.InOut",
                    delay: Phaser.Math.Between(0, 2000)
                });
            }
        }
    }
 
    criarParticulas() {
        const cores = [0xffd166, 0x7CFC00, 0x88ccff, 0xffffff];
 
        for (let i = 0; i < 18; i++) {
            const x = Phaser.Math.Between(50, this.larguraJogo - 50);
            const y = Phaser.Math.Between(this.alturaJogo * 0.5, this.alturaJogo);
            const cor = cores[Phaser.Math.Between(0, cores.length - 1)];
            const tamanho = Phaser.Math.Between(2, 5);
 
            // Cria partícula
            const p = this.add.circle(x, y, tamanho, cor, 0.8);
 
            // Anima subida
            this.tweens.add({
                targets: p,
                y: y - Phaser.Math.Between(100, 350),
                x: x + Phaser.Math.Between(-40, 40),
                alpha: 0,
                scale: 0.2,
                duration: Phaser.Math.Between(2500, 5000),
                ease: "Power1",
                delay: Phaser.Math.Between(0, 3000),
                repeat: -1,
 
                // Reset ao repetir
                onRepeat: (tween, target) => {
                    target.x = Phaser.Math.Between(50, this.larguraJogo - 50);
                    target.y = Phaser.Math.Between(this.alturaJogo * 0.6, this.alturaJogo);
                    target.alpha = 0.8;
                    target.scaleX = 1;
                    target.scaleY = 1;
                }
            });
        }
    }
 
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclaEnter)) {
 
            // Para música do quarto
            if (this.game["quarto"]) {
                try { this.game["quarto"].stop(); } catch (e) { }
                this.game["quarto"] = null;
            }
 
            // Volta ao menu inicial
            this.scene.start("Welcome");
        }
    }
}