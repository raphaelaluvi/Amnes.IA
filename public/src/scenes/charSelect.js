// Exporta classe CharSelect
export class CharSelect extends Phaser.Scene {
  constructor() {
    super({ key: "CharSelect" });
    this.personagemSelecionado = { numero: -1 };
    this.personagens = ["Brenno", "Ana", "Hannah"];
  }

  preload() {
    // Fundo de tela 
    this.load.image("cs_bg", "public/assets/start/fundostart.webp");

    // Pop-up de seleção
    this.load.image("cs_popup", "public/assets/selecao/fundo-sel.webp");

    // Estados do card
    this.load.image("cs_card",       "public/assets/selecao/card.webp");
    this.load.image("cs_card_hover", "public/assets/selecao/card-mouse-over.webp");
    this.load.image("cs_card_sel",   "public/assets/selecao/card-selecionado.webp");

    // Botão confirmar
    this.load.image("cs_btn_off", "public/assets/selecao/btn_desativado.webp");
    this.load.image("cs_btn_on",  "public/assets/selecao/btn_ativado.webp");
    this.load.image("cs_btn_hov", "public/assets/selecao/btn_hover.webp");

    // Retratos dos personagens
    this.load.image("cs_p1", "public/assets/moreno.webp");
    this.load.image("cs_p2", "public/assets/morena.webp");
    this.load.image("cs_p3", "public/assets/ruiva.webp");
    this.load.image("options", "public/assets/options.webp");
  }

  create() {
    this.events.on("shutdown", () => {
        if (this.game.menuMusic) {
            this.game.menuMusic.stop();
            this.game.menuMusic = null;
        }
    });

    const W = this.scale.width;   
    const H = this.scale.height;  

    //Fundo
    const bg = this.add.image(W / 2, H / 2, "cs_bg").setDepth(0);
    bg.setScale(Math.max(W / bg.width, H / bg.height));

    //Pop-up central 
    const popup = this.add.image(W / 2, H / 2, "cs_popup").setDepth(1);
    const popupScale = 680 / popup.width;          
    popup.setScale(popupScale);

    const popupH   = popup.height * popupScale;     
    const popupTop = H / 2 - popupH / 2;            

    //Título 
    this.add.text(W / 2, popupTop + 35, "SELEÇÃO DE PERSONAGEM", {
      fontFamily: "Silkscreen",
      fontSize: "18px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(2);

    //Texto de status 
    this.textoStatus = this.add.text(W / 2, popupTop + 56, "escolha seu personagem", {
      fontFamily: "Silkscreen",
      fontSize: "13px",
      color: "#ccddff",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(2);

    // Cards
    const CARD_SCALE = 0.4;
    const spacing    = 210;               
    const startX     = W / 2 - spacing;  
    const cardY      = 317;              

    this.cards = [0, 1, 2].map((i) =>
      this.add.image(startX + i * spacing, cardY, "cs_card")
        .setInteractive()
        .setDepth(2)
        .setScale(CARD_SCALE)
    );

    //Retratos dos personagens
    const charKeys = ["cs_p1", "cs_p2", "cs_p3"];
    const cardRenderH = 589 * CARD_SCALE;

    const targetCharH = cardRenderH * 0.60;
    const charMult = [1.15, 1.0, 1.0];
    charKeys.forEach((key, i) => {
      const src   = this.textures.get(key).getSourceImage();
      const scale = (targetCharH / src.height) * charMult[i];
      this.add.image(startX + i * spacing, cardY - cardRenderH * 0.05, key)
        .setScale(scale)
        .setDepth(3);

      // Nome do personagem no card
      this.add.text(startX + i * spacing, cardY + cardRenderH * 0.28, this.personagens[i], {
        fontFamily: "Silkscreen",
        fontSize: "11px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(4);
    });

    //Botão Confirmar
    const btnY = popupTop + popupH - 50;

    this.btnConfirmar = this.add
      .image(W / 2, btnY, "cs_btn_off")
      .setInteractive()
      .setDepth(3)
      .setScale(0.65)
      .setAlpha(0.50);

    this.textoBotao = this.add.text(W / 2, btnY, "CONFIRMAR", {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#334466",
      letterSpacing: 4
    }).setOrigin(0.5).setDepth(4);

    // Botão pause
    const btnPause = this.add.image(955, 570, "options").setScale(0.1).setDepth(100).setInteractive({ useHandCursor: true });
    btnPause.on("pointerdown", () => {
        this.scene.launch("Pause", { from: "CharSelect" });
        this.scene.pause("CharSelect");
    });
    this.input.keyboard.on("keydown-ESC", () => {
        this.scene.launch("Pause", { from: "CharSelect" });
        this.scene.pause("CharSelect");
    });

    //Interação dos cards
    const femininos = [false, true, true]; // Brenno=masc, Ana=fem, Hannah=fem

    for (let i = 0; i < 3; i++) {
      const card  = this.cards[i];
      const isSel = () => this.personagemSelecionado.numero === i;

      card.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
        if (!isSel()) card.setTexture("cs_card_hover");
      });

      card.on("pointerout", () => {
        this.input.setDefaultCursor("default");
        if (!isSel()) card.setTexture("cs_card");
      });

      card.on("pointerdown", () => {
        this.personagemSelecionado.numero = i;

        // Atualiza visual de todos os cards
        this.cards.forEach((c, j) =>
          c.setTexture(j === i ? "cs_card_sel" : "cs_card")
        );

        // Ativa botão confirmar
        this.btnConfirmar.setTexture("cs_btn_on").setAlpha(1);
        this.textoBotao.setColor("#ffffff");
        const sufixo = femininos[i] ? "selecionada" : "selecionado";
        this.textoStatus.setText(`${this.personagens[i]} ${sufixo}!`);
      });
    }

    //  Interação do botão confirmar
    this.btnConfirmar.on("pointerover", () => {
      if (this.personagemSelecionado.numero > -1) {
        this.input.setDefaultCursor("pointer");
        this.btnConfirmar.setTexture("cs_btn_hov");
      }
    });

    this.btnConfirmar.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      if (this.personagemSelecionado.numero > -1) {
        this.btnConfirmar.setTexture("cs_btn_on");
      }
    });

    this.btnConfirmar.on("pointerdown", () => {
      if (this.personagemSelecionado.numero > -1) {
        this.input.setDefaultCursor("default");
        this.registry.set('personagem', this.personagemSelecionado.numero);
        this.scene.start("Cutscene", { personagem: this.personagemSelecionado.numero });
      }
    });
  }
}