var STOPPED = -1,
    PAUSED = 0,
    PLAYING = 1;
var state = STOPPED;
var canvas, ctx, width, height;
var mouseX, mouseY;
var drawFunction
  , initFunction
  , updateFunction
  , updateTimeout
  ;
var uiFocus = false;
var startingParticles = 0;
var maxParticles = 20;
var emitFrequency = 10;
var particles = [];
var dampening = 1;
var lastRun = undefined;
var lastEmit = undefined;

var requestAnim =
  window.requestAnimationFrame       ||
  window.webkitRequestAnimationFrame ||
  function (cb) { return setTimeout(cb, 1000/60); };

var clearAnim =
  window.cancelAnimationFrame       ||
  window.webkitCancelAnimationFrame ||
  function (id) { return clearTimeout(id); };

function Particle () {
  this.x = 0;
  this.y = 0;
  this.xvel = 0;
  this.yvel = 0;
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 1;
  this.index = null;

  initFunction.call(this);
}

Particle.prototype.add = function () {
  particles.push(this);
  this.index = particles.length - 1;
}

Particle.prototype.drop = function () {
  for (var i in particles) {
    if (particles[i] == this)
      particles.splice(i, 1);
  }
}

Particle.prototype.draw = function () {
  ctx.save();
  ctx.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
  drawFunction.call(this);
  ctx.restore();
}

Particle.prototype.updatePhysics = function () {
  this.x += this.xvel;
  this.y += this.yvel;

  if (this.x < 0 || this.x > width)
    this.xvel *= -dampening;

  if (this.y < 0 || this.y > height)
    this.yvel *= -dampening;

  updateFunction.call(this);
}

function clear () {
  ctx.clearRect(0, 0, width, height);
}

function run () {
  var now = new Date().getTime();
  lastRun = lastRun || now;
  lastEmit = lastEmit || now;
  if (state <= PAUSED)
    return;

  clear();

  for (var p in particles) {
    particles[p].draw();
  }

  for (var p in particles) {
    particles[p].updatePhysics();
  }

  // emit one particle per emission interval since the last emission time
  var count = Math.floor((now - lastEmit) / (1000/emitFrequency));
  for (var i = 1; i <= count; i++) {
    if (particles.length <= maxParticles)
      new Particle().add();
  }
  lastEmit += count * (1000/emitFrequency);

  updateTimeout = requestAnim(run);
  lastRun = now;
}

/**
 * Control Funtions
 **/

function togglePlay () {
  lastRun = lastEmit = new Date().getTime();
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

  maxParticles = parseInt($("#maxParticles").val());
  emitFrequency = parseInt($("#emitFrequency").val());

  var p;
  for (var i = 0; i < startingParticles; i++) {
    p = new Particle();
    p.add();
  }
  state = PLAYING;
  lastRun = lastEmit = new Date().getTime();
}

function stop () {
  state = STOPPED;
  clear();
  clearAnim(updateTimeout);

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

function mouseMoveHandler (ev) {
  mouseX = ev.offsetX - canvas.offsetLeft;
  mouseY = ev.offsetY - canvas.offsetTop;
}

$(function () {
  width = parseInt($("body").css("width")) - parseInt($("#ui").css("width")) - 20;
  width = Math.min(width, 600);
  $("body").append("<canvas width=\"" + width + "\" height=\"" + "600" + "\"></canvas>");
  canvas = $("canvas").get()[0];
  height = 600;

  ctx = canvas.getContext('2d');

  $("#play-pause").click(togglePlay);
  $("#stop").click(stop);
  $("#restart").click(restart);
  $(document).keypress(keyHandler);
  $(document).mousemove(mouseMoveHandler);
  $("#ui").focusin(function () { uiFocus = true; });
  $("#ui").focusout(function () { uiFocus = false; });
  $("#options").submit(function () { restart(); return false; });

});
