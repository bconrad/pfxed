var STOPPED = -1,
    PAUSED = 0,
    PLAYING = 1;
var state = STOPPED;
var canvas, ctx, width, height;
var drawFunction
  , initFunction
  , updateFunction
  ;
var uiFocus = false;
var particles = [];
function Particle () {
  this.x = 0;
  this.y = 0;
  this.xvel = 0;
  this.yvel = 0;
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
  drawFunction.call(this);
}

Particle.prototype.updatePhysics = function () {
  this.x += this.xvel;
  this.y += this.yvel;

  if (this.x < 0 || this.x > width)
    this.xvel *= -1;

  if (this.y < 0 || this.y > height)
    this.yvel *= -1;

  updateFunction.call(this);
}

function clear () {
  ctx.clearRect(0, 0, width, height);
}

function run () {
  if (state <= PAUSED)
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
  if (state == STOPPED) {
    start();
    run();
  } else if (state == PAUSED) {
    state = PLAYING;
    run();
  } else {
    state = PAUSED;
  }

  return false;
}

function start () {
  initFunction = eval("(function () { " + $("#init-function").val() + " })");
  drawFunction = eval("(function () { " + $("#draw-function").val() + " })");
  updateFunction = eval("(function () { " + $("#update-function").val() + " })");

  var p;
  for (var i = 0; i < 20; i++) {
    p = new Particle();
    p.add();
    initFunction.call(p);
  }
  state = PLAYING;
}

function stop () {
  state = STOPPED;
  clear();

  particles = [];
  return false;
}

function restart () {
  stop();
  start();
  run();
  return false;
}

function keyHandler (ev) {
  if (uiFocus)
    return;

  switch (ev.which) {
    case 112:
      togglePlay();
    break;
    case 114:
      restart();
    break;
    case 115:
      stop();
    break;

    default:
      return true;
  }

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
  $(document).keypress(keyHandler);
  $("#ui").focusin(function () { uiFocus = true; });
  $("#ui").focusout(function () { uiFocus = false; });

});
