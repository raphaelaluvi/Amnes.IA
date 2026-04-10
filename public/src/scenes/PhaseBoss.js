export class PhaseBoss extends Phaser.Scene {

    // Define as dimensões da tela para esta fase específica
    alturaJogo = 600;
    larguraJogo = 1000;

    constructor() {
        // Inicializa a cena registrando o seu nome identificador no Phaser
        super("PhaseBoss");
    }

    init(data) {
        // Recupera a informação do personagem selecionado na tela anterior. Se não houver, define como 0.
        this.personagemSelecionado = data.personagem ?? 0;
    }

    preload() {
        this.load.on('loaderror', () => { });
        // Dicionário contendo os caminhos, chaves e escalas de todos os assets visuais usados no chefão
        this.assetsBoss = {
            heroi: {
                key: "player_boss",
                path: "public/assets/heroi_parado.webp",
                scale: 0.24
            },
            vilao: {
                key: "boss",
                path: "public/assets/vilao_parado.webp",
                scale: 0.3
            },
            fundo: {
                key: "fundo_boss",
                path: "public/assets/fundochefe.webp"
            }
        };

        // Carrega efetivamente as imagens do vilão, herói e plano de fundo para a memória do jogo
        this.load.image(this.assetsBoss.vilao.key, this.assetsBoss.vilao.path);
        this.load.image(this.assetsBoss.heroi.key, this.assetsBoss.heroi.path);
        this.load.image(this.assetsBoss.fundo.key, this.assetsBoss.fundo.path);
        this.load.image("gameOver2", "public/assets/gameOver2.png");
        this.load.image("conclusao4", "public/assets/conclusao4.webp");
        this.load.spritesheet("disparo_heroi", "public/assets/disparo_do_heroi.webp", { frameWidth: 355, frameHeight: 300 });
        this.load.spritesheet("disparo_vilao", "public/assets/disparo_do_vilao.webp", { frameWidth: 355, frameHeight: 300 });
        this.load.image("options", "public/assets/options.webp");

        // Carrega a trilha sonora épica da batalha
        this.load.audio("boss", "public/assets/musicas/boss.mp3");
    }

    create() {
        if (this.game.fase4) {
            this.game.fase4.stop();
            this.game.fase4 = null;
        }

        // Verifica se a música do chefão já está tocando; se não, cria e inicia a reprodução em loop
        try {
            if (!this.game.boss && this.cache.audio.exists("boss")) {
                this.game.boss = this.sound.add("boss", { loop: true, volume: 0.1 });
                this.game.boss.play();
            }
        } catch (e) { }

        this.anims.create({ key: "anim_disparo_heroi", frames: this.anims.generateFrameNumbers("disparo_heroi", { start: 1, end: 3 }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: "anim_disparo_vilao", frames: this.anims.generateFrameNumbers("disparo_vilao", { start: 1, end: 3 }), frameRate: 12, repeat: -1 });

        // Garante que a música pare de tocar quando a cena for encerrada ou destruída
        this.events.on("shutdown", () => {
            if (this.game.boss) {
                this.game.boss.stop();
                this.game.boss = null;
            }
        });

        // Variáveis de controle de estado do jogo (se acabou, se tem pergunta rolando, etc.)
        this.gameOver = false;
        this.perguntaAtiva = false;
        this.partidaEncerrada = false;

        // Configurações iniciais de atributos de vida (HP) e pontuação
        this.pontuacao = 0;
        this.hpJogadorMax = 100;
        this.hpJogador = 100;
        this.hpChefaoMax = 75;
        this.hpChefao = 75;

        // Configurações base de Dano. O herói começa com 0.80 e o chefe com 0.50
        this.danoJogadorBase = 0.80;
        this.danoJogadorAtual = 0.80;
        this.danoChefao = 0.50;

        // Atributos para controle de evolução (acertos) e feitiços temporários (buffs) do herói
        this.acertosPerguntas = 0;
        this.buffDanoHeroiAtivo = false;
        this.buffDanoHeroiEvento = null;

        // Configurações de tempo (cooldown) e cadência de disparos e spawns
        this.ultimoDisparoJogador = 0;
        this.cooldownDisparoJogador = 400; // Tempo em milissegundos para o herói poder atirar de novo
        this.padraoAtual = 1;
        this.intervaloSpawnAtual = 1800; // Tempo em milissegundos entre os ataques do chefe
        this.buffVelocidadeChefaoAtivo = false;

        // Memória de direção para garantir que o "Dash" funcione mesmo com o jogador parado
        this.ultimaDirecaoX = 1;
        this.ultimaDirecaoY = 0;
        this.tempoUltimoDash = 0;
        this.cooldownDash = 900;
        this.dashAtivoAte = 0;

        // Rastreador das perguntas que já foram usadas para não repeti-las na mesma partida
        this.perguntasUsadas = { 1: [], 2: [], 3: [] };

        // Banco de Perguntas Educativas sobre IA separado por nível de dificuldade (momento)
        this.perguntas = [
            // Momento 1 - Conceitos Básicos
            {
                momento: 1,
                afirmacao: '"A Inteligência Artificial sempre toma decisões justas e imparciais."',
                alternativas: [
                    { texto: "A) Verdade, porque a IA é baseada em matemática pura.", correta: false },
                    { texto: "B) Falso, porque a IA pode reproduzir vieses dos dados de treinamento.", correta: true },
                    { texto: "C) Verdade, porque a IA não tem emoções.", correta: false },
                    { texto: "D) Falso, porque a IA não consegue tomar decisões.", correta: false }
                ]
            },
            {
                momento: 1,
                afirmacao: '"Redes neurais artificiais funcionam exatamente como o cérebro humano."',
                alternativas: [
                    { texto: "A) Verdade, porque foram criadas por neurocientistas.", correta: false },
                    { texto: "B) Verdade, porque possuem neurônios reais.", correta: false },
                    { texto: "C) Falso, porque são inspiradas no cérebro, mas funcionam diferente.", correta: true },
                    { texto: "D) Falso, porque redes neurais não existem na prática.", correta: false }
                ]
            },
            {
                momento: 1,
                afirmacao: '"Machine Learning e Inteligência Artificial são a mesma coisa."',
                alternativas: [
                    { texto: "A) Verdade, os termos são completamente intercambiáveis.", correta: false },
                    { texto: "B) Falso, Machine Learning é uma subárea da IA.", correta: true },
                    { texto: "C) Verdade, ambos foram criados na mesma época.", correta: false },
                    { texto: "D) Falso, porque IA não existe de fato.", correta: false }
                ]
            },
            {
                momento: 1,
                afirmacao: '"IAs generativas, como o ChatGPT, compreendem o mundo e tem consciência igual aos humanos."',
                alternativas: [
                    { texto: "A) Verdade, elas sentem e pensam de forma autônoma.", correta: false },
                    { texto: "B) Falso, elas apenas preveem textos com base em padrões estatísticos.", correta: true },
                    { texto: "C) Verdade, a consciência artificial já foi comprovada cientificamente.", correta: false },
                    { texto: "D) Falso, porque elas sequer conseguem montar frases completas.", correta: false }
                ]
            },
            {
                momento: 1,
                afirmacao: '"Uma IA Geral (AGI) capaz de realizar qualquer tarefa intelectual humana já existe e está sendo usada."',
                alternativas: [
                    { texto: "A) Verdade, o ChatGPT é uma AGI perfeita.", correta: false },
                    { texto: "B) Verdade, os robos já são independentes.", correta: false },
                    { texto: "C) Falso, atualmente temos apenas IAs Estreitas (Narrow AI) especializadas em tarefas específicas.", correta: true },
                    { texto: "D) Falso, porque computadores nunca serão capazes de calcular.", correta: false }
                ]
            },
            {
                momento: 1,
                afirmacao: '"O Teste de Turing foi criado para descobrir se uma máquina consegue demonstrar inteligência indistinguível da humana."',
                alternativas: [
                    { texto: "A) Verdade, avaliando conversas via texto entre um humano e a máquina.", correta: true },
                    { texto: "B) Falso, o teste de Turing verifica o processador da máquina.", correta: false },
                    { texto: "C) Verdade, mas só avalia a capacidade de resolver problemas de matemática.", correta: false },
                    { texto: "D) Falso, foi criado para medir a força de robôs.", correta: false }
                ]
            },

            // Momento 2 - Ética e Vieses
            {
                momento: 2,
                afirmacao: '"Um algoritmo de reconhecimento facial funciona igualmente bem para todos os grupos étnicos."',
                alternativas: [
                    { texto: "A) Verdade, porque algoritmos não enxergam cor.", correta: false },
                    { texto: "B) Falso, muitos foram treinados com dados pouco diversificados.", correta: true },
                    { texto: "C) Verdade, porque a câmera captura a realidade como ela é.", correta: false },
                    { texto: "D) Falso, porque o reconhecimento facial ainda não existe.", correta: false }
                ]
            },
            {
                momento: 2,
                afirmacao: '"A IA não precisa de supervisão humana após ser treinada e implantada."',
                alternativas: [
                    { texto: "A) Verdade, porque ela aprende sozinha com o tempo.", correta: false },
                    { texto: "B) Verdade, porque monitoramento é caro e desnecessário.", correta: false },
                    { texto: "C) Falso, modelos precisam ser monitorados para evitar erros e vieses.", correta: true },
                    { texto: "D) Falso, porque toda IA para de funcionar sem humanos.", correta: false }
                ]
            },
            {
                momento: 2,
                afirmacao: '"O uso de IA para criar e disseminar deepfakes não afeta a segurança social."',
                alternativas: [
                    { texto: "A) Verdade, as pessoas sabem distinguir o que é real do que é digital.", correta: false },
                    { texto: "B) Falso, deepfakes podem criar desinformação grave e difamação.", correta: true },
                    { texto: "C) Verdade, são apenas ferramentas inofensivas de humor.", correta: false },
                    { texto: "D) Falso, mas deepfakes só funcionam com atores contratados.", correta: false }
                ]
            },
            {
                momento: 2,
                afirmacao: '"Se um algoritmo de IA toma uma decisão discriminatória ao avaliar currículos, a culpa é exclusivamente do computador."',
                alternativas: [
                    { texto: "A) Verdade, a máquina que fez o cálculo e deve ser desligada.", correta: false },
                    { texto: "B) Falso, a falha reflete os dados históricos discriminatórios usados no treino.", correta: true },
                    { texto: "C) Verdade, computadores frequentemente ficam \'malvados\' por conta própria.", correta: false },
                    { texto: "D) Falso, algoritmos de IA nunca erram ao avaliar currículos.", correta: false }
                ]
            },
            {
                momento: 2,
                afirmacao: '"Ferramentas de IA generativa levantam preocupações sobre Direitos Autorais e Propriedade Intelectual."',
                alternativas: [
                    { texto: "A) Verdade, porque treinam suas bases de dados em obras de artistas sem dar devidos créditos ou compensação.", correta: true },
                    { texto: "B) Falso, porque a IA cria imagens originais mágicas sem nunca olhar para a internet.", correta: false },
                    { texto: "C) Verdade, mas apenas se a IA imprimir a imagem no papel.", correta: false },
                    { texto: "D) Falso, tudo o que está na internet é público e livre de direitos.", correta: false }
                ]
            },

            // Momento 3 - Aplicações Práticas
            {
                momento: 3,
                afirmacao: '"Para treinar um modelo de IA, quanto mais dados, pior o resultado."',
                alternativas: [
                    { texto: "A) Verdade, porque dados demais causam confusão no modelo.", correta: false },
                    { texto: "B) Verdade, porque o modelo fica lento demais.", correta: false },
                    { texto: "C) Falso, mais dados de qualidade geralmente melhoram o modelo.", correta: true },
                    { texto: "D) Falso, porque dados não influenciam o treinamento.", correta: false }
                ]
            },
            {
                momento: 3,
                afirmacao: '"Processamento de Linguagem Natural (PLN) é usado apenas para tradução de idiomas."',
                alternativas: [
                    { texto: "A) Verdade, tradução é o único uso do PLN.", correta: false },
                    { texto: "B) Falso, PLN abrange chatbots, análise de sentimentos, resumo de textos e muito mais.", correta: true },
                    { texto: "C) Verdade, porque PLN foi criado exclusivamente para tradução.", correta: false },
                    { texto: "D) Falso, porque PLN não tem relação com linguagem.", correta: false }
                ]
            },
            {
                momento: 3,
                afirmacao: '"A Visão Computacional permite que sistemas de IA interpretem o mundo visual através de imagens e vídeos."',
                alternativas: [
                    { texto: "A) Verdade, e essa tecnologia é usada em carros autônomos e diagnósticos médicos.", correta: true },
                    { texto: "B) Falso, visão computacional é apenas a resolução da tela do computador.", correta: false },
                    { texto: "C) Verdade, mas só funciona para reconhecer textos em documentos.", correta: false },
                    { texto: "D) Falso, porque computadores não tem olhos e não enxergam imagens.", correta: false }
                ]
            },
            {
                momento: 3,
                afirmacao: '"Inteligencia Artificial já é utilizada amplamente no nosso dia a dia, e não apenas em robôs futuristas."',
                alternativas: [
                    { texto: "A) Verdade, está presente no GPS, nas recomendções do streaming e em assistentes virtuais.", correta: true },
                    { texto: "B) Falso, só é usada em supercomputadores de universidades.", correta: false },
                    { texto: "C) Verdade, mas ela só funciona no dia a dia se você tiver internet via satélite.", correta: false },
                    { texto: "D) Falso, nínguem usa IA em casa ainda, apenas grandes corporações.", correta: false }
                ]
            },
            {
                momento: 3,
                afirmacao: '"Na área da medicina, a Inteligência Artificial já consegue diagnosticar doenças sozinha, substituindo completamente a presença de um médico humano."',
                alternativas: [
                    { texto: "A) Verdade, os hospitais mais modernos não usam mais médicos.", correta: false },
                    { texto: "B) Falso, a IA atua apenas como uma ferramenta de apoio a decisão do profissional de saúde humano.", correta: true },
                    { texto: "C) Verdade, porque máquinas não comentem nenhum erro de análise.", correta: false },
                    { texto: "D) Falso, porque a IA ainda não é permitida dentro de hospitais.", correta: false }
                ]
            }
        ];

        // Chama todas as funções auxiliares que montam a cena (HUD, colisões, herói, vilão)
        this.criarFundo();
        this.criarJogador();
        this.criarChefao();
        this.criarBarrasHP();
        this.criarTextos();
        this.configurarControles();
        this.configurarColisoes();

        // Aguarda 1 segundo antes de iniciar os temporizadores de combate (para o jogador se preparar)
        this.time.delayedCall(1000, () => {
            this.iniciarTimers();
        });

        // Força a atualização da interface gráfica pela primeira vez
        this.atualizarBarrasHP();
    }

    criarFundo() {
        // Tenta renderizar o fundo usando a imagem; caso a imagem não exista, gera um retângulo escuro como fallback
        if (this.textures.exists(this.assetsBoss.fundo.key)) {
            this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, this.assetsBoss.fundo.key)
                .setDisplaySize(this.larguraJogo, this.alturaJogo)
                .setDepth(0);
        } else {
            this.add.rectangle(
                this.larguraJogo / 2,
                this.alturaJogo / 2,
                this.larguraJogo,
                this.alturaJogo,
                0x1a1a2e
            );
        }
    }

    criarJogador() {
        // Avalia se há imagem para o jogador. Se não, cria um círculo azul provisório.
        this.usarFallbackJogador = !this.textures.exists(this.assetsBoss.heroi.key);

        if (this.usarFallbackJogador) {
            this.player = this.add.circle(150, 300, 20, 0x4488ff);
            this.physics.add.existing(this.player);
            this.player.body.setCircle(20);
        } else {
            this.player = this.physics.add.sprite(150, 300, this.assetsBoss.heroi.key).setScale(this.assetsBoss.heroi.scale);

            // Reduz e centraliza a área de contato (hitbox circular) para favorecer a esquiva do jogador
            const raioHeroi = (this.player.width / 2) * 0.4;
            const offsetX = (this.player.width / 2) - raioHeroi;
            const offsetY = (this.player.height / 2) - raioHeroi;

            this.player.body.setCircle(raioHeroi, offsetX, offsetY);
        }

        // Configura propriedades de física do jogador (sem gravidade e impedido de sair do mundo)
        this.player.body.setAllowGravity(false);
        this.player.body.setCollideWorldBounds(true);

        // Cria os limites (paredes invisíveis) que prendem o jogador apenas na metade esquerda da tela
        this.physics.world.setBounds(0, 0, this.larguraJogo, this.alturaJogo);
        this.limitesJogador = this.physics.add.staticGroup();

        const paredeEsquerda = this.add.rectangle(-5, this.alturaJogo / 2, 10, this.alturaJogo, 0x000000, 0);
        const paredeDireita = this.add.rectangle(485, this.alturaJogo / 2, 10, this.alturaJogo, 0x000000, 0);
        const paredeTopo = this.add.rectangle(240, -5, 480, 10, 0x000000, 0);
        const paredeBase = this.add.rectangle(240, this.alturaJogo + 5, 480, 10, 0x000000, 0);

        this.physics.add.existing(paredeEsquerda, true);
        this.physics.add.existing(paredeDireita, true);
        this.physics.add.existing(paredeTopo, true);
        this.physics.add.existing(paredeBase, true);

        this.limitesJogador.addMultiple([paredeEsquerda, paredeDireita, paredeTopo, paredeBase]);
        this.physics.add.collider(this.player, this.limitesJogador);

        // Agrupa os projéteis lançados pelo jogador para fácil gerenciamento
        this.projeteisJogador = this.physics.add.group();
    }

    criarChefao() {
        this.usarFallbackChefao = !this.textures.exists(this.assetsBoss.vilao.key);

        // Define as coordenadas da animação de entrada do chefão (vem de fora da tela)
        const xiChefao = this.larguraJogo + 100; // fora da tela à direita
        const yiChefao = 0;                      // topo da tela
        const xfChefao = 820;                    // posição final X
        const yfChefao = 300;                    // posição final Y

        if (this.usarFallbackChefao) {
            this.chefao = this.add.circle(xiChefao, yiChefao, 35, 0xff4444);
            this.physics.add.existing(this.chefao);
            this.chefao.body.setCircle(35);
        } else {
            this.chefao = this.physics.add.sprite(xiChefao, yiChefao, this.assetsBoss.vilao.key).setScale(this.assetsBoss.vilao.scale);
            this.chefao.setFlipX(true); // Espelha a imagem para olhar para o herói

            // Diminui a área de colisão (hitbox) para balancear o jogo
            const raioChefe = (this.chefao.width / 2) * 0.5;
            const offsetX = (this.chefao.width / 2) - raioChefe;
            const offsetY = (this.chefao.height / 2) - raioChefe;
            this.chefao.body.setCircle(raioChefe, offsetX, offsetY);
        }

        this.chefao.body.setAllowGravity(false);
        this.chefao.body.setImmovable(true); // O vilão não é empurrado por tiros ou colisão física

        this.projeteisChefao = this.physics.add.group();

        // Inicia a cena de entrada visual do chefe chamando a função cinemática manual
        this.moverElemento(
            this.chefao,
            xiChefao, yiChefao,
            xfChefao, yfChefao,
            2.0, // duração da animação de entrada
            () => { this.movimentarChefaoAleatoriamente(); } // Callback: começa a se mover após entrar
        );
    }

    /**
     * moverElemento — Animação cinemática bidimensional manual (MU e MUV)
     * Utilizado exclusivamente para a entrada elegante do chefão na tela.
     */
    moverElemento(elemento, xi, yi, xf, yf, duracaoSegundos, onConcluido) {
        const T = duracaoSegundos;

        // Calcula a velocidade constante de X (Movimento Uniforme)
        const Vx = (xf - xi) / T;

        // Calcula a aceleração constante de Y (Movimento Uniformemente Variado)
        const ay = (2 * (yf - yi)) / (T * T);

        let t = 0;
        this._entradaChefaoConcluida = false;

        console.log("=== INÍCIO DA ANIMAÇÃO MU+MUV DO CHEFÃO ===");
        console.log(`xi=${xi}, yi=${yi} → xf=${xf}, yf=${yf} | T=${T}s`);
        console.log(`[MU ] Vx = (${xf} - ${xi}) / ${T} = ${Vx.toFixed(4)} px/s`);
        console.log(`[MUV] ay = 2*(${yf}-${yi}) / ${T}² = ${ay.toFixed(4)} px/s²`);

        // Timer que roda frame a frame atualizando as posições
        this._entradaChefaoEvento = this.time.addEvent({
            delay: 0,
            loop: true,
            callback: (delta) => {
                const dt = this.game.loop.delta / 1000;
                t += dt;

                const tAtual = Math.min(t, T);

                // Equações físicas sendo aplicadas no objeto
                const x = xi + Vx * tAtual;
                const Vy = ay * tAtual;
                const y = yi + 0.5 * ay * tAtual * tAtual;

                // Atualiza posições físicas e visuais do Chefão
                elemento.x = x;
                elemento.y = y;
                if (elemento.body) {
                    elemento.body.reset(x, y);
                }

                console.log(
                    `t=${tAtual.toFixed(3)}s | ` +
                    `[MU ] Vx=${Vx.toFixed(2)} px/s | x=${x.toFixed(2)} px | ` +
                    `[MUV] ay=${ay.toFixed(2)} px/s² | Vy=${Vy.toFixed(2)} px/s | y=${y.toFixed(2)} px`
                );

                // Quando atinge o tempo limite, finaliza a animação
                if (t >= T && !this._entradaChefaoConcluida) {
                    this._entradaChefaoConcluida = true;

                    elemento.x = xf;
                    elemento.y = yf;
                    if (elemento.body) elemento.body.reset(xf, yf);

                    console.log(`=== ANIMAÇÃO CONCLUÍDA | x final=${xf} | y final=${yf} ===`);

                    this._entradaChefaoEvento.remove();

                    if (typeof onConcluido === 'function') onConcluido();
                }
            }
        });
    }

    movimentarChefaoAleatoriamente() {
        // Interrompe qualquer movimento de patrulha caso o jogo já tenha acabado ou pausado
        if (this.partidaEncerrada || this.perguntaAtiva) return;

        // Delimita que o chefão só pode "flutuar" na metade direita da tela
        const minX = this.larguraJogo / 2 + 100;
        const maxX = this.larguraJogo - 50;
        const minY = 50;
        const maxY = this.alturaJogo - 50;

        // Escolhe o próximo localStl de destino e quanto tempo ele leva para chegar
        const destinoX = Phaser.Math.Between(minX, maxX);
        const destinoY = Phaser.Math.Between(minY, maxY);
        const tempoDeslocamento = Phaser.Math.Between(1000, 2500);

        // Adiciona e executa a interpolação que fará o chefão viajar de A até B
        this.tweenMovimentoChefao = this.tweens.add({
            targets: this.chefao,
            x: destinoX,
            y: destinoY,
            duration: tempoDeslocamento,
            ease: "Sine.InOut",
            onComplete: () => {
                // Ao terminar a viagem, se a partida não acabou, ele se move novamente
                if (!this.partidaEncerrada && !this.gameOver) {
                    this.movimentarChefaoAleatoriamente();
                }
            }
        });
    }

    criarBarrasHP() {
        // Inicializa o objeto responsável por desenhar formas e barras de vida (HUD)
        this.graficoHP = this.add.graphics();
    }

    criarTextos() {
        // Adiciona todo o texto da tela: pontuação central, e labels das Barras de HP
        this.textoPlacar = this.add.text(this.larguraJogo / 2, 20, "Pontuacao: 0", {
            fontFamily: "Arial",
            fontSize: "22px",
            color: "#ffffff"
        }).setOrigin(0.5, 0);

        this.add.text(20, 48, "JOGADOR", { fontFamily: "Arial", fontSize: "14px", color: "#ffffff" });
        this.add.text(this.larguraJogo - 220, 48, "CHEFAO", { fontFamily: "Arial", fontSize: "14px", color: "#ffffff" });

        this.textoHPJogador = this.add.text(20, 72, "HP: 100.0", { fontFamily: "Arial", fontSize: "14px", color: "#c7ffd8" });
        this.textoHPChefao = this.add.text(this.larguraJogo - 220, 72, "HP: 100.0", { fontFamily: "Arial", fontSize: "14px", color: "#ffd6d6" });
    }

    configurarControles() {
        // Mapeia botões do teclado (WASD, Espaço para atirar, Shift para Esquiva)
        this.teclado = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });
        this.teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.teclaShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
        btnPause.on("pointerdown", () => {
            if (this.partidaEncerrada || this.gameOver) return;
            this.scene.launch("Pause", { from: "PhaseBoss" });
            this.scene.pause("PhaseBoss");
        });

        this.input.keyboard.on("keydown-ESC", () => {
            if (this.gameOver) {
                this.scene.restart({ personagem: this.personagemSelecionado });
                return;
            }
            if (this.partidaEncerrada) return;
            this.scene.launch("Pause", { from: "PhaseBoss" });
            this.scene.pause("PhaseBoss");
        });

    }

    configurarColisoes() {
        // Evento que verifica sempre que um tiro do JOGADOR atinge o CHEFÃO
        this.physics.add.overlap(
            this.projeteisJogador,
            this.chefao,
            (obj1, obj2) => {
                const projetil = (obj1 === this.chefao) ? obj2 : obj1;

                if (!projetil.active) return;
                projetil.destroy(); // Destrói o tiro após impacto

                this.aplicarDanoChefao(this.danoJogadorAtual); // Chefe perde vida
                this.pontuacao += (this.danoJogadorAtual * 100); // Pontuação aumenta
                this.textoPlacar.setText("Pontuacao: " + this.pontuacao);
            },
            null,
            this
        );

        // Evento que verifica sempre que um tiro do CHEFÃO atinge o JOGADOR
        this.physics.add.overlap(
            this.projeteisChefao,
            this.player,
            (obj1, obj2) => {
                const projetil = (obj1 === this.player) ? obj2 : obj1;

                if (!projetil.active) return;
                projetil.destroy(); // Destrói o tiro após impacto
                this.aplicarDanoJogador(this.danoChefao); // Herói perde vida
            },
            null,
            this
        );
    }

    iniciarTimers() {
        // Relógio que controla de quanto em quanto tempo o chefão ataca o jogador
        this.spawnTimer = this.time.addEvent({
            delay: this.intervaloSpawnAtual,
            loop: true,
            callback: this.dispararChefao,
            callbackScope: this
        });

        // Chama o agendamento inicial da pergunta educativa
        this.agendarProximaPergunta();
    }

    agendarProximaPergunta() {
        // Função dedicada para resetar e garantir que a próxima pergunta só venha em exatos 20 segundos
        if (this.partidaEncerrada || this.gameOver) return;

        if (this.perguntaTimer) {
            this.perguntaTimer.remove(false);
        }

        this.perguntaTimer = this.time.addEvent({
            delay: 20000, // Aguarda 20 segundos
            callback: this.lancarPergunta,
            callbackScope: this
        });
    }

    dispararJogador() {
        // Verifica as travas de disparo
        if (this.gameOver || this.perguntaAtiva || this.partidaEncerrada) return;

        const agora = this.time.now;
        const podeDisparar = this.teclaEspaco.isDown && agora - this.ultimoDisparoJogador >= this.cooldownDisparoJogador;

        // Se o jogador não apertou espaço ou a arma estiver em resfriamento (cooldown), não atira
        if (!podeDisparar) return;

        this.ultimoDisparoJogador = agora; // Atualiza marcação do tempo de tiro

        const projetil = this.add.sprite(this.player.x + 30, this.player.y, "disparo_heroi").setScale(0.12);
        this.physics.add.existing(projetil);
        projetil.play("anim_disparo_heroi");
        this.projeteisJogador.add(projetil);
        projetil.body.setAllowGravity(false);
        projetil.body.setVelocity(500, 0);
    }

    dispararChefao() {
        // Impede o boss de atirar caso esteja morto ou em período de pausa da pergunta
        if (this.gameOver || this.perguntaAtiva || this.partidaEncerrada || !this.chefao.active) return;

        // Chefão possui 3 tipos de ataques e escolhe qual fazer aleatoriamente
        const padroesDisponiveis = [1, 2, 3];
        const padraoSorteado = Phaser.Utils.Array.GetRandom(padroesDisponiveis);

        if (padraoSorteado === 1) this.dispararPadrao1();
        if (padraoSorteado === 2) this.dispararPadrao2();
        if (padraoSorteado === 3) this.dispararPadrao3();
    }

    calcularVetorTiro(anguloGraus, velocidade) {
        // Utilitário de trigonometria para transformar o ângulo do tiro em eixos de Velocidade (X, Y)
        const rad = Phaser.Math.DegToRad(anguloGraus);
        return {
            vx: velocidade * Math.cos(rad),
            vy: velocidade * Math.sin(rad)
        };
    }

    dispararPadrao1() {
        // Padrão de Ataque 1: Dá um único tiro potente teleguiado diretamente para a posição do Herói
        const anguloBase = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.chefao.x, this.chefao.y, this.player.x, this.player.y));
        const vel = this.calcularVetorTiro(anguloBase, 300);
        this._criarProjetilChefao(this.chefao.x - 40, this.chefao.y, vel.vx, vel.vy);
    }

    dispararPadrao2() {
        // Padrão de Ataque 2: Disparo em leque (Shotgun), mandando 3 tiros espalhados focados no herói
        const anguloBase = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.chefao.x, this.chefao.y, this.player.x, this.player.y));
        const angulos = [-15, 0, 15];
        const velocidade = 320;

        angulos.forEach((desvio) => {
            const vel = this.calcularVetorTiro(anguloBase + desvio, velocidade);
            this._criarProjetilChefao(this.chefao.x - 40, this.chefao.y, vel.vx, vel.vy);
        });
    }

    dispararPadrao3() {
        // Padrão de Ataque 3: Múltiplos tiros irregulares (caos aleatório) disparados em direção geral ao jogador
        const anguloBase = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.chefao.x, this.chefao.y, this.player.x, this.player.y));
        const velocidade = 370;

        for (let i = 0; i < 5; i++) {
            const desvio = Phaser.Math.Between(-30, 30);
            const vel = this.calcularVetorTiro(anguloBase + desvio, velocidade);
            this._criarProjetilChefao(this.chefao.x - 40, this.chefao.y, vel.vx, vel.vy);
        }
    }

    _criarProjetilChefao(x, y, vx, vy) {
        const projetil = this.add.sprite(x, y, "disparo_vilao").setScale(0.12);
        this.physics.add.existing(projetil);
        projetil.setAngle(Math.atan2(vy, vx) * (180 / Math.PI));
        projetil.play("anim_disparo_vilao");
        this.projeteisChefao.add(projetil);
        projetil.body.setAllowGravity(false);
        projetil.body.setVelocity(vx, vy);
    }

    atualizarPadraoDisparo() {
        // Conforme a vida do chefão desce, ele ataca com padrões mais difíceis e frequentemente
        let novoPadrao = 1;
        let novoIntervalo = 1800;

        if (this.hpChefao <= 89) { novoPadrao = 3; novoIntervalo = 1000; }
        else if (this.hpChefao <= 179) { novoPadrao = 2; novoIntervalo = 1400; }

        if (this.buffVelocidadeChefaoAtivo) {
            this.padraoAtual = novoPadrao;
            return;
        }

        // Se a "marcha" de perigo mudou, removemos o timer de disparo antigo e construimos um mais cruel
        if (this.padraoAtual !== novoPadrao || this.intervaloSpawnAtual !== novoIntervalo) {
            this.padraoAtual = novoPadrao;
            this.intervaloSpawnAtual = novoIntervalo;

            if (this.spawnTimer) this.spawnTimer.remove(false);

            this.spawnTimer = this.time.addEvent({
                delay: this.intervaloSpawnAtual,
                loop: true,
                callback: this.dispararChefao,
                callbackScope: this
            });
        }
    }

    lancarPergunta() {
        // Tranca o jogo se estiver tentando lançar perguntas com ele já finalizado
        if (this.perguntaAtiva || this.gameOver || this.partidaEncerrada) return;

        this.perguntaAtiva = true; // Inicia a fase de Quiz

        // Pausa todas as físicas e o avanço dos ataques e movimentações
        this.physics.pause();
        this.tweens.pauseAll();
        if (this.spawnTimer) this.spawnTimer.paused = true;

        // Analisa quão ferido o Chefe está para decidir a dificuldade da pergunta (Momento 1, 2 ou 3)
        let momento = 1;
        if (this.hpChefao <= 89) momento = 3;
        else if (this.hpChefao <= 180) momento = 2;

        // Separa do banco apenas as perguntas do Momento atual que AINDA não foram utilizadas
        const perguntasDoMomento = this.perguntas.filter((p) => p.momento === momento);
        let indicesDisponiveis = perguntasDoMomento.map((_, i) => i).filter((i) => !this.perguntasUsadas[momento].includes(i));

        // Se por acaso as opções esgotaram, reseta a lista para não quebrar o jogo
        if (indicesDisponiveis.length === 0) {
            this.perguntasUsadas[momento] = [];
            indicesDisponiveis = perguntasDoMomento.map((_, i) => i);
        }

        // Randomiza e pega a pergunta selecionada
        const indiceEscolhido = Phaser.Utils.Array.GetRandom(indicesDisponiveis);
        this.perguntasUsadas[momento].push(indiceEscolhido);
        const perguntaAtual = perguntasDoMomento[indiceEscolhido];

        // Monta a UI gráfica do Pop-up da Pergunta
        this.elementosPergunta = [];

        // Fundo Translúcido Preto (Dark overlay)
        const overlay = this.add.rectangle(this.larguraJogo / 2, this.alturaJogo / 2, this.larguraJogo, this.alturaJogo, 0x000000, 0.65).setDepth(50);
        this.elementosPergunta.push(overlay);

        // Cartão branco principal
        const card = this.add.rectangle(this.larguraJogo / 2, this.alturaJogo / 2 - 60, 600, 120, 0xffffff).setDepth(51);
        this.elementosPergunta.push(card);

        // O texto com a afirmativa do conteúdo educativo
        const textoAfirmacao = this.add.text(this.larguraJogo / 2, this.alturaJogo / 2 - 60, perguntaAtual.afirmacao, {
            fontFamily: "Arial", fontSize: "18px", color: "#000000", align: "center", wordWrap: { width: 560 }
        }).setOrigin(0.5).setDepth(52);
        this.elementosPergunta.push(textoAfirmacao);

        // Estrutura a posição X e Y dos 4 botões de alternativa
        const posicoes = [
            { x: this.larguraJogo / 2 - 160, y: this.alturaJogo / 2 + 60 },
            { x: this.larguraJogo / 2 + 160, y: this.alturaJogo / 2 + 60 },
            { x: this.larguraJogo / 2 - 160, y: this.alturaJogo / 2 + 120 },
            { x: this.larguraJogo / 2 + 160, y: this.alturaJogo / 2 + 120 }
        ];

        // Cria cada botão individual na tela
        perguntaAtual.alternativas.forEach((alternativa, i) => {
            const botao = this.add.rectangle(posicoes[i].x, posicoes[i].y, 280, 45, 0x1a3a5c).setDepth(51).setInteractive({ useHandCursor: true });
            const textoBotao = this.add.text(posicoes[i].x, posicoes[i].y, alternativa.texto, {
                fontFamily: "Arial", fontSize: "14px", color: "#ffffff", align: "center", wordWrap: { width: 260 }
            }).setOrigin(0.5).setDepth(52);

            // Ação principal de verificar se está certo após o clique no botão correspondente
            botao.on("pointerdown", () => this.verificarResposta(alternativa.correta));
            botao.on("pointerover", () => botao.setFillStyle(0x25527f)); // Efeito Hover
            botao.on("pointerout", () => botao.setFillStyle(0x1a3a5c));

            this.elementosPergunta.push(botao);
            this.elementosPergunta.push(textoBotao);
        });

        // Adiciona um contador visual de tempo restante para solucionar (30 segundos)
        this.tempoPergunta = 30;
        this.textoTimerPergunta = this.add.text(this.larguraJogo / 2, this.alturaJogo / 2 + 175, String(this.tempoPergunta), {
            fontFamily: "Arial", fontSize: "22px", fontStyle: "bold", color: "#ffd166"
        }).setOrigin(0.5).setDepth(52);
        this.elementosPergunta.push(this.textoTimerPergunta);

        // Decresce 1 segundo do Timer e fecha sozinho caso chegue a zero
        this.timerPerguntaUI = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.tempoPergunta -= 1;
                this.textoTimerPergunta.setText(String(this.tempoPergunta));
                if (this.tempoPergunta <= 0) this.verificarResposta(false);
            },
            callbackScope: this
        });
    }

    verificarResposta(correta) {
        // Bloqueia múltiplas avaliações em caso de multi-click
        if (!this.perguntaAtiva) return;
        this.perguntaAtiva = false;

        // Limpa e deleta toda a Interface de Tela de Pergunta construída e o Timer
        if (this.timerPerguntaUI) { this.timerPerguntaUI.remove(false); this.timerPerguntaUI = null; }
        if (this.elementosPergunta) { this.elementosPergunta.forEach((obj) => obj.destroy()); this.elementosPergunta = []; }

        // Retoma o combate re-ativando físicas e movimentos
        this.physics.resume();
        this.tweens.resumeAll();
        if (this.spawnTimer) this.spawnTimer.paused = false;

        if (correta) {
            // Caso o Jogador Acerte: O Herói dá Dano a Mais
            this.acertosPerguntas += 1;
            this.ativarBuffDanoHeroi(10000); // Fica forte por 10 segundos

            this.exibirTextoFlutuante("CORRETO! Dano Up! (10s)", "#33ff99", this.larguraJogo / 2, this.alturaJogo / 2, 1500);

            // Deixa o chefe piscando como reflexo do feitiço
            this.tweens.add({
                targets: this.chefao, alpha: 0.3, duration: 150, yoyo: true, repeat: 5,
                onComplete: () => this.chefao.setAlpha(1)
            });
        } else {
            // Caso o Jogador Erre: O Vilão fica Curado e mais Forte
            this.hpChefao = Phaser.Math.Clamp(this.hpChefao + 10, 0, this.hpChefaoMax); // Recupera 10 de vida
            this.danoChefao = 1.50; // Passa a machucar muito mais o jogador 
            this.atualizarBarrasHP();

            this.exibirTextoFlutuante("ERRADO! Chefao Curado e Mais Forte!", "#ff4d4d", this.larguraJogo / 2, this.alturaJogo / 2, 1500);

            // Alerta vermelho global na tela
            const flash = this.add.rectangle(this.larguraJogo / 2, this.alturaJogo / 2, this.larguraJogo, this.alturaJogo, 0xff0000, 0.35).setDepth(80);
            this.time.delayedCall(300, () => flash.destroy());

            // Dispara a metralhadora temporária do chefão por 5 segundos
            this.aplicarBuffTemporarioChefao(5000);
        }

        // Solicita a próxima pergunta daqui 20 segundos para manter o game rodando
        this.agendarProximaPergunta();
    }

    ativarBuffDanoHeroi(duracao) {
        // Renova ou ativa o buff ofensivo do herói
        if (this.buffDanoHeroiEvento) this.buffDanoHeroiEvento.remove(false);

        this.buffDanoHeroiAtivo = true;
        this.danoJogadorAtual = 1.15; // Setando o novo multiplicador

        // Desliga após o tempo determinado (10 segundos)
        this.buffDanoHeroiEvento = this.time.delayedCall(duracao, () => {
            this.buffDanoHeroiAtivo = false;
            this.danoJogadorAtual = this.danoJogadorBase; // Devolve à normalidade
            this.buffDanoHeroiEvento = null;
            this.exibirTextoFlutuante("BUFF DO HEROI TERMINOU", "#ffd166", this.larguraJogo / 2, 120, 1200);
        });
    }

    aplicarBuffTemporarioChefao(duracao) {
        // Envenena ou enfurece o chefão quando o herói erra a resposta do Quiz
        if (this.buffVelocidadeChefaoEvento) this.buffVelocidadeChefaoEvento.remove(false);
        this.buffVelocidadeChefaoAtivo = true;

        if (this.spawnTimer) this.spawnTimer.remove(false);

        // Torna o tempo entre os ataques ainda menor (dificultando a fase)
        let intervaloAcelerado = 900;
        if (this.padraoAtual === 2) intervaloAcelerado = 700;
        if (this.padraoAtual === 3) intervaloAcelerado = 550;

        this.spawnTimer = this.time.addEvent({ delay: intervaloAcelerado, loop: true, callback: this.dispararChefao, callbackScope: this });

        // Encerra esse tempo difícil aos 5 segundos marcados pela função de penalidade
        this.buffVelocidadeChefaoEvento = this.time.delayedCall(duracao, () => {
            this.buffVelocidadeChefaoAtivo = false;
            this.buffVelocidadeChefaoEvento = null;

            // Retorna a vida do chefão ao comportamento ordinário
            this.danoChefao = 1.00;
            this.atualizarPadraoDisparo();
        });
    }

    atualizarBarrasHP() {
        // Desenha frame-a-frame o recálculo dos dois retângulos visuais indicativos de Vida
        if (!this.graficoHP) return;

        const larguraBarra = 200;
        const alturaBarra = 20;
        const xJogador = 20, yJogador = 20;
        const xChefao = this.larguraJogo - 220, yChefao = 20;

        // Mantém as metragens entre 0 a 1 em percentual (%) de quanto resta da barra
        const proporcaoJogador = Phaser.Math.Clamp(this.hpJogador / this.hpJogadorMax, 0, 1);
        const proporcaoChefao = Phaser.Math.Clamp(this.hpChefao / this.hpChefaoMax, 0, 1);

        this.graficoHP.clear();

        // Camada do fundo (cinza escuro) + Camada indicativa Verde + Borda para o Jogador
        this.graficoHP.fillStyle(0x333333, 1).fillRect(xJogador, yJogador, larguraBarra, alturaBarra);
        this.graficoHP.fillStyle(0x00cc66, 1).fillRect(xJogador, yJogador, larguraBarra * proporcaoJogador, alturaBarra);
        this.graficoHP.lineStyle(2, 0xffffff, 1).strokeRect(xJogador, yJogador, larguraBarra, alturaBarra);

        // Camada do fundo (cinza escuro) + Camada indicativa Vermelha + Borda para o Chefão
        this.graficoHP.fillStyle(0x333333, 1).fillRect(xChefao, yChefao, larguraBarra, alturaBarra);
        this.graficoHP.fillStyle(0xdd3333, 1).fillRect(xChefao, yChefao, larguraBarra * proporcaoChefao, alturaBarra);
        this.graficoHP.lineStyle(2, 0xffffff, 1).strokeRect(xChefao, yChefao, larguraBarra, alturaBarra);

        // Ajusta as casas decimais de vida no texto para manter os placares limpos
        if (this.textoHPJogador && this.textoHPJogador.active) this.textoHPJogador.setText("HP: " + this.hpJogador.toFixed(1));
        if (this.textoHPChefao && this.textoHPChefao.active) this.textoHPChefao.setText("HP: " + this.hpChefao.toFixed(1));
    }

    aplicarDanoJogador(dano) {
        // Calcula o impacto e reduz HP do Herói
        this.hpJogador = Phaser.Math.Clamp(this.hpJogador - dano, 0, this.hpJogadorMax);
        this.atualizarBarrasHP();
        this.verificarFimDeJogo();
    }

    aplicarDanoChefao(dano) {
        // Calcula o impacto e reduz HP do Chefão
        this.hpChefao = Phaser.Math.Clamp(this.hpChefao - dano, 0, this.hpChefaoMax);
        this.atualizarBarrasHP();
        this.verificarFimDeJogo();
    }

    exibirTextoFlutuante(texto, cor, x, y, duracao) {
        // Exibe e cria o efeito que arrasta o texto para cima (tipo jogos de RPG) usando Tweens
        const aviso = this.add.text(x, y, texto, { fontFamily: "Arial", fontSize: "28px", color: cor, fontStyle: "bold" }).setOrigin(0.5).setDepth(90);
        this.tweens.add({ targets: aviso, y: y - 35, alpha: 0, duration: duracao, ease: "Sine.Out", onComplete: () => aviso.destroy() });
    }

    verificarFimDeJogo() {
        if (this.partidaEncerrada) return; // Retorna se a vitória/derrota já foi processada

        // Condição de Vitória para o Jogador: Chefe alcançou 0 ou menos de saúde.
        if (this.hpChefao <= 0) {
            localStorage.setItem('nivelLocal', 0);
            this.partidaEncerrada = true;
            this.physics.pause();
            if (this.spawnTimer) this.spawnTimer.paused = true;
            if (this.perguntaTimer) this.perguntaTimer.remove(false); // Anula próximos quizzes

            this.mostrarVitoriaBoss();
            return;
        }

        // Condição de Derrota: O Herói alcançou 0 ou menos de saúde.
        if (this.hpJogador <= 0) {
            this.partidaEncerrada = true;
            this.physics.pause();
            if (this.spawnTimer) this.spawnTimer.paused = true;
            if (this.perguntaTimer) this.perguntaTimer.remove(false); // Anula próximos quizzes

            this.mostrarGameOver();
        }
    }

    update() {
        // Update é executado ≈ 60 vezes por segundo (fps). Se for final de jogo / pausa para pergunta, ele dorme.
        if (this.partidaEncerrada || this.perguntaAtiva) return;

        // Limpa os projéteis "mortos" do jogador que atravessaram a borda direita (+x)
        this.projeteisJogador.children.each((projetil) => {
            if (projetil.active && projetil.x > this.larguraJogo + 20) projetil.destroy();
        });

        // Limpa os projéteis inimigos do chefão que sumiram nas bordas para economizar memória e evitar lag
        this.projeteisChefao.children.each((projetil) => {
            if (projetil.active && (projetil.x < -30 || projetil.x > this.larguraJogo + 30 || projetil.y < -30 || projetil.y > this.alturaJogo + 30)) {
                projetil.destroy();
            }
        });

        // Lógica de Dash (Corrida/Esquiva) quando Shift for apertado
        if (Phaser.Input.Keyboard.JustDown(this.teclaShift) && this.time.now - this.tempoUltimoDash >= this.cooldownDash) {
            this.tempoUltimoDash = this.time.now;
            this.dashAtivoAte = this.time.now + 140; // Mantém o dash por breves 140 milissegundos

            // Avalia o vetor atual (onde o jogador está mirando nas setas)
            const direcaoX = this.teclado.left.isDown ? -1 : (this.teclado.right.isDown ? 1 : 0);
            const direcaoY = this.teclado.up.isDown ? -1 : (this.teclado.down.isDown ? 1 : 0);

            // Verifica se o jogador estava com os comandos em ponto morto e usa o recurso das "últimas teclas válidas"
            const semInputAtual = direcaoX === 0 && direcaoY === 0;
            const dx = semInputAtual ? this.ultimaDirecaoX : direcaoX;
            const dy = semInputAtual ? this.ultimaDirecaoY : direcaoY;
            const normal = Math.max(1, Math.hypot(dx, dy));

            // Empurra a velocidade de forma brutal em direção ao movimento
            this.player.body.setVelocity((dx / normal) * 520, (dy / normal) * 520);

            // Adiciona o brilho do rastro (invisibilidade gráfica leve)
            this.tweens.add({ targets: this.player, alpha: 0.6, duration: 60, yoyo: true });
        }

        // Lógica de Movimentação Livre e Constante do Jogador nas Setas (caso o Dash não esteja ocorrendo)
        if (this.time.now >= this.dashAtivoAte) {
            let moveX = 0; let moveY = 0;

            if (this.teclado.left.isDown) moveX = -1; else if (this.teclado.right.isDown) moveX = 1;
            if (this.teclado.up.isDown) moveY = -1; else if (this.teclado.down.isDown) moveY = 1;

            if (moveX !== 0 || moveY !== 0) {
                // Normalização evita que andar na diagonal se torne ~40% mais rápido!
                const normal = Math.max(1, Math.hypot(moveX, moveY));
                this.player.body.setVelocity((moveX / normal) * 220, (moveY / normal) * 220);
            } else {
                // Trava o personagem no ar com velocidade zerada
                this.player.body.setVelocity(0, 0);
            }
        }

        // Renova constantemente a variável que rastreia para onde o herói olhou por último
        const inputX = this.teclado.left.isDown ? -1 : (this.teclado.right.isDown ? 1 : 0);
        const inputY = this.teclado.up.isDown ? -1 : (this.teclado.down.isDown ? 1 : 0);
        if (inputX !== 0 || inputY !== 0) {
            const normalInput = Math.max(1, Math.hypot(inputX, inputY));
            this.ultimaDirecaoX = inputX / normalInput;
            this.ultimaDirecaoY = inputY / normalInput;
        }

        // Deixa a imagem ligeiramente torta no eixo do Vôo
        const inclinacao = Phaser.Math.Clamp(this.player.body.velocity.y * 0.08, -12, 12);
        this.player.setAngle(inclinacao);

        // Funções passivas que acontecem mesmo de forma silenciosa e dependem dos relógios
        this.dispararJogador();
        this.atualizarPadraoDisparo();
    }

    mostrarVitoriaBoss() {
        const cx = this.larguraJogo / 2;
        const cy = this.alturaJogo / 2;

        this._vitoriaAvancou = false;
        const irParaCutscene = () => {
            if (this._vitoriaAvancou) return;
            this._vitoriaAvancou = true;
            this.scene.start("CutsceneFinal", { personagem: this.personagemSelecionado });
        };

        const overlay = this.add.image(cx, cy, "conclusao4")
            .setDisplaySize(this.larguraJogo, this.alturaJogo)
            .setDepth(50)
            .setAlpha(0);

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                overlay.setInteractive({ useHandCursor: true });
                overlay.on("pointerdown", irParaCutscene);

                this.time.delayedCall(1250, () => {
                    this.tweens.add({
                        targets: overlay,
                        alpha: 0,
                        duration: 250,
                        onComplete: irParaCutscene
                    });
                });
            }
        });
    }

    mostrarGameOver() {
        this.gameOver = true;

        const cx = this.larguraJogo / 2;
        const cy = this.alturaJogo / 2;

        const overlay = this.add.image(cx, cy, "gameOver2")
            .setDisplaySize(this.larguraJogo, this.alturaJogo)
            .setDepth(50)
            .setAlpha(0);

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500
        });
    }
}