export class CutsceneFinal extends Phaser.Scene {

    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        super("CutsceneFinal"); // Nome da cena
    }

    init(data) {
        // Define personagem (prioridade: data → registry → padrão 0)
        this.personagemNum = data.personagem ?? this.registry.get('personagem') ?? 0;
    }

    preload() {
        // Evita erro quebrar o carregamento
        this.load.on('loaderror', () => { });

        // Imagens cutscene (moreno)
        this.load.image("cfMoreno1", "public/assets/cutsceneFinal/Cutfinalmoreno1.webp");
        this.load.image("cfMoreno2", "public/assets/cutsceneFinal/Cutfinalmoreno2.webp");
        this.load.image("cfMoreno3", "public/assets/cutsceneFinal/Cutfinalmoreno3.webp");
        this.load.image("cfMoreno4", "public/assets/cutsceneFinal/Cutfinalmoreno4.webp");

        // Imagens cutscene (morena)
        this.load.image("cfMorena1", "public/assets/cutsceneFinal/Cutfinalmorena1.webp");
        this.load.image("cfMorena2", "public/assets/cutsceneFinal/Cutfinalmorena2.webp");
        this.load.image("cfMorena3", "public/assets/cutsceneFinal/Cutfinalmorena3.webp");
        this.load.image("cfMorena4", "public/assets/cutsceneFinal/Cutfinalmorena4.webp");

        // Imagens cutscene (ruiva)
        this.load.image("cfRuiva1", "public/assets/cutsceneFinal/Cutfinalruiva1.png");
        this.load.image("cfRuiva2", "public/assets/cutsceneFinal/Cutfinalruiva2.webp");
        this.load.image("cfRuiva3", "public/assets/cutsceneFinal/Cutfinalruiva3.webp");
        this.load.image("cfRuiva4", "public/assets/cutsceneFinal/Cutfinalruiva4.webp");

        // Cards de diálogo
        this.load.image("cfCard1", "public/assets/cutsceneFinal/cardcutscenefinal1.png");
        this.load.image("cfCard2", "public/assets/cutsceneFinal/cardcutscenefinal2.png");
        this.load.image("cfCard3", "public/assets/cutsceneFinal/cardcutscenefinal3.png");
        this.load.image("cfCard4", "public/assets/cutsceneFinal/cardcutscenefinal4.png");
        this.load.image("cfCard5", "public/assets/cutsceneFinal/cardcutscenefinal5.png");

        // UI
        this.load.image("cfBotaoNext", "public/assets/cutsceneFinal/botãoNext.png");
        this.load.image("options", "public/assets/options.webp");

        // Música de fundo
        this.load.audio("quarto", "public/assets/musicas/quarto.mp3");
    }

    create() {
        // Toca música apenas se ainda não estiver ativa
        if (!this.game["quarto"]) {
            this.game["quarto"] = this.sound.add("quarto", { loop: true, volume: 0.5 });
            this.game["quarto"].play();
        }

        // Cor de fundo
        this.cameras.main.setBackgroundColor("#5e453c");

        // Lista de imagens por personagem
        this.cuts = [
            ["cfMoreno1", "cfMoreno2", "cfMoreno3", "cfMoreno4"],
            ["cfMorena1", "cfMorena2", "cfMorena3", "cfMorena4"],
            ["cfRuiva1", "cfRuiva2", "cfRuiva3", "cfRuiva4"],
        ];

        // Sequência da cutscene (imagem + card)
        this.steps = [
            { imgIdx: 0, cardKey: "cfCard1" },
            { imgIdx: 1, cardKey: "cfCard2" },
            { imgIdx: 1, cardKey: "cfCard3" },
            { imgIdx: 2, cardKey: "cfCard4" },
            { imgIdx: 3, cardKey: "cfCard5" },
        ];

        this.stepAtual = 0; // Controle de progresso

        // Imagem principal
        this.cutsceneImg = this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "")
            .setScale(0.85)
            .setDepth(0);

        // Card de diálogo
        this.cardImg = this.add.image(this.larguraJogo / 2, 530, "")
            .setDepth(1);

        this.atualizarCena(); // Inicializa primeira cena

        // Botão de avançar
        const botaoNext = this.add.image(800, 500, "cfBotaoNext")
            .setScale(0.2)
            .setInteractive()
            .setDepth(2);

        botaoNext.on("pointerdown", () => {
            this.avancar();
        });

        // Teclas para avançar
        this.input.keyboard.on("keydown-ENTER", () => this.avancar());
        this.input.keyboard.on("keydown-SPACE", () => this.avancar());

        // Botão de pause
        const btnPause = this.add.image(955, 570, "options")
            .setScale(0.1)
            .setDepth(3)
            .setInteractive({ useHandCursor: true });

        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "CutsceneFinal" });
            this.scene.pause("CutsceneFinal");
        });

        // Tecla ESC pausa
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.launch("Pause", { from: "CutsceneFinal" });
            this.scene.pause("CutsceneFinal");
        });
    }

    avancar() {
        this.stepAtual++; // Avança etapa

        // Se acabou, reseta jogo
        if (this.stepAtual >= this.steps.length) {
            this.resetarJogo();
            return;
        }

        this.atualizarCena(); // Atualiza tela
    }

    resetarJogo() {
        // Para todas as músicas
        const trilhas = ["menuMusic", "fase1", "fase2", "fase3", "fase4", "boss"];

        trilhas.forEach(key => {
            if (this.game[key]) {
                try { this.game[key].stop(); } catch (e) { }
                this.game[key] = null;
            }
        });

        // Limpa estado global
        this.registry.set('personagem', null);
        this.registry.set('fase1Completa', false);
        this.registry.set('fase2Completa', false);
        this.registry.set('fase3Completa', false);
        this.registry.set('quadroLido', false);

        // Vai para tela final
        this.scene.start("Ending", { personagem: this.personagemNum });
    }

    atualizarCena() {
        // Pega dados do passo atual
        const step = this.steps[this.stepAtual];

        // Define imagem conforme personagem
        const imgKey = this.cuts[this.personagemNum][step.imgIdx];

        // Atualiza imagens
        this.cutsceneImg.setTexture(imgKey);
        this.cardImg.setTexture(step.cardKey);
    }
}