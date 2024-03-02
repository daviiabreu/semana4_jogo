class Score { //cria a classe Score
  constructor() {
    this.score = 0; //inicia o score com 0
    this.scoreText = null; 
  }

  createScoreText(scene) { //cria o texto do score
    this.scoreText = scene.add.text(config.width - 180, 30, 'Score: 0', {
      fontSize: '24px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 },
      borderRadius: 5
    }).setScrollFactor(0); //faz com que o texto não se mova com a câmera
  }

  updateScore(points) { //atualiza o score
    this.score += points; //adiciona os pontos ao score
    this.scoreText.setText('Score: ' + this.score); //atualiza o texto do score
  }
}

class Level extends Phaser.Scene { //cria a classe Level que extende a classe Scene do Phaser 
  constructor(key) {
    super(key);     
    this.levelKey = key
    this.nextLevel = { //cria um objeto com os próximos níveis
      'Level1': 'Level2',
      'Level2': 'Level3', 
      'Level3': 'Level4',
      'Level4': 'Credits',
    }
    this.scoreManager = new Score(); 
    this.coins = null; 
  }

  preload() { //carrega os assets
    this.load.image('platform', 'assets/platform.png');
    this.load.image('snowflake', 'assets/floco.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.image('bomb', 'assets/bomb.png');

    this.load.spritesheet('campfire', 'assets/campfire.png', { frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('zelda', 'assets/zelda.png', { frameWidth: 96, frameHeight: 104});

    this.load.image('bg1', 'assets/mountain.png');
    this.load.image('bg2', 'assets/trees.png');
    this.load.image('bg3', 'assets/neve.png');
  }

  create() { //cria os elementos do jogo 
    gameState.active = true //ativa o jogo

    gameState.bgColor = this.add.rectangle(0, 0, config.width, config.height, 0x00ffbb).setOrigin(0, 0);
    this.createStars(); //cria as estrelas
    this.createParallaxBackgrounds(); //cria o background

    gameState.player = this.physics.add.sprite(125, 110, 'zelda').setScale(.5); //cria o personagem
    gameState.platforms = this.physics.add.staticGroup(); //cria o grupo de plataformas

    this.scoreManager.createScoreText(this); //cria o texto do score

    this.createAnimations(); //cria as animações
 
    this.createSnow(); //cria a neve

    this.levelSetup(); //cria os níveis

    this.createCoin(); //cria as moedas

    this.cameras.main.setBounds(0, 0, gameState.bg3.width, gameState.bg3.height); //limita a câmera
    this.physics.world.setBounds(0, 0, gameState.width, gameState.bg3.height + gameState.player.height); //limita o mundo

    this.cameras.main.startFollow(gameState.player, true, 0.5, 0.5) //faz a câmera seguir o personagem
    gameState.player.setCollideWorldBounds(true); //seta as colides com o mundo

    this.physics.add.collider(gameState.player, gameState.platforms); //colide o personagem com as plataformas
    this.physics.add.collider(gameState.goal, gameState.platforms); //colide o objetivo (fogueira) com as plataformas
                                                                     
    gameState.cursors = this.input.keyboard.createCursorKeys(); //cria as setas do teclado
  }

  createPlatform(xIndex, yIndex) {
    // cria as plataformas espaçadas de acordo com o index
    // Se um deles não for um número, não criará uma plataforma
      if (typeof yIndex === 'number' && typeof xIndex === 'number') {
        gameState.platforms.create((220 * xIndex),  yIndex * 70, 'platform').setOrigin(0, 0.5).refreshBody();
      }
  }

  createSnow() { //criando a neve 
    gameState.particles = this.add.particles('snowflake'); //adiciona a partícula de neve

    gameState.emitter = gameState.particles.createEmitter({ //cria o emissor de partículas
      x: {min: 0, max: config.width * 2 }, //posição x
      y: -5, //posição y
      lifespan: 2000, //tempo de vida da partícula
      speedX: { min:-5, max: -200 }, //velocidade x da partícula
      speedY: { min: 200, max: 400 },  //velocidade y da partícula
      scale: { start: 0.6, end: 0 }, //escala da partícula (vai diminuindo)
      quantity: 10, //quantidade de partículas
      blendMode: 'ADD' //modo de mistura
    })

    gameState.emitter.setScrollFactor(0); //faz com que o emissor de partículas não se mova com a câmera
  }

  createAnimations() {
    this.anims.create({ //cria a animação de correr
      key: 'run',
      frames: this.anims.generateFrameNumbers('zelda', { start: 70, end: 79 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({ //cria a animação de ficar parado
      key: 'idle',
      frames: this.anims.generateFrameNumbers('zelda', { start: 0, end: 2 }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({ //cria a animação de pular
      key: 'jump',
      frames: this.anims.generateFrameNumbers('zelda', { start: 30, end: 32 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({ //cria a animação da fogueira que finaliza o nível
      key: 'fire',
      frames: this.anims.generateFrameNumbers('campfire'),
      frameRate: 10,
      repeat: -1
    })
  }

  createParallaxBackgrounds() { //cria o background, que foi feito com o efeito parallax
    gameState.bg1 = this.add.image(0, 0, 'bg1'); 
    gameState.bg2 = this.add.image(0, 0, 'bg2');
    gameState.bg3 = this.add.image(0, 0, 'bg3');

    gameState.bg1.setOrigin(0, 0); //setando a origem de cada bg
    gameState.bg2.setOrigin(0, 0);
    gameState.bg3.setOrigin(0, 0);

    const game_width = parseFloat(gameState.bg3.getBounds().width)  //pegando a largura do bg3
    gameState.width = game_width;  //setando a largura do bg3
    const window_width = config.width  //pegando a largura da janela

    const bg1_width = gameState.bg1.getBounds().width //mesma coisa para o bg1
    const bg2_width = gameState.bg2.getBounds().width
    const bg3_width = gameState.bg3.getBounds().width

    gameState.bgColor .setScrollFactor(0); //faz com que o background não se mova com a câmera
    gameState.bg1.setScrollFactor((bg1_width - window_width) / (game_width - window_width));  //faz com que o bg1 se mova com a câmera
    gameState.bg2.setScrollFactor((bg2_width - window_width) / (game_width - window_width)); //faz com que o bg2 se mova com a câmera
  }

  createCoin() {
    this.coins = this.physics.add.group(); // Cria o grupo de moedas
    for (let i = 0; i < 10; i++) { // Cria 10 moedas
      let xCoord = Math.floor(Math.random() * config.width); // Posição x aleatória
      let yCoord = Math.floor(Math.random() * config.height); // Posição y aleatória
      const coin = this.coins.create(xCoord, yCoord, 'coin').setOrigin(0, 0.5).setScale(0.8); // Cria a moeda
      coin.setCollideWorldBounds(true); //faz a moeda colidir com o mundo
      coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6)); //faz a moeda quicar
    }

    this.physics.add.collider(this.coins, gameState.platforms); // Adiciona colisão com as plataformas
    this.physics.add.overlap(gameState.player, this.coins, this.collectCoin, null, this); // Adiciona a sobreposição com o jogador
  }

  updateScore(points) { //atualiza o score
    this.scoreManager.updateScore(points); //chama a função updateScore da classe Score
  }

  resetScore() {
    gameState.score = 0; // Reseta o score para 0
    // Adicione qualquer outra lógica relacionada ao reset do score aqui
  }

  collectCoin(player, coin) { // Função para coletar a moeda
    coin.disableBody(true, true); // Desativa a moeda
    this.updateScore(10); // Aumenta a pontuação
  }

  levelSetup() {  //cria as plataformas de acordo com o index
    for (const [xIndex, yIndex] of this.heights.entries()) {
      this.createPlatform(xIndex, yIndex);
    } 
    
    // Criando a fogueira no final do nivel para mudar de fase
    gameState.goal = this.physics.add.sprite(gameState.width - 40, 100, 'campfire');

    this.physics.add.overlap(gameState.player, gameState.goal, function() {    //quando o personagem colide com a fogueira
      this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) { //faz a câmera dar um fade
        if (progress > .9) {                                                   //quando o fade estiver completo
          this.scene.stop(this.levelKey);                                      //para a cena atual
          this.scene.start(this.nextLevel[this.levelKey]);                     //inicia a próxima cena/nível
        }
      });
    }, null, this);

    this.setWeather(this.weather); //seta o clima para o level
  }

  update() { 
    if(gameState.active){ 
      gameState.goal.anims.play('fire', true);
      if (gameState.cursors.right.isDown) { //movimentação do personagem (direita)
        gameState.player.flipX = false;
        gameState.player.setVelocityX(gameState.speed);
        gameState.player.anims.play('run', true);
      } 
      
      else if (gameState.cursors.left.isDown) { //movimentação do personagem (esquerda)
        gameState.player.flipX = true;
        gameState.player.setVelocityX(-gameState.speed);
        gameState.player.anims.play('run', true);
      } 
      
      else {
        gameState.player.setVelocityX(0); //personagem parado
        gameState.player.anims.play('idle', true);
      }

      //pulo do personagem
      if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space) && gameState.player.body.touching.down) { 
        gameState.player.anims.play('jump', true); 
        gameState.player.setVelocityY(-500);
      }

      //animação do pulo
      if (!gameState.player.body.touching.down){  
        gameState.player.anims.play('jump', true); 
      }

      if (gameState.player.y > gameState.bg3.height) {                        //se o personagem "cair da tela"
        this.cameras.main.shake(240, .01, false, function(camera, progress) { //faz a câmera tremer (da sensação de que "errou" a fase)
          if (progress > .9) {                                                //quando o tremor estiver completo
            this.scene.restart(this.levelKey);                                //reinicia a cena
            this.resetScore();                                                //reseta o score  
          }
        });
      }
    }
  }

  createStars() {                  //criando as estrelas para a fase da noite
    gameState.stars = [];          //cria um array para armazenar as estrelas
    function getStarPoints() {     //função para criar as estrelas
      const color = 0xffffff;      //cor das estrelas (branco)
      return {
        x: Math.floor(Math.random() * 900),                 //posição x aleatória
        y: Math.floor(Math.random() * config.height * .5),  //posição y aleatória
        radius: Math.floor(Math.random() * 3),              //raio aleatório
        color,                                              //cor
      }
    }
    for (let i = 0; i < 200; i++) {                     //cria 200 estrelas (até o i ser menor que 200)
      const { x, y, radius, color} = getStarPoints();   //pega as propriedades das estrelas
      const star = this.add.circle(x, y, radius, color) //cria a estrela
      star.setScrollFactor(Math.random() * .1);         //faz com que as estrelas se movam com a câmera (efeito legal)
      gameState.stars.push(star)                        //adiciona a estrela no array que lista as estrelas
    }
  }

  setWeather(weather) { //função para setar o clima (cores, velocidade do vento, quantidade de neve, cor do background)
    const weathers = { //o clima muda de acordo com a fase

      'morning': { //manhã
        'color': 0xecdccc, //cor do personagem (bege claro)
        'snow':  2, //quantidade de neve (pouca neve)
        'wind':  10, //velocidade do vento (vento fraco)
        'bgColor': 0xF8c3aC, //cor do background (laranja claro)
      },

      'afternoon': { //tarde
        'color': 0xffffff, //cor do personagem (branco)
        'snow':  0, //quantidade de neve (pouca neve)
        'wind': 50, //velocidade do vento (vento médio)
        'bgColor': 0x0571FF, //cor do background (azul)
      }, 

      'twilight': { //crepúsculo
        'color': 0xccaacc, //cor do personagem (lilás)
        'bgColor': 0x18235C, //cor do background (azul escuro)
        'snow':  8, //quantidade de neve (muita neve)
        'wind': 200, //velocidade do vento (vento forte)
      },

      'night': { //noite
        'color': 0x555555, //cor do personagem (cinza)
        'bgColor': 0x000000, //cor do background (preto - destaca as estrelas - contraste branco e preto)
        'snow':  0.5, //quantidade de neve (nenhuma neve)
        'wind': 0, //velocidade do vento (sem vento)
      },
    }
    let { color, snow, wind, bgColor } = weathers[weather]; //pega as propriedades do clima
    gameState.bg1.setTint(color); //seta a cor do background1 (montanhas)
    gameState.bg2.setTint(color); //seta a cor do background2 (árvores)
    gameState.bg3.setTint(color); //seta a cor do background3 (neve)
    gameState.bgColor.fillColor = bgColor; //seta a cor do background
    gameState.emitter.setQuantity(snow); //seta a quantidade de neve
    gameState.emitter.setSpeedX(-wind); //seta a velocidade do vento
    gameState.player.setTint(color); //seta a cor do personagem
    for (let platform of gameState.platforms.getChildren()) { 
      platform.setTint(color); //seta a cor das plataformas
    }
    if (weather === 'night') { //faz as estrelas ficarem visíveis apenas na fase da noite
      gameState.stars.forEach(star => star.setVisible(true));
    } else {
      gameState.stars.forEach(star => star.setVisible(false));
    }

    return
  }
}

class Level1 extends Level { //cria a classe Level1 que extende a classe Level
  constructor() { //construtor da classe
    super('Level1') //chama o construtor da classe pai/mãe
    this.heights = [4, 7, 5, null, 5, 4, null, 4, 4]; //cria as plataformas em diferentes alturas
    this.weather = 'afternoon'; //seta o clima tarde para essa fase
  }
}

class Level2 extends Level { 
  constructor() {
    super('Level2')
    this.heights = [5, 4, null, 4, 6, 4, 6, 5, 5]; //cria as plataformas em diferentes alturas
    this.weather = 'twilight'; //seta o clima noite para essa fase
  }
}

class Level3 extends Level {
  constructor() {
    super('Level3')
    this.heights = [6, null, 6, 4, 6, 4, 5, null, 4]; //cria as plataformas em diferentes alturas
    this.weather = 'night'; //seta o clima noite para essa fase
  }
}

class Level4 extends Level {
  constructor() {
    super('Level4')
    this.heights = [4, null, 3, 6, null, 6, null, 5, 4]; //cria as plataformas em diferentes alturas
    this.weather = 'morning'; //seta o clima manhã para essa fase
  }
}

class Credits extends Phaser.Scene { //cria a classe Credits que extende a classe Scene
  constructor() {
    super('Credits')
  }

  create() {
    const text = this.add.text(config.width / 2, config.height / 2, 'You Win!', { //cria o texto de vitória
      fontSize: '32px',
      fill: '#fff'
    });
    text.setOrigin(0.5);
  }  
}

const gameState = { //estado do jogo
  speed: 240, //velocidade do personagem
  ups: 380, //velocidade do pulo
};

const config = { //configurações do jogo
  type: Phaser.AUTO,
  width: 500,
  height: 600,
  fps: {target: 60},
  backgroundColor: "b9eaff",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 }, //setando a gravidade
      enableBody: true, 

    }
  },
  scene: [Level1, Level2, Level3, Level4, Credits] //cenas do jogo
};

const game = new Phaser.Game(config); //cria o jogo com as configurações