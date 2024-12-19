import Phaser from "phaser"
import $ from 'jquery'


let is_game_on = false;
let cart, wheel1, wheel2;
let sandParticles = [];
let maxSandParticles = 1000;
let stop_btn = $("#stop_btn");
let start_btn = $("#start_btn");
let restart_btn = $("#reload_btn");
let cart_init_force = 50;
let startY = 230;
let is_game_started = false;
let ground;
let cart_mass = 1;
let cart_length;
let mu;
let sand_drop;
let time = 0;
const FPS = 60;



function fillParameters(){
  let mass_parameter = $("#mass-parameter").val();
  let cart_length_parameter = $("#cart-length").val();
  let f_parameter = $("#f-parameter").val();
  let mu_parameter = $("#mu-parameter").val();
  if(mass_parameter === "" || cart_length_parameter === "" || f_parameter === "" || mu_parameter === ""){
    return false;
  }
  cart_mass = parseFloat(mass_parameter,10);
  cart_length = parseFloat(cart_length_parameter, 10);
  cart_init_force = parseFloat(f_parameter, 10);
  mu = parseFloat(mu_parameter, 10);
  return true;
}

start_btn[0].addEventListener('click',() => {
  if(!is_game_on && !is_game_started){
    if(fillParameters()){
      startGame();
      is_game_started = true;
      is_game_on = true;
    }
  }
});

