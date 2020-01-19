console.clear();

// Create an ease curve to use - try them out
var easeCurve = gsap.parseEase("rough({ template: 'none', strength: 1.3, points: 30, taper: 'none', randomize: true, clamp: true})");
// easeCurve = gsap.parseEase("sine.inOut");
// easeCurve = gsap.parseEase("steps(2)");
// easeCurve = gsap.parseEase("linear");
// etc...

const columnNum = 50,
      rowNum = 50,
      // rowNum = columnNum = 50,
      duration = 5,
      explodeDuration = 1,
      gutterPercent = 0.17;

// Create the grid
var canvas,
    ctx,
    canvasWidth,
    canvasHeight,
    grid = [],
    gutter,
    rectSize;

function createParticles() {
  for(let i = 0; i < rowNum; i++) {
    grid[i] = [];
    
    for(let j = 0; j < columnNum; j++) {
      let particle = createParticle(i, j)
      grid[i][j] = particle;
      
      animateParticle(particle);
    }
  }
}

function createParticle(i, j) {
  let particle = {
    i: i,
    j: j,
    // color: "white",
    color: "#66A5AD",
    color: "#F5FFFA",
    //color: 'hsl(' + 360 * Math.random() + ', 80%, 55%)',
    // Randomly size our particles
    initSize: Math.ceil(Math.random() * rectSize),
    size: this.initSize,
    // Keep track of our particles
    x: gutter + j * rectSize,
    y: -rectSize,
    // Generate some random values to explode to relative to their position
    explodeDiffX: Math.random() * gutter * 2 - gutter,
    explodeDiffY: Math.random() * gutter - gutter / 2
  };
  
  return particle;
}

function resize() {
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  
  gutter = canvasWidth * gutterPercent;
  rectSize = (canvasWidth - gutter * 2) / rowNum;
}

function init() {
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext('2d');
  resize();
  
  createParticles();
  
  gsap.ticker.add(draw);
}

// Animate each particle
function animateParticle(particle) {
  let // delay based on y in grid position
      initDelay = particle.i * (duration / columnNum),
      // "explode" at time based on the ease curve
      explodeDelay = (easeCurve(particle.j / columnNum) - particle.j / columnNum + 0.5) * duration;
  
  // Move downwards
  let tween = gsap.to(particle, {
    duration: duration,
    ease: "none",
    delay: -initDelay - duration,
    repeat:-1,
    y: canvasHeight,
    x: particle.x+0.01,
    onRepeat: () => {
      gsap.quickSetter(particle, "size")(particle.initSize);
    },
    onUpdate: () => {
      if(tween.time() > explodeDelay) {
        let timeSinceStart = tween.time() - explodeDelay;
        let newSize = explodeDuration - timeSinceStart > 0 ? particle.initSize * (explodeDuration - timeSinceStart) : 0;
        gsap.quickSetter(particle, "size")(newSize);
      }
    },
    modifiers: {
      x: x => {
        if(tween.time() > explodeDelay) {
          let timeSinceStart = tween.time() - explodeDelay;
          let xOffset = explodeDuration - timeSinceStart > 0 ? particle.explodeDiffX - particle.explodeDiffX * (explodeDuration - timeSinceStart) : 0;
          return x + xOffset;
        }
        return x
      },
      y: y => {
        if(tween.time() > explodeDelay) {
          let timeSinceStart = tween.time() - explodeDelay;
          let yOffset = explodeDuration - timeSinceStart > 0 ? particle.explodeDiffY - particle.explodeDiffY * (explodeDuration - timeSinceStart) : 0;
          return y + yOffset;
        }
        return y
      }
    }
  });
  
  return tween;
}

function drawParticle(particle) {
  // offset to compensate for scale differences
  let offset = (rectSize - particle.size) / 2;
  ctx.fillStyle = particle.color;
  ctx.fillRect(particle.x + offset, particle.y + offset, particle.size, particle.size);
}

function draw() {
  // clear out old
  ctx.fillStyle = "#C4DFE6";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // draw updated grid - animation done with GSAP
  grid.forEach(row => {
    row.forEach(particle => drawParticle(particle));
  });
}

init();