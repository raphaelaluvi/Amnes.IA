// Exporta classe Room
export class Room extends Phaser.Scene {

    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        super("Room");
    }

    init(data) {
        // Recebe qual personagem foi selecionado
        this.personagemNum = data.personagem ?? 0;
        this.spawnX = data.spawnX ?? 250;
        this.spawnY = data.spawnY ?? 400;
        this.test = data.test ?? 1;
    }

    preload() {
        this.load.on('loaderror', () => { });
        this.load.image("room", "public/assets/quarto.webp");
        this.load.image("player1Sheet", "public/assets/personagem1.webp");
        this.load.image("player2Sheet", "public/assets/personagem2.webp");
        this.load.image("player3Sheet", "public/assets/personagem3.webp");
        this.load.image("tecla", "public/assets/tecla.webp")
        this.load.image("tecla2", "public/assets/tecla2.webp")
        this.load.image("exclamacao", "public/assets/exclamacao.webp");
        this.load.image("setas", "public/assets/setas.webp");
        this.load.image("options", "public/assets/options.webp");
        this.load.audio("quarto", "public/assets/musicas/quarto.mp3");
    }

    create() {
        try {
            if ((!this.game.quarto || !this.game.quarto.isPlaying) && this.cache.audio.exists("quarto")) {
                this.game.quarto = this.sound.add("quarto", { loop: true, volume: 0.1 });
                this.game.quarto.play();
            }
        } catch (e) { }

        const iniciarCena = (sceneKey, data = {}, manterMusicaQuarto = false) => {
            if (!manterMusicaQuarto && this.game.quarto) {
                this.game.quarto.stop();
                this.game.quarto = null;
            }
            this.scene.start(sceneKey, data);
        };

        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "room").setScale(0.85);

        // Config para cada personagem
        const configs = [
            { key: "player1Sheet", startX: 0, frameW: 130, frames: 8, y: 460, h: 128, scale: 1.2 },
            { key: "player2Sheet", startX: 200, frameW: 94, frames: 7, y: 469, h: 110, scale: 1.5 },
            { key: "player3Sheet", startX: 206, frameW: 93, frames: 7, y: 470, h: 107, scale: 1.5 },
        ];

        // Seleciona a config do personagem ou define a primeira como padrão
        const config = configs[this.personagemNum] ?? configs[0];
        // Carrega os frames do personagem
        const sheetKey = config.key;

        // Define os frames recortando exatamente a área do personagem
        const tex = this.textures.get(sheetKey);
        for (let i = 0; i < config.frames; i++) {
            tex.add(i, 0, config.startX + i * config.frameW, config.y, config.frameW, config.h);
        } // Cria o sprite usando a textura e o primeiro frame

        this.player = this.physics.add.sprite(this.spawnX, this.spawnY, sheetKey, 0).setScale(config.scale);

        this.tecla = this.add.image(820, 200, "tecla").setScale(0.3).setVisible(false);

        this.tecla2 = this.add.image(850, 145, "tecla2").setScale(0.05).setVisible(false);

        // Animação da exclamacao acima do computador
        this.exclamacao = this.add.image(762, 135, "exclamacao")
            .setScale(0.1);
        this.tweens.add({
            targets: this.exclamacao,
            y: 143,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.setas = this.add.image(100, 530, "setas").setScale(0.20);

        this.player.body.setAllowGravity(false);

        // Cria as animações de andar e parado, removendo as anteriores
        if (this.anims.exists("andar")) this.anims.remove("andar");
        if (this.anims.exists("parado")) this.anims.remove("parado");

        // Cria as animações usando os frames
        this.anims.create({
            key: "andar",
            frames: Array.from({ length: config.frames }, (_, i) => ({ key: sheetKey, frame: i })),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "parado",
            frames: [{ key: sheetKey, frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.areaMovimento = new Phaser.Geom.Rectangle(
            65,   // x inicial
            400,   // y inicial
            900,   // largura
            100    // altura
        );

        // Configura as setas do teclado para movimentação
        this.cursors = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });


        // Botão de pause no topo
        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            this.scene.launch("Pause", { from: "Room" });
            this.scene.pause("Room");
        });

        // ESC abre o pause
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.launch("Pause", { from: "Room" });
            this.scene.pause("Room");
        });



        // E só funciona se o jogador já visitou o quadro após a última fase concluída
        this.quadroLido = this.registry.get('quadroLido') !== false;

        // Utiliza o E para mudar de cena (só funciona perto do computador e se quadroLido)
        this.input.keyboard.on('keydown-E', () => {
            if (!this.quadroLido) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 750, 300)
            if (dist <= 200) {
                if (this.registry.get('fase3Completa')) {
                    iniciarCena("animacaoPhase4");
                } else if (this.registry.get('fase2Completa')) {
                    iniciarCena("DescricaoPhaseThree");
                } else if (this.registry.get('fase1Completa')) {
                    iniciarCena("InicioPhaseTwo");
                } else {
                    iniciarCena("DescricaoPhaseOne");
                }
            }
        });

        // Utiliza o Q para ir ao quadro (só funciona perto do computador)
        this.input.keyboard.on('keydown-Q', () => {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 750, 300);
            if (dist <= 200) {
                iniciarCena("quadro", {}, true);
            }
        });
    }

    update() {
        const movendo = this.cursors.left.isDown || this.cursors.right.isDown ||
            this.cursors.up.isDown || this.cursors.down.isDown;

        // Movimenta o personagem de acordo com as setas pressionadas
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocityY(0);
        }

        if (movendo) {
            this.player.anims.play("andar", true);
        } else {
            this.player.anims.play("parado", true);
        }

        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            this.areaMovimento.x,
            this.areaMovimento.x + this.areaMovimento.width
        );

        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            this.areaMovimento.y,
            this.areaMovimento.y + this.areaMovimento.height
        );

        const player = this.player;
        const distancia = Phaser.Math.Distance.Between(player.x, player.y, 750, 300);

        // Mostra/esconde a tecla E conforme proximidade e se quadroLido
        if (distancia <= 200 && this.quadroLido) {
            this.tecla.setVisible(true);
        } else {
            this.tecla.setVisible(false);
        }

        // Exclamação: sempre visível antes de qualquer fase; some apenas após conclusão de fase (até visitar o quadro)
        const algumFaseCompleta = this.registry.get('fase1Completa') || this.registry.get('fase2Completa') || this.registry.get('fase3Completa');
        if (!algumFaseCompleta || this.quadroLido) {
            this.exclamacao.setVisible(true);
        } else {
            this.exclamacao.setVisible(false);
        }

        // Mostra/esconde a tecla Q junto com a tecla E (mesma área do computador)
        if (distancia <= 200) {
            this.tecla2.setVisible(true);
        } else {
            this.tecla2.setVisible(false);
        }
    }
}
