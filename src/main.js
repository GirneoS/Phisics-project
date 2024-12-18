import Phaser from "phaser"
import $ from 'jquery'


var config = {
  type: Phaser.AUTO,
  width: 1500,
  height: 600,
  scene: {
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
let is_game_on = false;
let cart;
let sandParticles = [];
let maxSandParticles = 150;
const stop_btn = $("#stop_btn");
const start_btn = $("#start_btn");
const restart_btn = $("#reload_btn");
let cartMass = 1;
let cart_init_speed = 50;
let startX = 160;
let startY = 530;
let sand_drop;


function preload (){
  this.cameras.main.setBackgroundColor('#3498db');
}

function create(){
  //пол
  const graphics = this.add.graphics();
  graphics.fillStyle(0x4CAF50, 1); // Зеленый цвет, непрозрачный
  graphics.fillRect(0, 550, 1500, 50); // x, y, ширина, высота
  const ground = this.add.rectangle(400, 575, 1500, 50); // Центрируем прямоугольник
  this.physics.add.existing(ground, true);
  //пол
  //жерново
  this.add.rectangle(145,430,290,30, 0xA9A9A9)
  graphics.fillStyle(0xA9A9A9, 1); // серый цвет, полностью непрозрачный

  // Настраиваем стиль обводки (цвет и толщина линии)
  // graphics.lineStyle(4, 0x000000, 1); // Чёрный цвет, толщина 4

  // Начинаем рисовать треугольник
  graphics.beginPath();
  graphics.moveTo(290, 415); // Первая вершина (верхняя точка треугольника)
  graphics.lineTo(290, 445); // Вторая вершина (левая нижняя точка)
  graphics.lineTo(315, 445); // Третья вершина (правая нижняя точка)
  graphics.closePath(); // Замыкаем треугольник

  // Заливаем треугольник цветом
  graphics.fillPath();

  graphics.beginPath();
  graphics.moveTo(317, 445); // Первая вершина (верхняя точка треугольника)
  graphics.lineTo(342, 445); // Вторая вершина (левая нижняя точка)
  graphics.lineTo(342, 415); // Третья вершина (правая нижняя точка)
  graphics.closePath(); // Замыкаем треугольник

  this.add.rectangle(921,430,1158,30,0xA9A9A9)

  // Заливаем треугольник цветом
  graphics.fillPath();

  //жерново
  

  cart = this.add.rectangle(startX, startY, 300, 40, 0xff0000); // Красный квадрат
  this.physics.add.existing(cart); // Добавляем физическое тело
  cart.body.setCollideWorldBounds(true); // Не позволяет выйти за границы экрана
  this.physics.add.collider(cart, ground);
  cart.body.setImmovable(false);
  cart.body.setFriction(0);

  cart.body.setVelocityX(cart_init_speed);

  sand_drop = this.time.addEvent({
    delay: 30,
    callback: () => createSandParticle(this),
    loop: true
  });

  stop_btn.click(() => {
    this.scene.pause();
    is_game_on = false;
  });
  restart_btn.click(() => {
    cartMass = 1;
    sandParticles.forEach((particle) => particle.destroy());
    sandParticles = [];
    // cart.body.setVelocityX(0);
    // cart.body.setPosition(startX, startY);
    this.scene.restart();
    this.scene.pause();
    this.scene.resume();
  })
  start_btn.click(() => {
    if(!is_game_on){
      this.scene.resume();
      if(cart.body.velocity.x == 0){
        cart.body.setVelocityX(cart_init_speed/cartMass)
      }
      is_game_on = true;
    }
  })
}

function update(){
  if(!is_game_on)
    this.scene.pause();
  
  sandParticles.forEach((particle, index) => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(particle.getBounds(), cart.getBounds())) {
        // Если песчинка касается тележки
        particle.destroy(); // Удаляем песчинку
        sandParticles.splice(index, 1); // Удаляем из массива
        cartMass += 0.03; // Увеличиваем массу тележки
        updateCartSpeed(); // Обновляем скорость тележки
      }
    }
  )
}

function createSandParticle(scene) {
  if (sandParticles.length < maxSandParticles) {
    const x = Phaser.Math.Between(315,318); // Случайная координата по x
    const particle = scene.add.rectangle(x, 430, 3, 3, 0xffff00); // Песчинка
    scene.physics.add.existing(particle); // Добавляем физику
    sandParticles.push(particle);
  }
}

function updateCartSpeed() {
  const adjust_speed = cart_init_speed/cartMass;
  cart.body.setVelocityX(adjust_speed);
}

