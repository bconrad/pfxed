var STOPPED = -1,
    PAUSED = 0,
    PLAYING = 1;
var running = STOPPED;
var canvas, ctx, width, height;
var particles = [];
function Particle () {
  this.x = Math.random() * width;
  this.y = Math.random() * height;
  this.xvel = (Math.random() - .5) * 10;
  this.yvel = (Math.random() - .5) * 10;
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.index = null;
}

Particle.prototype.add = function () {
  particles.push(this);
  this.index = particles.length - 1;
}

Particle.prototype.drop = function () {
  particles.splice(this.index, 1);
}

Particle.prototype.draw = function () {
  ctx.fillRect(this.x, this.y, 4, 4);
}

Particle.prototype.updatePhysics = function () {
  this.x += this.xvel;
  this.y += this.yvel;

  var xbound = this.width - this.x;
  if (this.x < 0 || this.x > width)
    this.xvel *= -1;

  if (this.y < 0 || this.y > height)
    this.yvel *= -1;
}

function clear () {
  ctx.clearRect(0, 0, width, height);
}

function run () {
  if (running <= PAUSED)
    return;

  clear();

  for (var p in particles) {
    particles[p].draw();
  }

  for (var p in particles) {
    particles[p].updatePhysics();
  }

  setTimeout(run, 1000/60);
}

/**
 * Control Funtions
 **/

function togglePlay () {
  if (running == STOPPED) {
    start();
  } else if (running == PAUSED) {
    running = PLAYING;
    run();
  } else {
    running = PAUSED;
  }

  return false;
}

function start () {
  for (var i = 0; i < 20; i++) {
    new Particle().add();
  }
  running = PLAYING
  run();
}

function stop () {
  running = STOPPED;
  clear();

  particles = [];
  return false;
}

function restart () {
  stop();
  start();
  return false;
}

$(function () {
  canvas = $("canvas").get()[0];
  ctx = canvas.getContext('2d');
  width = canvas.clientWidth;
  height = canvas.clientHeight;

  $("#play-pause").click(togglePlay);
  $("#stop").click(stop);
  $("#restart").click(restart);
});
