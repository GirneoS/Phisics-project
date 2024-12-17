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
let cart_init_speed = 80;
let sand_drop;


function preload (){
  this.cameras.main.setBackgroundColor('#3498db');
}

function create(){
  const graphics = this.add.graphics();
  graphics.fillStyle(0x4CAF50, 1); // Зеленый цвет, непрозрачный
  graphics.fillRect(0, 550, 1500, 50); // x, y, ширина, высота

  const ground = this.add.rectangle(400, 575, 1500, 50); // Центрируем прямоугольник
  this.physics.add.existing(ground, true);

  cart = this.add.rectangle(100, 530, 300, 40, 0xff0000); // Красный квадрат
  this.physics.add.existing(cart); // Добавляем физическое тело
  cart.body.setCollideWorldBounds(true); // Не позволяет выйти за границы экрана
  this.physics.add.collider(cart, ground);

  cart.body.setVelocityX(cart_init_speed);

  sand_drop = this.time.addEvent({
    delay: 30,
    callback: () => createSandParticle(this),
    loop: true
  });
}

function update(){
  if(!is_game_on){
    this.scene.pause();
  }
  if(cart.x >= 774)
    cart.body.setVelocityX(-200);
  stop_btn.click(() => {
      this.scene.pause();
      is_game_on = false;
  });
  restart_btn.click(() => {
    cartMass = 1;
    this.scene.restart();
  })
  start_btn.click(() => {
    if(!is_game_on){
      this.scene.resume();
      is_game_on = true;
    }
  })
  sandParticles.forEach((particle, index) => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(particle.getBounds(), cart.getBounds())) {
        // Если песчинка касается тележки
        particle.destroy(); // Удаляем песчинку
        sandParticles.splice(index, 1); // Удаляем из массива
        cartMass += 0.1; // Увеличиваем массу тележки
        updateCartSpeed(); // Обновляем скорость тележки
      }
    }
  )
}

function createSandParticle(scene) {
  if (sandParticles.length < maxSandParticles) {
    const x = Phaser.Math.Between(298,302); // Случайная координата по x
    const particle = scene.add.rectangle(x, 330, 3, 3, 0xffff00); // Песчинка
    scene.physics.add.existing(particle); // Добавляем физику
    sandParticles.push(particle);
  }
}

function updateCartSpeed() {
  const adjust_speed = cart_init_speed/cartMass;
  cart.body.setVelocityX(adjust_speed);
}


// reload_btn.click(() => {
//   game = null;
//   game = new Phaser.Game(config);
// })