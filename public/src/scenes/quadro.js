export class quadro extends Phaser.Scene {

    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        super("quadro");
    }

    preload() {
        this.load.image("quadro", "public/assets/quadro/quadro-branco.webp");
        this.load.image("papel1", "public/assets/quadro/papel1.webp");
        this.load.image("papel2", "public/assets/quadro/papel2.webp");
        this.load.image("papel-preto1", "public/assets/quadro/papel-preto1.webp");
        this.load.image("papel-preto2", "public/assets/quadro/papel-preto2.webp");
        this.load.image("papel-grande", "public/assets/quadro/papel-grande.webp");
        this.load.image("papel-grande2", "public/assets/quadro/papel-grande-com-borda.webp");
    }

    create() {
        this.modalAberto = false;

        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "quadro").setScale(0.75);

        // Configuração dos 4 papéis: asset desbloqueado/bloqueado e qual zoom mostrar
        const papeis = [
            { fase: 1, x: 220, y: 300, keyUnlocked: "papel1", keyLocked: "papel-preto1", keyZoom: "papel-grande" },
            { fase: 2, x: 420, y: 300, keyUnlocked: "papel2", keyLocked: "papel-preto2", keyZoom: "papel-grande2" },
            { fase: 3, x: 620, y: 300, keyUnlocked: "papel1", keyLocked: "papel-preto1", keyZoom: "papel-grande" },
            { fase: 4, x: 820, y: 300, keyUnlocked: null, keyLocked: "papel-preto2", keyZoom: null },
        ];

        papeis.forEach(p => {
            const unlocked = this.registry.get(`fase${p.fase}Completa`) === true && p.keyUnlocked;
            const key = unlocked ? p.keyUnlocked : p.keyLocked;
            const img = this.add.image(p.x, p.y, key).setScale(0.15);

            if (unlocked) {
                img.setInteractive({ useHandCursor: true });
                img.on('pointerover', () => img.setTint(0xdddddd));
                img.on('pointerout', () => img.clearTint());
                img.on('pointerdown', () => this.abrirPapel(p.fase, p.keyZoom));
            }
        });

        // Botão voltar
        const btnVoltar = this.add.text(50, 30, "← Voltar", {
            fontSize: "20px",
            fill: "#ffffff",
            backgroundColor: "#333333",
            padding: { x: 10, y: 6 }
        }).setInteractive({ useHandCursor: true });

        btnVoltar.on('pointerover', () => btnVoltar.setStyle({ fill: "#ffff00" }));
        btnVoltar.on('pointerout', () => btnVoltar.setStyle({ fill: "#ffffff" }));
        btnVoltar.on('pointerdown', () => {
            if (!this.modalAberto) {
                this.registry.set('quadroLido', true);
                this.scene.start("Room", { personagem: this.registry.get('personagem') ?? 0, spawnX: 700, spawnY: 450 });
            }
        });

        // ESC sem modal aberto volta para o quarto
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.modalAberto) {
                this.registry.set('quadroLido', true);
                this.scene.start("Room", { personagem: this.registry.get('personagem') ?? 0, spawnX: 700, spawnY: 450 });
            }
        });
    }

    abrirPapel(fase, keyZoom) {
        if (!keyZoom || this.modalAberto) return;
        this.modalAberto = true;

        //  Conteúdo de cada fase 
        const conteudos = {
            1: {
                titulo: "Fase 1 — Conceitos basicos sobre IA",
                topicos: [
                    "Inteligência artificial (IA) é uma tecnologia que permite que computadores e máquinas simulem aprendizado, compreensão, resolução de problemas, tomada de decisões, criatividade e autonomia humanas."
                ]
            },
            2: {
                titulo: "Fase 2 — Etapas de Aprendizado",
                topicos: [
                    "A IA funciona em etapas. Ela coleta dados, encontra padrões, faz previsões e melhora por meio de feedback.",
                    "Pode melhorar ao longo do tempo. Ao contrário das tecnologias tradicionais, a IA aprende com novos dados e aprimora sua precisão por meio de feedback.",
                    "Nem todas as tecnologias inteligentes são IA. Automação, analítica avançada, sistemas baseados em regras e dispositivos inteligentes podem parecer inteligentes, mas não aprendem ou se adaptam como a IA."
                ]
            },
            3: {
                titulo: "Fase 3 — Diferenças de IA",
                topicos: [
                    "• A IA vem em diversas formas, cada uma projetada para uma tarefa específica.",
                    "1. A IA generativa cria novos conteúdos, como texto, imagens e música, com base em padrões aprendidos.",
                    "2. A IA preditiva analisa dados passados para prever tendências, como previsão de demanda e detecção de fraude.",
                    "3. A IA de tomada de decisões avalia múltiplos fatores para automatizar decisões complexas, como sistemas autônomos ou aprovações de empréstimos.",
                    "4. A IA de visão computacional permite que máquinas interpretem e processem informações visuais, como reconhecimento facial e imagens médicas."
                ]
            },
            4: {
                titulo: "Fase 4 — Título aqui",
                topicos: [
                    "• Tópico aprendido 1",
                    "• Tópico aprendido 2",
                    "• Tópico aprendido 3",
                ]
            },
        };


        const conteudo = conteudos[fase];

        // Fundo escuro
        const overlay = this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.75)
            .setDepth(10)
            .setInteractive();

        // Papel faz zoom 
        const paper = this.add.image(500, 300, keyZoom)
            .setScale(0.05)
            .setDepth(11);

        // Textos ficam fora do zoom  entram com fade após a animação
        const textos = [];

        if (conteudo) {
            const paperFinalH = paper.height * 0.85;
            const paperFinalW = paper.width * 0.85;

            const titulo = this.add.text(500, 300 - paperFinalH * 0.3, conteudo.titulo, {
                fontSize: "20px",
                fill: "#000000",
                fontStyle: "bold",
                align: "center",
                wordWrap: { width: paperFinalW * 0.75 }
            }).setOrigin(0.5, 0).setDepth(12).setAlpha(0);

            textos.push(titulo);

            const textoCompleto = conteudo.topicos.join("\n\n");

            const corpo = this.add.text(500, 300 - paperFinalH * 0.2, textoCompleto, {
                fontSize: "20px",
                fill: "#000000",
                fontStyle: "bold",
                align: "left",
                wordWrap: { width: paperFinalW * 0.4 },
                // lineSpacing: 12
            })
                .setOrigin(0.5, 0)
                .setDepth(12)
                .setAlpha(0);

            textos.push(corpo);

        }

        // Papel entra com zoom, depois textos aparecem com fade
        this.tweens.add({
            targets: paper,
            scale: 0.85,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: textos,
                    alpha: 1,
                    duration: 200
                });
            }
        });

        const fechar = () => {
            if (!this.modalAberto) return;
            this.modalAberto = false;
            escKey.destroy();

            this.tweens.add({
                targets: paper,
                scale: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => paper.destroy()
            });
            this.tweens.add({
                targets: [...textos, overlay],
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    textos.forEach(t => t.destroy());
                    overlay.destroy();
                }
            });
        };

        overlay.on('pointerdown', fechar);
        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESCAPE);
        escKey.on('down', fechar);
    }
}
