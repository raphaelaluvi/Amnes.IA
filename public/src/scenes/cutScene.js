// Exporta classe Cutscene
export class Cutscene extends Phaser.Scene {

  // Define altura e largura do jogo
  alturaJogo = 600;
  larguraJogo = 1000;

  // Construtor da cena, usado para navegar entre páginas
  constructor() {
    super("Cutscene");
  }

  // Recebe qual personagem foi selecionado da cena anterior
  init(data) {
    this.personagemNum = data.personagem ?? 0;
  }

  preload() {
    // Ignora erros de carregamento (ex: áudio bloqueado no Pages)
    this.load.on('loaderror', () => { });
    this.load.audio("quarto", "public/assets/musicas/quarto.mp3");

    // Carrega as imagens da cena
    this.load.image("cutRuiva1", "public/assets/cutscene/CutRuiva1.webp");
    this.load.image("cutRuiva2", "public/assets/cutscene/CutRuiva2.webp");
    this.load.image("cutRuiva3", "public/assets/cutscene/CutRuiva3.webp");

    this.load.image("cutMorena1", "public/assets/cutscene/CutMorena1.webp");
    this.load.image("cutMorena2", "public/assets/cutscene/CutMorena2.webp");
    this.load.image("cutMorena3", "public/assets/cutscene/CutMorena3.webp");

    this.load.image("cutMoreno1", "public/assets/cutscene/CutMoreno1.webp");
    this.load.image("cutMoreno2", "public/assets/cutscene/CutMoreno2.webp");
    this.load.image("cutMoreno3", "public/assets/cutscene/CutMoreno3.webp");

    this.load.image("card1", "public/assets/cutscene/card1.webp");
    this.load.image("card2", "public/assets/cutscene/card2.webp");
    this.load.image("card3", "public/assets/cutscene/card3.webp");
    this.load.image("card4", "public/assets/cutscene/card4.webp");
    this.load.image("card5", "public/assets/cutscene/card5.webp");

    this.load.image("botaoNext", "public/assets/cutsceneFinal/botãoNext.png");

    this.load.image("options", "public/assets/options.webp");
  }

  create() {
    try {
      if ((!this.game.quarto || !this.game.quarto.isPlaying) && this.cache.audio.exists("quarto")) {
        this.game.quarto = this.sound.add("quarto", { loop: true, volume: 0.1 });
        this.game.quarto.play();
      }
    } catch (e) { }

    // Define a cor de fundo da cena
    this.cameras.main.setBackgroundColor("#5e453c");

    // Variável para controlar clicadas no botão
    this.qtdSkip = 0;

    // Adiciona o botão next e imagens
    const botaoNext = this.add.image(795, 500, "botaoNext").setScale(0.2).setInteractive({ useHandCursor: true }).setDepth(1);

    this.cutsceneImg = this.add.image(this.larguraJogo / 2, this.alturaJogo / 2, "").setScale(0.85);

    this.cardImg = this.add.image(this.larguraJogo / 2, 530, "").setDepth(1);

    this.cards = ["card1", null, "card2", "card3", "card4", "card5"];

    // Define as imagens de cada momento para cada personagem
    this.cuts = [
      ["cutMoreno1", "cutMoreno2", "cutMoreno2", "cutMoreno3", "cutMoreno3", "cutMoreno3"],
      ["cutMorena1", "cutMorena2", "cutMorena2", "cutMorena3", "cutMorena3", "cutMorena3"],
      ["cutRuiva1", "cutRuiva2", "cutRuiva2", "cutRuiva3", "cutRuiva3", "cutRuiva3"]
    ];

    this.atualizarCena();

    // Botão pause
    const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(2).setInteractive({ useHandCursor: true });
    btnPause.on("pointerdown", () => {
      this.scene.launch("Pause", { from: "Cutscene" });
      this.scene.pause("Cutscene");
    });
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("Pause", { from: "Cutscene" });
      this.scene.pause("Cutscene");
    });

    // Evento no botão para avançar a cutscene
    botaoNext.on("pointerdown", () => {
      this.qtdSkip++;

      // Se todas as cenas foram mostradas, inicia a próxima enviando o personagem selecionado
      if (this.qtdSkip >= this.cards.length) {
        this.scene.start("Room", { personagem: this.personagemNum });
        return;
      }

      // Puxa a função que atualiza a cena
      this.atualizarCena();
    });
  }

  atualizarCena() {

    // Define a textura de acordo com o personagem e a quantidade que o botão foi clicado
    const textura = this.cuts[this.personagemNum][this.qtdSkip];
    this.cutsceneImg.setTexture(textura);

    // Define qual card é adicionado, de acordo com os cliques
    this.cardImg.setTexture(
      this.cards[this.qtdSkip]
    );

    const cardAtual = this.cards[this.qtdSkip];

    // Se o card for igual a null, torna invisível ou visível se tiver um valor
    if (cardAtual === null) {
      this.cardImg.setVisible(false);
    } else {
      this.cardImg.setTexture(cardAtual);
      this.cardImg.setVisible(true);
    }

  }

  update() {

  }
}