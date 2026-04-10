export class RoboConectaBalloes extends Phaser.Scene {

    larguraJogo = 1000;
    alturaJogo = 600;
    floorY = 560;
    velocidade = 200;

    escalaBalao = 1.5;
    escalaRobo = 0.28;
    escalaImagem = 0.50;

    colunaEsqX = 80;
    colunaDirX = 920;
    balaoYTopo = 180;
    balaoYBase = 520;

    // Definindo os balões com suas cores e imagens correspondentes
    cores = [
        { nome: "decisao", asset: "balao_azul", wire: 0x44aaff, lado: "esq", imagemInfo: { asset: "decisao" } },
        { nome: "preditiva", asset: "balao_azul", wire: 0x44aaff, lado: "esq", imagemInfo: { asset: "preditiva" } },
        { nome: "visao", asset: "balao_azul", wire: 0x44aaff, lado: "esq", imagemInfo: { asset: "visao" } },
        { nome: "generativa", asset: "balao_azul", wire: 0x44aaff, lado: "esq", imagemInfo: { asset: "generativa" } },
        { nome: "decisao", asset: "balao_azul", wire: 0x44aaff, lado: "dir", imagemInfo: { asset: "iaDecisao" } },
        { nome: "generativa", asset: "balao_azul", wire: 0x44aaff, lado: "dir", imagemInfo: { asset: "iaGenerativa" } },
        { nome: "preditiva", asset: "balao_azul", wire: 0x44aaff, lado: "dir", imagemInfo: { asset: "iaPreditiva" } },
        { nome: "visao", asset: "balao_azul", wire: 0x44aaff, lado: "dir", imagemInfo: { asset: "iaVisao" } },
    ];

    nivelAtual = 0;
    imagemAtual = null;
    balaoAtivo = null;

    constructor() {
        super("RoboConectaBalloes");
    }

    preload() {
        const assetsPath = "public/assets/phaseThree/";

        this.load.image("fundo3", assetsPath + "fundo.jpeg");
        this.load.image("heroi_parado", "public/assets/heroi_parado.webp");
        this.load.image("balao_azul", assetsPath + "balao_azul.webp");
        this.load.image("decisao", assetsPath + "decisao.webp");
        this.load.image("preditiva", assetsPath + "preditiva.webp");
        this.load.image("visao", assetsPath + "visao.webp");
        this.load.image("generativa", assetsPath + "generativa.webp");
        this.load.image("iaDecisao", assetsPath + "iaDecisao.webp");
        this.load.image("iaGenerativa", assetsPath + "iaGenerativa.webp");
        this.load.image("iaPreditiva", assetsPath + "iaPreditiva.webp");
        this.load.image("iaVisao", assetsPath + "iaVisao.webp");
        this.load.image("conclusao3", assetsPath + "conclusao3.webp");
        this.load.image("options", "public/assets/options.webp");
        this.load.image("fundoAba", assetsPath + "fundoAbas.jpg");
    }

    create() {
        this.events.on("shutdown", () => {
            if (this.game.fase3) {
                this.game.fase3.stop();
                this.game.fase3 = null;
            }
        });

        // Variáveis
        this.baloes = [];
        this.fiosPermanentes = [];
        this.fioAtual = null;
        this.balaoCarregando = null;
        this.totalConexoes = 0;
        this.jogoAtivo = false;

        // Teclado
        this.cursors = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });
        this.teclaAcao = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.teclaSoltar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Botão pause
        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            if (!this.jogoAtivo) return;
            this.scene.launch("Pause", { from: "RoboConectaBalloes" });
            this.scene.pause("RoboConectaBalloes");
        });
        this.input.keyboard.on("keydown-ESC", () => {
            if (!this.jogoAtivo) return;
            this.scene.launch("Pause", { from: "RoboConectaBalloes" });
            this.scene.pause("RoboConectaBalloes");
        });

        // Fundo
        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "fundoAba")
            .setScale(0.7);

        this.add.image(this.larguraJogo / 2, this.alturaJogo / 2 + 80, "fundo3").setScale(0.74);
        // Layers
        this.layerFios = this.add.layer();
        this.layerBaloes = this.add.layer();
        this.layerRobo = this.add.layer();
        this.layerFx = this.add.layer();
        this.layerImagens = this.add.layer();

        // Robô
        this.imgRobo = this.add.image(this.larguraJogo / 2, this.floorY - 20, "heroi_parado").setScale(this.escalaRobo);
        this.layerRobo.add(this.imgRobo);

        this.carregarNivel();
        this.jogoAtivo = true;
    }

    update(t, delta) {
        if (!this.jogoAtivo) return;
        this.moverRobo(delta);
        this.atualizarFio();
        this.verificarTeclas();
        this.verificarProximidadeBaloes();
    }

    carregarNivel() {
        this.baloes.forEach(b => b.img.destroy());
        this.baloes = [];
        this.fiosPermanentes.forEach(f => f.destroy());
        this.fiosPermanentes = [];
        if (this.fioAtual) { this.fioAtual.destroy(); this.fioAtual = null; }
        this.balaoCarregando = null;
        this.totalConexoes = 0;

        if (this.imagemAtual) {
            this.imagemAtual.destroy();
            this.imagemAtual = null;
            this.balaoAtivo = null;
        }

        const baloesEsq = this.cores.filter(c => c.lado === "esq");
        const baloesDir = this.cores.filter(c => c.lado === "dir");

        const esq = Phaser.Utils.Array.Shuffle([...baloesEsq]);
        const dir = Phaser.Utils.Array.Shuffle([...baloesDir]);
        const posE = this.posicoes(4, "esq");
        const posD = this.posicoes(4, "dir");

        esq.forEach((c, i) => this.criarBalao(posE[i].x, posE[i].y, c));
        dir.forEach((c, i) => this.criarBalao(posD[i].x, posD[i].y, c));

        this.imgRobo.setPosition(this.larguraJogo / 2, this.floorY - 20);
    }

    posicoes(n, lado) {
        const cx = lado === "esq" ? this.colunaEsqX : this.colunaDirX;
        const rowH = (this.balaoYBase - this.balaoYTopo) / (n - 1);
        const pos = [];
        for (let i = 0; i < n; i++)
            pos.push({ x: cx, y: this.balaoYTopo + i * rowH });
        return pos;
    }

    criarBalao(x, y, corDef) {
        const img = this.add.image(x, y, corDef.asset).setScale(this.escalaBalao);
        this.layerBaloes.add(img);

        this.tweens.add({
            targets: img, y: y - 10,
            duration: 1400 + Math.random() * 600,
            yoyo: true, repeat: -1, ease: "Sine.InOut",
            delay: Math.random() * 800,
        });

        img.setAlpha(0).setScale(0.1);
        this.tweens.add({
            targets: img, scaleX: this.escalaBalao, scaleY: this.escalaBalao, alpha: 1,
            duration: 300, ease: "Back.Out", delay: Math.random() * 400,
        });

        this.baloes.push({ img, corDef, lado: corDef.lado, conectado: false, tweenDeriva: null, imagemInfo: corDef.imagemInfo });
    }

    verificarProximidadeBaloes() {
        const distProximidade = 85;
        const rx = this.imgRobo.x, ry = this.imgRobo.y;

        let balaoMaisProximo = null;
        let menorDistancia = distProximidade;

        this.baloes.forEach(b => {
            if (b.conectado) return;
            const d = Phaser.Math.Distance.Between(rx, ry, b.img.x, b.img.y);
            if (d < menorDistancia) { menorDistancia = d; balaoMaisProximo = b; }
        });

        if (balaoMaisProximo && balaoMaisProximo !== this.balaoAtivo) {
            this.exibirImagemCentral(balaoMaisProximo.imagemInfo);
            this.balaoAtivo = balaoMaisProximo;
        } else if (!balaoMaisProximo && this.imagemAtual) {
            this.removerImagemCentral();
            this.balaoAtivo = null;
        }
    }

    exibirImagemCentral(imagemInfo) {
        if (!imagemInfo.asset) { this.removerImagemCentral(); return; }
        if (this.imagemAtual) { this.imagemAtual.destroy(); this.imagemAtual = null; }

        this.imagemAtual = this.add.image(this.larguraJogo / 2, this.alturaJogo / 2 + 60, imagemInfo.asset)
            .setScale(0).setDepth(1000);
        this.layerImagens.add(this.imagemAtual);

        this.tweens.add({
            targets: this.imagemAtual,
            scaleX: this.escalaImagem, scaleY: this.escalaImagem,
            duration: 150, ease: "Back.Out"
        });
    }

    removerImagemCentral() {
        if (!this.imagemAtual) return;
        this.tweens.add({
            targets: this.imagemAtual,
            scaleX: 0, scaleY: 0, alpha: 0,
            duration: 100, ease: "Back.In",
            onComplete: () => {
                if (this.imagemAtual) { this.imagemAtual.destroy(); this.imagemAtual = null; }
            }
        });
    }

    moverRobo(delta) {
        const dt = delta / 1000;
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown) { vx = -this.velocidade; this.imgRobo.setFlipX(true); }
        if (this.cursors.right.isDown) { vx = this.velocidade; this.imgRobo.setFlipX(false); }
        if (this.cursors.up.isDown) { vy = -this.velocidade; }
        if (this.cursors.down.isDown) { vy = this.velocidade; }

        this.imgRobo.x = Phaser.Math.Clamp(this.imgRobo.x + vx * dt, 50, this.larguraJogo - 50);
        this.imgRobo.y = Phaser.Math.Clamp(this.imgRobo.y + vy * dt, 175, this.alturaJogo - 30);

        const inclinacao = Phaser.Math.Clamp(vy * 0.08, -12, 12);
        this.imgRobo.setAngle(inclinacao);
    }

    atualizarFio() {
        if (!this.fioAtual || !this.balaoCarregando) return;
        const g = this.fioAtual;
        const de = this.balaoCarregando.img;
        const para = this.imgRobo;
        g.clear();
        const steps = Math.max(4, Math.floor(Phaser.Math.Distance.Between(de.x, de.y, para.x, para.y) / 6));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Phaser.Math.Linear(de.x, para.x, t);
            const sag = Math.sin(t * Math.PI) * 20;
            const y = Phaser.Math.Linear(de.y + 15, para.y, t) + sag;
            g.fillStyle(this.balaoCarregando.corDef.wire, 0.9);
            g.fillRect(x - 3, y - 3, 6, 6);
        }
        g.fillStyle(0xffcc00, 1);
        g.fillRect(para.x - 4, para.y - 4, 8, 8);
    }

    verificarTeclas() {
        if (Phaser.Input.Keyboard.JustDown(this.teclaAcao)) this.interagir();
        if (Phaser.Input.Keyboard.JustDown(this.teclaSoltar)) this.soltarFio();
    }

    interagir() {
        const prox = this.maisProximo(85);

        if (!this.balaoCarregando) {
            if (!prox) return;
            this.balaoCarregando = prox;
            if (this.fioAtual) this.fioAtual.destroy();
            this.fioAtual = this.add.graphics();
            this.layerFios.add(this.fioAtual);
            this.flash(prox.img.x, prox.img.y, 0xffffff);
        } else {
            if (prox && prox !== this.balaoCarregando &&
                prox.corDef.nome === this.balaoCarregando.corDef.nome &&
                prox.lado !== this.balaoCarregando.lado) {
                this.conectar(this.balaoCarregando, prox);
            } else if (prox && prox !== this.balaoCarregando) {
                this.errou();
            } else {
                this.soltarFio();
            }
        }
    }

    soltarFio() {
        this.balaoCarregando = null;
        if (this.fioAtual) { this.fioAtual.destroy(); this.fioAtual = null; }
    }

    maisProximo(distMax) {
        const rx = this.imgRobo.x, ry = this.imgRobo.y;
        let melhor = null, menor = distMax;
        this.baloes.forEach(b => {
            if (b.conectado) return;
            const d = Phaser.Math.Distance.Between(rx, ry, b.img.x, b.img.y);
            if (d < menor) { menor = d; melhor = b; }
        });
        return melhor;
    }

    conectar(a, b) {
        a.conectado = true;
        b.conectado = true;
        this.balaoCarregando = null;
        if (this.fioAtual) { this.fioAtual.destroy(); this.fioAtual = null; }
        if (a.tweenDeriva) a.tweenDeriva.stop();
        if (b.tweenDeriva) b.tweenDeriva.stop();

        const wg = this.add.graphics();
        const steps = Math.max(4, Math.floor(Phaser.Math.Distance.Between(a.img.x, a.img.y, b.img.x, b.img.y) / 5));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Phaser.Math.Linear(a.img.x, b.img.x, t);
            const sag = Math.sin(t * Math.PI) * 24;
            const y = Phaser.Math.Linear(a.img.y + 15, b.img.y + 15, t) + sag;
            wg.fillStyle(a.corDef.wire, 0.9);
            wg.fillRect(x - 3, y - 3, 6, 6);
        }
        this.layerFios.add(wg);
        this.fiosPermanentes.push(wg);

        this.tweens.add({ targets: [a.img, b.img], alpha: 0.5, duration: 300 });
        this.flash(a.img.x, a.img.y, 0xffffff);
        this.flash(b.img.x, b.img.y, 0xffffff);
        this.estrelas(a.img.x, a.img.y);
        this.estrelas(b.img.x, b.img.y);

        this.totalConexoes++;

        if (this.totalConexoes >= 4) {
            this.finalizar();
        }
    }

    finalizar() {
        this.jogoAtivo = false;

        // Efeito de estrelas
        for (let i = 0; i < 30; i++) {
            this.time.delayedCall(i * 40, () => {
                this.estrelas(
                    Phaser.Math.Between(50, this.larguraJogo - 50),
                    Phaser.Math.Between(50, this.alturaJogo - 50)
                );
            });
        }

        this.registry.set('fase3Completa', true);
        this.registry.set('quadroLido', false);

        this.time.delayedCall(1000, () => {
            const cx = this.larguraJogo / 2;
            const cy = this.alturaJogo / 2;

            const overlay = this.add.image(cx, cy, "conclusao3")
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
        });
    }

    errou() {
        const ox = this.imgRobo.x;
        this.tweens.add({ targets: this.imgRobo, x: ox + 12, duration: 50, yoyo: true, repeat: 3, onComplete: () => this.imgRobo.x = ox });
        this.flash(this.imgRobo.x, this.imgRobo.y, 0xff2222);

        // Solta o balão carregado
        this.soltarFio();

        // Aguarda um momento e reseta tudo
        this.time.delayedCall(600, () => {
            // Destroi fios permanentes
            this.fiosPermanentes.forEach(g => g.destroy());
            this.fiosPermanentes = [];

            // Destroi todos os balões existentes e reseta o array
            this.baloes.forEach(b => {
                this.tweens.killTweensOf(b.img);
                b.img.destroy();
            });
            this.baloes = [];

            // Reseta contador de conexões
            this.totalConexoes = 0;

            // Remove imagem central se houver
            if (this.imagemAtual) { this.imagemAtual.destroy(); this.imagemAtual = null; }
            this.balaoAtivo = null;

            // Cria balões novamente embaralhados
            const baloesEsq = this.cores.filter(c => c.lado === "esq");
            const baloesDir = this.cores.filter(c => c.lado === "dir");
            const esq = Phaser.Utils.Array.Shuffle([...baloesEsq]);
            const dir = Phaser.Utils.Array.Shuffle([...baloesDir]);
            const posE = this.posicoes(4, "esq");
            const posD = this.posicoes(4, "dir");
            esq.forEach((c, i) => this.criarBalao(posE[i].x, posE[i].y, c));
            dir.forEach((c, i) => this.criarBalao(posD[i].x, posD[i].y, c));
        });
    }

    flash(x, y, cor) {
        const g = this.add.graphics();
        this.layerFx.add(g);
        g.fillStyle(cor, 0.9);
        g.fillRect(x - 12, y - 3, 24, 6);
        g.fillRect(x - 3, y - 12, 6, 24);
        g.fillRect(x - 16, y - 16, 6, 6);
        g.fillRect(x + 10, y - 16, 6, 6);
        g.fillRect(x - 16, y + 10, 6, 6);
        g.fillRect(x + 10, y + 10, 6, 6);
        this.tweens.add({ targets: g, alpha: 0, scaleX: 2, scaleY: 2, duration: 400, ease: "Cubic.Out", onComplete: () => g.destroy() });
    }

    estrelas(x, y) {
        const cores = [0xffffff, 0xffff00, 0xffcc00, 0xff8800];
        for (let i = 0; i < 12; i++) {
            const g = this.add.graphics();
            this.layerFx.add(g);
            g.fillStyle(cores[i % 4], 1);
            g.fillRect(-3, -3, 6, 6);
            g.setPosition(x, y);
            const ang = (i / 12) * Math.PI * 2;
            const spd = 60 + Math.random() * 80;
            this.tweens.add({
                targets: g,
                x: x + Math.cos(ang) * spd,
                y: y + Math.sin(ang) * spd,
                scaleX: 0, scaleY: 0, alpha: 0,
                duration: 500, ease: "Cubic.Out",
                onComplete: () => g.destroy(),
            });
        }
    }

    mostrarOverlay(titulo, sub, btnTxt, onConfirm) {
        const cx = this.larguraJogo / 2;
        const cy = this.alturaJogo / 2;
        const elems = [];
        const add = obj => { this.add.existing(obj); elems.push(obj); };

        const bg = this.add.graphics();
        bg.fillStyle(0x050514, 0.93);
        bg.fillRect(0, 0, this.larguraJogo, this.alturaJogo);
        bg.lineStyle(3, 0x334466, 1);
        bg.strokeRect(cx - 250, cy - 150, 500, 300);
        bg.lineStyle(1, 0x66eeff, 0.5);
        bg.strokeRect(cx - 246, cy - 146, 492, 292);
        add(bg);

        add(this.add.text(cx, cy - 100, titulo, {
            fontFamily: "monospace", fontSize: "24px", fontStyle: "bold",
            color: "#ffe066", align: "center",
        }).setOrigin(0.5));

        add(this.add.text(cx, cy - 20, sub, {
            fontFamily: "monospace", fontSize: "14px",
            color: "#88aacc", align: "center", lineSpacing: 8,
        }).setOrigin(0.5));

        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x1a1a44, 1);
        btnBg.fillRect(cx - 80, cy + 90, 160, 40);
        btnBg.lineStyle(2, 0x66eeff, 1);
        btnBg.strokeRect(cx - 80, cy + 90, 160, 40);
        add(btnBg);

        const btn = this.add.text(cx, cy + 110, btnTxt, {
            fontFamily: "monospace", fontSize: "16px", color: "#66eeff",
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on("pointerover", () => btn.setColor("#ffffff"));
        btn.on("pointerout", () => btn.setColor("#66eeff"));
        btn.on("pointerdown", () => { elems.forEach(e => e.destroy()); if (onConfirm) onConfirm(); });
        add(btn);
    }
}
