// Cena de tutorial/introdução da fase dois
export class InicioPhaseTwo extends Phaser.Scene {
    constructor() {
        super({ key: "InicioPhaseTwo" });
    }

    // Carrega os assets antes de criar a cena
    preload() {
        this.load.image("background", "public/assets/phaseTwo/bg_agua.webp");
        this.load.script("webfont", "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js");
        this.load.audio("fase2", "public/assets/musicas/fase2.mp3");
        this.load.image("dourado1", "public/assets/phaseTwo/dourado.webp");
        this.load.image("dourado2", "public/assets/phaseTwo/dourado2.webp");
        this.load.image("dourado3", "public/assets/phaseTwo/dourado3.webp");
        this.load.image("dourado4", "public/assets/phaseTwo/dourado4.webp");
        this.load.image("peixe_pequeno", "public/assets/phaseTwo/peixe_pequeno.webp");
        this.load.image("peixe_medio", "public/assets/phaseTwo/peixe_medio.webp");
        this.load.image("peixe_grande", "public/assets/phaseTwo/peixe_grande.webp");
        this.load.image("lixo1", "public/assets/phaseTwo/lixo.webp");
        this.load.image("lixo2", "public/assets/phaseTwo/lixo2.webp");
        this.load.image("lixo3", "public/assets/phaseTwo/lixo3.webp");
        this.load.image("options", "public/assets/options.webp");
    }

    create() {
        try {
            if ((!this.game.fase2 || !this.game.fase2.isPlaying) && this.cache.audio.exists("fase2")) {
                this.game.fase2 = this.sound.add("fase2", { loop: true, volume: 0.1 });
                this.game.fase2.play();
            }
        } catch (e) { }

        this.add.image(500, 300, "background");

        // Painel verde arredondado que serve de fundo para o tutorial
        let painel = this.add.graphics();
        painel.fillStyle(0x4e8c49, 1);
        painel.fillRoundedRect(60, 20, 880, 560, 24);

        // Aguarda a fonte Silkscreen carregar antes de renderizar os textos
        WebFont.load({
            google: { families: ["Silkscreen"] },
            active: () => {

                // Título do tutorial
                this.add.text(500, 65, "Tutorial da Fase 2", {
                    fontFamily: "'Silkscreen'",
                    fontSize: "40px",
                    color: "#000000",
                    fontStyle: "bold",
                    align: "center",
                }).setOrigin(0.5);

                // Seção de controles
                this.add.text(500, 115, "[ Controles ]", {
                    fontFamily: "'Silkscreen'",
                    fontSize: "22px",
                    color: "#000000",
                    fontStyle: "bold",
                    align: "center",
                }).setOrigin(0.5);

                this.add.text(500, 148,
                    "'W' Sobe o anzol          'S' Desce o anzol",
                    {
                        fontFamily: "'Silkscreen'",
                        fontSize: "22px",
                        color: "#000000",
                        align: "center",
                    }
                ).setOrigin(0.5);

                // Linha divisória
                let linha1 = this.add.graphics();
                linha1.lineStyle(2, 0x000000, 0.4);
                linha1.lineBetween(80, 175, 920, 175);

                // Labels das colunas: peixes dourados, normais e lixo
                this.add.text(190, 200, "DOURADOS\n+7 pts", {
                    fontFamily: "'Silkscreen'",
                    fontSize: "15px",
                    color: "#7a5000",
                    fontStyle: "bold",
                    align: "center",
                }).setOrigin(0.5);

                this.add.text(500, 200, "NORMAIS\n+1 pts +3 pts +5 pts", {
                    fontFamily: "'Silkscreen'",
                    fontSize: "15px",
                    color: "#1a3d00",
                    fontStyle: "bold",
                    align: "center",
                }).setOrigin(0.5);

                this.add.text(810, 200, "LIXO\nREINICIA!", {
                    fontFamily: "'Silkscreen'",
                    fontSize: "15px",
                    color: "#8b0000",
                    fontStyle: "bold",
                    align: "center",
                }).setOrigin(0.5);

                // Ícones ilustrativos de cada categoria
                this.add.image(110, 275, "dourado4").setScale(0.2);
                this.add.image(170, 275, "dourado1").setScale(0.3);
                this.add.image(230, 275, "dourado2").setScale(0.3);
                this.add.image(280, 275, "dourado3").setScale(0.3);

                this.add.image(430, 275, "peixe_pequeno").setScale(0.3);
                this.add.image(500, 275, "peixe_medio").setScale(0.3);
                this.add.image(570, 275, "peixe_grande").setScale(0.3);

                this.add.image(720, 275, "lixo2").setScale(0.225);
                this.add.image(810, 275, "lixo3").setScale(0.225);
                this.add.image(890, 275, "lixo1").setScale(0.3);

                // Linha divisória
                let linha2 = this.add.graphics();
                linha2.lineStyle(2, 0x000000, 0.4);
                linha2.lineBetween(80, 325, 920, 325);

                // Texto com o objetivo da fase e instruções finais
                this.add.text(500, 450,
                    "Pegue todos os itens dourados e some 100 pontos para concluir a fase!\nEvite o lixo a todo custo!\n\nPressione 'E' para jogar e 'Esc' para reiniciar a fase",
                    {
                        fontFamily: "'Silkscreen'",
                        fontSize: "18px",
                        color: "#000000",
                        align: "center",
                        lineSpacing: 16,
                    }
                ).setOrigin(0.5);
            }
        });

        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "InicioPhaseTwo" });
            this.scene.pause("InicioPhaseTwo");
        });
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.launch("Pause", { from: "InicioPhaseTwo" });
            this.scene.pause("InicioPhaseTwo");
        });

        // Ao pressionar E, inicia a fase
        this.input.keyboard.once("keydown-E", () => {
            this.scene.start("PhaseTwo");
        });
    }
}