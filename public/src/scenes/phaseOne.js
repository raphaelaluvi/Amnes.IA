export class PhaseOne extends Phaser.Scene {

    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        super("PhaseOne");
    }

    preload() {
        this.load.image("fundo", "public/assets/phaseOne/fundo.jpg");
        this.load.image("jogoUm", "public/assets/phaseOne/fundoJogoUm.jpg");
        this.load.image("quinaCerta", "public/assets/phaseOne/quinaCerta.jpg");
        this.load.image("quinaErrada", "public/assets/phaseOne/quinaErrada.jpg");
        this.load.image("retoCerto", "public/assets/phaseOne/retoCerto.jpg");
        this.load.image("retoErrado", "public/assets/phaseOne/retoErrado.jpg");
        this.load.image("card", "public/assets/phaseOne/card/teste.jpg");
        this.load.image("cardCerto", "public/assets/phaseOne/card/cardCerto.jpg");
        this.load.image("cursorMao", "public/assets/phaseOne/cursor_mao.webp");

        // Puxa imgs dos cards certos
        this.load.image("cardCertoI", "public/assets/phaseOne/card/cardCertoI.jpg");
        this.load.image("cardCertoII", "public/assets/phaseOne/card/cardCertoII.jpg");
        this.load.image("cardCertoIII", "public/assets/phaseOne/card/cardCertoIII.jpg");
        this.load.image("cardCertoIV", "public/assets/phaseOne/card/cardCertoIV.jpg");
        this.load.image("cardCertoV", "public/assets/phaseOne/card/cardCertoV.jpg");
        this.load.image("cardCertoVI", "public/assets/phaseOne/card/cardCertoVI.jpg");
        this.load.image("cardCertoVII", "public/assets/phaseOne/card/cardCertoVII.jpg");
        this.load.image("cardCertoVIII", "public/assets/phaseOne/card/cardCertoVIII.jpg");

        // Puxa imgs dos cards errados
        this.load.image("cardErradoI1", "public/assets/phaseOne/card/cardErradoI1.jpg");
        this.load.image("cardErradoI2", "public/assets/phaseOne/card/cardErradoI2.jpg");
        this.load.image("cardErradoI3", "public/assets/phaseOne/card/cardErradoI3.jpg");

        this.load.image("cardErradoII1", "public/assets/phaseOne/card/cardErradoII1.jpg");
        this.load.image("cardErradoII2", "public/assets/phaseOne/card/cardErradoII2.jpg");
        this.load.image("cardErradoII3", "public/assets/phaseOne/card/cardErradoII3.jpg");

        this.load.image("cardErradoIII1", "public/assets/phaseOne/card/cardErradoIII1.jpg");
        this.load.image("cardErradoIII2", "public/assets/phaseOne/card/cardErradoIII2.jpg");
        this.load.image("cardErradoIII3", "public/assets/phaseOne/card/cardErradoIII3.jpg");

        this.load.image("cardErradoIV1", "public/assets/phaseOne/card/cardErradoIV1.jpg");
        this.load.image("cardErradoIV2", "public/assets/phaseOne/card/cardErradoIV2.jpg");
        this.load.image("cardErradoIV3", "public/assets/phaseOne/card/cardErradoIV3.jpg");

        this.load.image("cardErradoV1", "public/assets/phaseOne/card/cardErradoV1.jpg");
        this.load.image("cardErradoV2", "public/assets/phaseOne/card/cardErradoV2.jpg");
        this.load.image("cardErradoV3", "public/assets/phaseOne/card/cardErradoV3.jpg");

        this.load.image("cardErradoVI1", "public/assets/phaseOne/card/cardErradoVI1.jpg");
        this.load.image("cardErradoVI2", "public/assets/phaseOne/card/cardErradoVI2.jpg");
        this.load.image("cardErradoVI3", "public/assets/phaseOne/card/cardErradoVI3.jpg");

        this.load.image("cardErradoVII1", "public/assets/phaseOne/card/cardErradoVII1.jpg");
        this.load.image("cardErradoVII2", "public/assets/phaseOne/card/cardErradoVII2.jpg");
        this.load.image("cardErradoVII3", "public/assets/phaseOne/card/cardErradoVII3.jpg");

        this.load.image("cardErradoVIII1", "public/assets/phaseOne/card/cardErradoVIII1.jpg");
        this.load.image("cardErradoVIII2", "public/assets/phaseOne/card/cardErradoVIII2.jpg");
        this.load.image("cardErradoVIII3", "public/assets/phaseOne/card/cardErradoVIII3.jpg");
        this.load.image("conclusao1", "public/assets/phaseOne/conclusao1.webp");
        this.load.image("options", "public/assets/options.webp");
    }

    create() {
        this.events.on("shutdown", () => {
            if (this.game.fase1) {
                this.game.fase1.stop();
                this.game.fase1 = null;
            }
        });

        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "PhaseOne" });
            this.scene.pause("PhaseOne");
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.launch("Pause", { from: "PhaseOne" });
            this.scene.pause("PhaseOne");
        });

        this.acertou = false;
        this.rodadaAtual = 0;

        // Imagens de fundo
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "fundo").setScale(0.7);
        this.add.image((this.larguraJogo / 2) * 1.25, 350, "jogoUm").setScale(0.55);

        // Criação dos cards (depth 2 para ficarem acima dos fios)
        this.card = [];
        this.card[0] = this.add.image(140, 180, "card").setScale(0.11).setInteractive().setDepth(2);
        this.card[1] = this.add.image(140, 290, "card").setScale(0.11).setInteractive().setDepth(2);
        this.card[2] = this.add.image(140, 400, "card").setScale(0.11).setInteractive().setDepth(2);
        this.card[3] = this.add.image(140, 510, "card").setScale(0.11).setInteractive().setDepth(2);

        // Tornando cada elemento "arrastável"
        this.input.on('dragstart', (_pointer, gameObject) => {
            gameObject.setDepth(3); // fica na frente de tudo durante o arrasto

            // Se o jogador começar a arrastar na rodada 0, cancela a animação da mão
            if (this.rodadaAtual === 0) {
                this.limparDicaMao();
            }
        });
        this.input.on('drag', (_pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        // Ao soltar, cards errados voltam para o lugar de origem
        this.input.on('dragend', (_pointer, gameObject) => {
            gameObject.setDepth(2); // volta ao depth normal
            const indice = this.card.indexOf(gameObject);
            const cardCerto = this.configRodada.indiceCerto;
            const alvo = this.configRodada.alvo;
            const distancia = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, alvo.x, alvo.y);

            if (indice !== cardCerto || distancia >= 50) {
                this.tweens.add({
                    targets: gameObject,
                    x: 140,
                    y: 180 + indice * 110,
                    duration: 300,
                    ease: 'Back.Out'
                });
            }
        });

        // Configurações para cada card
        for (let i = 0; i < this.card.length; i++) {
            this.input.setDraggable(this.card[i]);

            // Aumenta tamanho e muda o cursor ao passar o mouse
            this.card[i].on("pointerover", () => {
                this.card[i].setScale(0.12);
                this.input.setDefaultCursor("pointer");
            });
            // Diminui o tamanho e volta p cursor para setinha
            this.card[i].on("pointerout", () => {
                this.card[i].setScale(0.11);
                this.input.setDefaultCursor("default");
            });
        }

        // Criar "fio" errados
        this.quinaErrada1 = this.add.image(370, 345, "quinaErrada").setScale(0.11).setInteractive();
        this.retoErrado1 = this.add.image(470, 345, "retoErrado").setScale(0.11).setInteractive();
        this.retoErrado2 = this.add.image(572, 345, "retoErrado").setAngle(90).setScale(0.11).setInteractive();
        this.quinaErrada2 = this.add.image(675, 345, "quinaErrada").setScale(0.11).setInteractive().setFlipX(true);
        this.quinaErrada3 = this.add.image(675, 245, "quinaErrada").setScale(0.11).setInteractive().setFlipY(true);
        this.quinaErrada4 = this.add.image(775, 245, "quinaErrada").setScale(0.11).setInteractive().setFlip(true, true);
        this.retoErrado3 = this.add.image(775, 345, "retoErrado").setScale(0.11).setInteractive();
        this.quinaErrada5 = this.add.image(775, 445, "quinaErrada").setScale(0.11).setInteractive().setFlipX(true);

        // Mostra qual alvo muda em cada rodada e qual card deve mudar de textura para certo
        this.rodadas = [
            {
                cards: ["cardErradoI1", "cardCertoI", "cardErradoI2", "cardErradoI3"],
                indiceCerto: 1,
                alvo: this.quinaErrada1,
                texturaCerta: "quinaCerta",
                flipX: true,
                flipY: true
            },
            {
                cards: ["cardCertoII", "cardErradoII1", "cardErradoII2", "cardErradoII3"],
                indiceCerto: 0,
                alvo: this.retoErrado1,
                texturaCerta: "retoCerto"
            },
            {
                cards: ["cardErradoIII1", "cardErradoIII2", "cardCertoIII", "cardErradoIII3"],
                indiceCerto: 2,
                alvo: this.retoErrado2,
                texturaCerta: "retoCerto",
                angle: 180
            },
            {
                cards: ["cardErradoIV1", "cardErradoIV2", "cardErradoIV3", "cardCertoIV"],
                indiceCerto: 3,
                alvo: this.quinaErrada2,
                texturaCerta: "quinaCerta",
                flipX: false,
                flipY: true
            },
            {
                cards: ["cardCertoV", "cardErradoV2", "cardErradoV3", "cardErradoV1"],
                indiceCerto: 0,
                alvo: this.quinaErrada3,
                texturaCerta: "quinaCerta",
                flipX: true,
                flipY: false
            },
            {
                cards: ["cardErradoVI1", "cardCertoVI", "cardErradoVI2", "cardErradoVI3"],
                indiceCerto: 1,
                alvo: this.quinaErrada4,
                texturaCerta: "quinaCerta",
                flipX: false,
                flipY: false
            },
            {
                cards: ["cardErradoVII1", "cardErradoVII2", "cardErradoVII3", "cardCertoVII"],
                indiceCerto: 3,
                alvo: this.retoErrado3,
                texturaCerta: "retoCerto",
                angle: 90
            },
            {
                cards: ["cardErradoVIII1", "cardErradoVIII2", "cardCertoVIII", "cardErradoVIII3"],
                indiceCerto: 2,
                alvo: this.quinaErrada5,
                texturaCerta: "quinaCerta",
                flipX: true,
                flipY: true
            }
        ];

        // Puxa a função para iniciar a rodada
        this.iniciarRodada();
    }

    limparDicaMao() {
        if (this.cursorMaoDica) {
            this.tweens.killTweensOf(this.cursorMaoDica);
            this.cursorMaoDica.destroy();
            this.cursorMaoDica = null;
        }
        if (this.tweenMao) {
            this.tweenMao.stop();
            this.tweenMao = null;
        }
        if (this.timerDica) {
            this.timerDica.remove();
            this.timerDica = null;
        }
    }

    iniciarRodada() {

        this.acertou = false;

        // Remove efeito de pulso anterior se existir
        if (this.tweenAlvo) {
            this.tweenAlvo.stop();
            this.tweenAlvo = null;
        }

        // Limpa dica da mão anterior se existir
        this.limparDicaMao();

        // Resetar posição dos cards ao iniciar uma nova rodada
        this.card.forEach((c, i) => {
            c.setVisible(true);
            c.x = 140;
            c.y = 180 + (i * 110);

            // Atualiza a config da rodada atual
            this.configRodada = this.rodadas[this.rodadaAtual];

            // Atualiza a textura de cada card de acordo com a config da rodada
            c.setTexture(this.configRodada.cards[i]);
            c.input.hitArea.setTo(0, 0, c.frame.realWidth, c.frame.realHeight);

            this.input.setDraggable(c, true);
        });

        // Efeito de pulso no alvo da rodada
        const alvo = this.configRodada.alvo;
        alvo.setTint(0xffff00);

        this.tweenAlvo = this.tweens.add({
            targets: alvo,
            scaleX: 0.135,
            scaleY: 0.135,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Animação da mão apenas na rodada 0, após 5 segundos
        if (this.rodadaAtual === 0) {
            const indice = this.configRodada.indiceCerto;
            const card = this.card[indice];

            const origemX = card.x;
            const origemY = card.y;
            const destinoX = alvo.x;
            const destinoY = alvo.y;

            const animarMao = () => {
                // Segurança: se a mão foi destruída ou rodada avançou, para
                if (!this.cursorMaoDica || this.rodadaAtual !== 0 || this.acertou) return;

                // Reseta posição e transparência
                this.cursorMaoDica.setPosition(origemX, origemY).setAlpha(0);

                // Fade in
                this.tweens.add({
                    targets: this.cursorMaoDica,
                    alpha: 1,
                    duration: 200,
                    onComplete: () => {
                        if (!this.cursorMaoDica || this.rodadaAtual !== 0 || this.acertou) return;

                        // Move do card até o alvo
                        this.tweenMao = this.tweens.add({
                            targets: this.cursorMaoDica,
                            x: destinoX,
                            y: destinoY,
                            duration: 1000,
                            ease: 'Sine.easeInOut',
                            onComplete: () => {
                                if (!this.cursorMaoDica || this.rodadaAtual !== 0 || this.acertou) return;

                                // Pausa breve sobre o alvo
                                this.time.delayedCall(400, () => {
                                    if (!this.cursorMaoDica || this.rodadaAtual !== 0 || this.acertou) return;

                                    // Fade out
                                    this.tweens.add({
                                        targets: this.cursorMaoDica,
                                        alpha: 0,
                                        duration: 200,
                                        onComplete: () => {
                                            // Pausa antes de repetir o loop
                                            this.time.delayedCall(600, () => {
                                                animarMao();
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            };

            // Cria o sprite da mão já posicionado sobre o card correto, invisível
            this.cursorMaoDica = this.add.image(origemX, origemY, "cursorMao")
                .setScale(0.08)
                .setDepth(10)
                .setAlpha(0);

            // Aguarda 5 segundos antes de mostrar a dica
            this.timerDica = this.time.delayedCall(3000, () => {
                if (this.rodadaAtual === 0 && !this.acertou) {
                    animarMao();
                }
            });
        }
    }

    update() {
        // Variável para indicar o card certo e o alvo
        const indice = this.configRodada.indiceCerto; // pega o índice do card certo
        const card = this.card[indice];               // pega o card correto da rodada
        const alvo = this.configRodada.alvo;          // pega o alvo

        // Calcula a distância
        const distancia = Phaser.Math.Distance.Between(
            card.x, card.y,
            alvo.x, alvo.y
        );

        // Verifica se está próximo
        if (!this.acertou && distancia < 50) {
            alvo.setTexture(this.configRodada.texturaCerta); // muda apenas a imagem do alvo

            this.input.setDraggable(card, false);

            if (this.configRodada.flipX !== undefined)
                alvo.setFlip(this.configRodada.flipX, this.configRodada.flipY);

            if (this.configRodada.angle !== undefined)
                alvo.setAngle(this.configRodada.angle);

            this.acertou = true;
            card.setVisible(false); // esconde o card que acertou

            // Cancela a dica da mão ao acertar
            this.limparDicaMao();

            this.time.delayedCall(800, () => {
                this.proximaRodada();
            });
        }
    }

    proximaRodada() {
        // Remove tint e efeitos do alvo anterior
        if (this.configRodada && this.configRodada.alvo) {
            this.configRodada.alvo.clearTint();
            this.configRodada.alvo.setScale(0.11);
        }

        if (this.tweenAlvo) {
            this.tweenAlvo.stop();
            this.tweenAlvo = null;
        }

        // Acrescenta um, para mudar a posição no array
        this.rodadaAtual++;

        // Condição para verificar se a rodada atual é maior ou igual que o comprimento do array
        if (this.rodadaAtual >= this.rodadas.length) {
            console.log("Terminou todas as rodadas!");
            this.registry.set('fase1Completa', true);
            this.registry.set('quadroLido', false);
            this.mostrarParabens();
            return;
        }

        this.iniciarRodada();
    }

    mostrarParabens() {
        const cx = this.larguraJogo / 2;
        const cy = this.alturaJogo / 2;

        this.add.rectangle(this.larguraJogo / 2, this.alturaJogo / 2, this.larguraJogo, this.alturaJogo, 0x000000, 0.55).setDepth(19);;

        const overlay = this.add.image(cx, cy, "conclusao1")
            .setDisplaySize(this.larguraJogo, this.alturaJogo)
            .setDepth(20)
            .setAlpha(0)
            .setInteractive();

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {

                // Espera 2 segundos
                this.time.delayedCall(1250, () => {

                    // Fade out
                    this.tweens.add({
                        targets: overlay,
                        alpha: 0,
                        duration: 250,
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
    }
}