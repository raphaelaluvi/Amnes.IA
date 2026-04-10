export class PhaseTwo extends Phaser.Scene {

    larguraJogo = 1000;
    alturaJogo = 600;

    constructor() {
        super("PhaseTwo");
    }

    preload() {
        this.load.audio("fase2", "public/assets/musicas/fase2.mp3");
        this.load.image("fundo2", "public/assets/phaseTwo/fundo.jpg");
        this.load.image("fundojogo", "public/assets/phaseTwo/bg_agua.webp")
        this.load.image("conclusao2", "public/assets/phaseTwo/conclusao2.webp");
        this.load.image("gameOver", "public/assets/phaseTwo/gameOver.png");


        this.load.image('anzol', 'public/assets/phaseTwo/anzol.webp');

        this.load.image('peixe_pequeno', 'public/assets/phaseTwo/peixe_pequeno.webp');
        this.load.image('peixe_medio', 'public/assets/phaseTwo/peixe_medio.webp');
        this.load.image('peixe_grande', 'public/assets/phaseTwo/peixe_grande.webp');

        this.load.image('lixo', 'public/assets/phaseTwo/lixo.webp');
        this.load.image('lixo2', 'public/assets/phaseTwo/lixo2.webp');
        this.load.image('lixo3', 'public/assets/phaseTwo/lixo3.webp');

        this.load.image('dourado', 'public/assets/phaseTwo/dourado.webp');
        this.load.image('dourado2', 'public/assets/phaseTwo/dourado2.webp');
        this.load.image('dourado3', 'public/assets/phaseTwo/dourado3.webp');
        this.load.image('dourado4', 'public/assets/phaseTwo/dourado4.webp');

        this.load.image('options', 'public/assets/options.webp');
        this.load.image('xis', 'public/assets/phaseTwo/xis.webp');
        this.load.image('etapa1', 'public/assets/phaseTwo/etapa1.webp');
        this.load.image('etapa2', 'public/assets/phaseTwo/etapa2.webp');
        this.load.image('etapa3', 'public/assets/phaseTwo/etapa3.webp');
        this.load.image('etapa4', 'public/assets/phaseTwo/etapa4.webp');
    }

    create() {
        try {
            if ((!this.game.fase2 || !this.game.fase2.isPlaying) && this.cache.audio.exists("fase2")) {
                this.game.fase2 = this.sound.add("fase2", { loop: true, volume: 0.1 });
                this.game.fase2.play();
            }
        } catch (e) { }

        this.events.on("shutdown", () => {
            if (this.game.fase2) {
                this.game.fase2.stop();
                this.game.fase2 = null;
            }
        });

        // Fundo padrão do jogo
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "fundo2")
            .setScale(0.7);

        this.add.image((this.larguraJogo / 2) * 1, 365, "fundojogo").setScale(0.69);

        // Variáveis
        this.pontuacao = 0;
        this.meta = 100;
        this.gameOver = false;
        this.douradosColetados = 0;

        this.teclado = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });
        this.teclaESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            if (this.gameOver) return;
            this.scene.launch("Pause", { from: "PhaseTwo" });
            this.scene.pause("PhaseTwo");
        });

        this.input.keyboard.on('keydown-ESC', () => {
            if (this.gameOver) return;
            this.scene.launch("Pause", { from: "PhaseTwo" });
            this.scene.pause("PhaseTwo");
        });

        // Coleção
        this.colecao = {};
        this.icones = [];

        // Organizando ordem dos cards
        this.etapas = ['etapa1', 'etapa2', 'etapa3', 'etapa4'];
        this.etapaAtual = 0;

        this.douradosOrdem = ['dourado', 'dourado2', 'dourado3', 'dourado4'];

        this.mapaCards = {
            dourado: 'etapa1',
            dourado2: 'etapa2',
            dourado3: 'etapa3',
            dourado4: 'etapa4'
        };

        // Configuração do anzol
        this.anzol = this.physics.add.sprite(500, 150, 'anzol')
            .setScale(0.15)
            .setCollideWorldBounds(true);

        this.anzol.body.setCircle(170);
        this.anzol.body.setOffset(25, 300);

        // Linha
        this.linha = this.add.graphics();
        this.origemLinha = {
            x: this.larguraJogo / 2,
            y: 113
        };

        // Grupo de peixes
        this.grupoPeixes = this.physics.add.group();

        // Sistema de spawn
        this.spawnPeixes = this.time.addEvent({
            delay: 1200,
            loop: true,
            callback: this.criarPeixe,
            callbackScope: this
        });

        // Colisão
        this.physics.add.overlap(
            this.anzol,
            this.grupoPeixes,
            this.pegarPeixe,
            null,
            this
        );

        // HUD
        this.placar = this.add.text(20, 120, 'Pontos: 0', {
            fontSize: '28px',
            color: '#ffffff'
        });

        this.jogoPausado = false;

        // Fundo escuro (overlay)
        this.overlay = this.add.rectangle(
            this.larguraJogo / 2,
            this.alturaJogo / 2,
            this.larguraJogo,
            this.alturaJogo,
            0x000000,
            0.6
        ).setDepth(20).setVisible(false);

        // Card
        this.cardInfo = this.add.image(
            this.larguraJogo / 2,
            this.alturaJogo / 2,
            'etapa1'
        ).setDepth(21).setVisible(false).setScale(0.5);

        this.botaoFechar = this.add.image(
            this.larguraJogo / 2 + 240,
            this.alturaJogo / 2 - 140,
            'xis'
        )
            .setDepth(22)
            .setScale(0.15)
            .setVisible(false)
            .setInteractive({ useHandCursor: true });

        this.botaoFechar.on('pointerdown', () => {
            this.fecharInfo();
        });
    }

    update() {

        if (this.jogoPausado) return;

        if (!this.gameOver) {

            // Movimento vertical do anzol
            this.anzol.setVelocityY(0);

            if (this.teclado.up.isDown)
                this.anzol.setVelocityY(-250);

            if (this.teclado.down.isDown)
                this.anzol.setVelocityY(250);

            // Limite superior do anzol
            if (this.anzol.y < 150) {
                this.anzol.y = 150;
            }

            // Desenho da linha
            this.linha.clear();
            this.linha.lineStyle(2, 0xffffff);
            this.linha.beginPath();
            this.linha.moveTo(this.origemLinha.x, this.origemLinha.y);
            this.linha.lineTo(this.anzol.x, this.anzol.y - 40);
            this.linha.strokePath();
        }

        // Redirecionar para tela de início ao apertar ESC após game over
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(this.teclaESC)) {
            this.scene.restart();
        }
    }

    criarPeixe() {

        // Definição dos tipos de peixe
        const tipos = [
            { key: 'peixe_pequeno', pontos: 1, vel: 200 },
            { key: 'peixe_medio', pontos: 3, vel: 160 },
            { key: 'peixe_grande', pontos: 5, vel: 120 },
            { key: 'lixo', pontos: -10, vel: 180 },
            { key: 'dourado', pontos: 10, vel: 200 }
        ];

        let t = Phaser.Utils.Array.GetRandom(tipos);

        let y = Phaser.Math.Between(200, 550);

        let spriteKey = t.key;

        if (t.key === 'lixo') {
            spriteKey = Phaser.Utils.Array.GetRandom(['lixo', 'lixo2', 'lixo3']);
        }

        if (t.key === 'dourado') {
            if (this.etapaAtual < this.douradosOrdem.length) {
                spriteKey = this.douradosOrdem[this.etapaAtual];
            } else {
                spriteKey = Phaser.Utils.Array.GetRandom(this.douradosOrdem);
            }
        }

        // Criação do peixe na tela
        let peixe = this.grupoPeixes.create(0, y, spriteKey);

        peixe.setVelocityX(t.vel);
        let escala = 0.3;
        if (spriteKey === 'dourado4') {
            escala = 0.2;
        }

        peixe.setScale(escala);

        peixe.pontos = t.pontos;
        peixe.tipo = spriteKey;

        // Hitbox do peixe
        peixe.body.setCircle(13);
        peixe.body.setOffset(90, 60);

        peixe.body.setCircle(peixe.width / 4);
    }

    pegarPeixe(anzol, peixe) {
        // Impede ações após fim do jogo
        if (this.gameOver) return;

        // Pegar o lixo
        if (peixe.tipo.includes('lixo')) {
            this.finalizar(false);
            return;
        }

        // Pegando os dourados
        if (peixe.tipo.includes('dourado')) {
            let etapa = this.mapaCards[peixe.tipo];
            if (!this.colecao[etapa]) {

                // Adiciona ícone no topo
                this.adicionarNaColecao(peixe.tipo, etapa);
                this.douradosColetados++;

                // Abre automaticamente
                this.mostrarInfo(etapa);
                this.etapaAtual++;
            }
        }

        this.pontuacao += peixe.pontos;
        peixe.destroy();

        this.placar.setText('Pontos: ' + this.pontuacao);

        // Vitória
        if (this.pontuacao >= this.meta && this.douradosColetados >= 4) {
            this.finalizar(true);
        }
    }

    adicionarNaColecao(tipoIcone, tipoCard) {
        if (this.colecao[tipoCard]) return;

        this.colecao[tipoCard] = true;

        let escala = 0.20;

        if (tipoIcone === 'dourado4') {
            escala = 0.14;
        }

        let icone = this.add.image(0, 0, tipoIcone)
            .setScale(escala)
            .setDepth(10);

        this.icones.push(icone);

        this.organizarIcones();

        icone.setInteractive({ useHandCursor: true });

        icone.on('pointerdown', () => {
            this.mostrarInfo(tipoCard);
        });
    }

    mostrarInfo(tipo) {

        // Sempre abre
        this.jogoPausado = true;

        this.physics.pause();
        this.spawnPeixes.paused = true;

        this.botaoFechar.setVisible(true);

        this.overlay.setVisible(true);
        this.cardInfo.setVisible(true);

        this.cardInfo.setTexture(tipo);
    }

    fecharInfo() {
        this.jogoPausado = false;

        this.physics.resume();
        this.spawnPeixes.paused = false;

        this.botaoFechar.setVisible(false);

        this.overlay.setVisible(false);
        this.cardInfo.setVisible(false);
    }

    organizarIcones() {

        // Organização dos icones
        let espacamento = 60;

        let inicioX = this.larguraJogo - 40;
        let y = 140;

        this.icones.forEach((icone, i) => {
            icone.x = inicioX - (i * espacamento);
            icone.y = y;
        });
    }

    finalizar(vitoria) {
        this.gameOver = true;
        this.physics.pause();
        this.spawnPeixes.remove();

        if (vitoria) {
            this.registry.set('fase2Completa', true);
            this.registry.set('quadroLido', false);

            if (this.game.fase2) {
                this.game.fase2.stop();
                this.game.fase2 = null;
            }

            this.time.delayedCall(2000, () => {
                const cx = this.larguraJogo / 2;
                const cy = this.alturaJogo / 2;

                const overlay = this.add.image(cx, cy, "conclusao2")
                    .setDisplaySize(this.larguraJogo, this.alturaJogo)
                    .setDepth(50)
                    .setAlpha(0)
                    .setInteractive();

                this.tweens.add({
                    targets: overlay, alpha: 1, duration: 500,

                    onComplete: () => {

                        // Espera 2 segundos
                        this.time.delayedCall(1250, () => {

                            // Fade out
                            this.tweens.add({
                                targets: overlay,
                                alpha: 0,
                                duration: 400,
                                onComplete: () => {
                                    this.scene.start("Room", {
                                        personagem: this.registry.get('personagem') ?? 0,
                                        spawnX: 700,
                                        spawnY: 450
                                    });
                                }
                            });

                        });

                    }
                });

                overlay.on("pointerdown", () => {
                    this.scene.start("Room", { personagem: this.registry.get('personagem') ?? 0, spawnX: 700, spawnY: 450 });
                });
            });
        } else {
            this.mostrarGameOver();
        }
    }

    mostrarGameOver() {
        const cx = this.larguraJogo / 2;
        const cy = this.alturaJogo / 2;

        const overlay = this.add.image(cx, cy, "gameOver")
            .setDisplaySize(this.larguraJogo, this.alturaJogo)
            .setDepth(50)
            .setAlpha(0)
            .setInteractive();

        this.tweens.add({ targets: overlay, alpha: 1, duration: 500 });
    }
}