function startGame(){
  var config = {
    type: Phaser.AUTO,
    width: 1500,
    height: 300,
    parent: 'game-container',
    scene: {
        key: 'MainScene',
        preload: preload,
        create: create,
        update: update
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 }, // Гравитация вниз
        debug: false          // Отображение физических границ
      }
    },
  };
  
  let game = new Phaser.Game(config);

  function preload (){
    this.cameras.main.setBackgroundColor('#ffffff');
  }

  function create(){
    //пол
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1); // Зеленый цвет, непрозрачный
    graphics.fillRect(0, 250, 1500, 50); // x, y, ширина, высота
    ground = this.add.rectangle(750, 275, 1500, 50); // Центрируем прямоугольник
    this.physics.add.existing(ground, true);
    //пол
    //жерново
    //300 -> 290 (3.5% от длины) - длина первого верхнего блока
    this.add.rectangle(cart_length*0.965/2, 130, cart_length*0.965, 20, 0xA9A9A9)
    graphics.fillStyle(0xA9A9A9, 1); // серый цвет, полностью непрозрачный

    // Настраиваем стиль обводки (цвет и толщина линии)

    // Начинаем рисовать треугольник
    graphics.beginPath();
    graphics.moveTo(cart_length*0.965, 115); // Первая вершина (верхняя точка треугольника)
    graphics.lineTo(cart_length*0.965, 145); // Вторая вершина (левая нижняя точка)
    //правая нижняя вершина - cart_length+5%
    graphics.lineTo(cart_length*1.05, 145); // Третья вершина (правая нижняя точка)
    graphics.closePath(); // Замыкаем треугольник

    // Заливаем треугольник цветом
    graphics.fillPath();

    graphics.beginPath();
    graphics.moveTo(cart_length*1.05 + 2, 145); // Третья вершина (правая нижняя точка)
    graphics.lineTo(cart_length*1.05 + 2 + cart_length*0.0833, 145); // Вторая вершина (левая нижняя точка)
    graphics.lineTo(cart_length*1.05 + 2 + cart_length*0.0833, 115); // Третья вершина (правая нижняя точка)
    graphics.closePath(); // Замыкаем треугольник
    //длина второго квадрата = 1500 - cart_length*1.05 + 2 + cart_length*0.0833
    //центр второго квадрата = cart_length*1.05 + 2 + cart_length*0.0833 + половина длины
    const second_cube_length = 1500 - cart_length*1.05 + 2 + cart_length*0.0833;
    this.add.rectangle(cart_length*1.05 + 2 + cart_length*0.0833 + second_cube_length/2,130, second_cube_length,20,0xA9A9A9)

    // Заливаем треугольник цветом
    graphics.fillPath();

    //жерново
    graphics.fillStyle(0xffff00, 1);
    graphics.beginPath();
    graphics.moveTo(cart_length*0.96, 115);
    graphics.lineTo(cart_length*1.06 + 2 + cart_length*0.0833, 115);
    graphics.lineTo(cart_length*1.055, 146);
    graphics.closePath();
    graphics.fillPath();

    cart = this.add.rectangle(cart_length*0.5+5, startY-10, cart_length, 20, 0xff0000); // Красный квадрат
    this.physics.add.existing(cart); // Добавляем физическое тело
    cart.body.setCollideWorldBounds(true); // Не позволяет выйти за границы экрана
    cart.body.setImmovable(false);
    cart.body.setFriction(0);
    cart.body.setAllowGravity(false);
    wheel1 = this.add.circle(cart_length*0.5+5 + cart_length*0.25, startY+5, 15*(cart_length/300), 0xff0000); // Левое колесо
    wheel2 = this.add.circle(cart_length*0.5+5 - cart_length*0.25, startY+5, 15*(cart_length/300), 0xff0000); // Правое колесо
    this.physics.add.existing(wheel1);
    this.physics.add.existing(wheel2);
    this.physics.add.collider(cart, ground);
    this.physics.add.collider(wheel1, ground);
    this.physics.add.collider(wheel2, ground);

    cart.body.setVelocityX(cart_init_force/(cart_mass*3));
    wheel1.body.setVelocityX(cart_init_force/(cart_mass*3));
    wheel2.body.setVelocityX(cart_init_force/(cart_mass*3));

    sand_drop = this.time.addEvent({
      delay: (1/mu)*30,
      callback: () => createSandParticle(this),
      loop: true
    });

    stop_btn.click(() => {
      this.scene.pause();
      is_game_on = false;
    });
    restart_btn.click(() => {
      clear();
      time = 0;
      game.destroy(true);
      $("#game-container").html('');
      is_game_on = false;
      is_game_started = false;
      sandParticles = [];
      stop_btn.off('click');
      start_btn.off('click');
      $("#parameters-form > input").val("");
    })
    start_btn.click(() => {
      if(!is_game_on && is_game_started){
          this.scene.resume();
          is_game_on = true;
      }
    })
  }

  function update(){
    if(!is_game_on)
      this.scene.pause();
    m(time,cart_mass);
    let amoment = a(time,cart_init_force,cart_mass); // моментальное ускорение
    u(time,amoment);
    x(time,cart.body.position.x);
    time += Math.pow(FPS,-1);
    sandParticles.forEach((particle, index) => {
        if (Phaser.Geom.Intersects.RectangleToRectangle(particle.getBounds(), cart.getBounds())) {
          particle.destroy(); // Удаляем песчинку
          sandParticles.splice(index, 1); // Удаляем из массива
          cart_mass += 0.1; // Увеличиваем массу тележки
          updateCartSpeed(); // Обновляем скорость тележки
        }
        if (Phaser.Geom.Intersects.RectangleToRectangle(particle.getBounds(), ground.getBounds())) {
          particle.destroy(); // Удаляем песчинку
          sandParticles.splice(index, 1);
        }
    });
  }

  function createSandParticle(scene) {
    if (sandParticles.length < maxSandParticles) {
      const x = Phaser.Math.Between(cart_length*1.05, cart_length*1.05 + 4); // Случайная координата по x
      const particle = scene.add.rectangle(x, 130, 3, 3, 0xffff00); // Песчинка
      scene.physics.add.existing(particle); // Добавляем физику
      sandParticles.push(particle);
    }
  }

  function updateCartSpeed() {
    const adjust_speed = cart_init_force/(cart_mass*3);
    cart.body.setVelocityX(adjust_speed);
    wheel1.body.setVelocityX(adjust_speed);
    wheel2.body.setVelocityX(adjust_speed);
  }
}
