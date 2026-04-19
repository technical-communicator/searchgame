const ASSET_BASE = "./";

const W = 390, H = 844;
const INTRO = 0, MORNING = 1, MAP = 2, VENUE = 3, ENDCARD = 4;

const CHOICES = [
  {
    prompt: "What's for breakfast?",
    options: [
      { label: "Skip it",                    energy: -1, vibe: null,    social:  0 },
      { label: "Make something at home",     energy:  1, vibe: "Cozy",  social:  0 },
      { label: "Grab something on the way",  energy:  1, vibe: "Indie", social:  1 },
    ]
  },
  {
    prompt: "What are you listening to?",
    options: [
      { label: "Lo-fi beats",          energy:  0, vibe: "Cozy",  social:  0 },
      { label: "Indie punk",           energy:  1, vibe: "Edgy",  social:  0 },
      { label: "Pop",                  energy:  1, vibe: "Queer", social:  1 },
      { label: "Classical / Ambient",  energy: -1, vibe: "Artsy", social: -1 },
      { label: "A podcast",            energy:  1, vibe: "Indie", social: -1 },
    ]
  },
  {
    prompt: "What are you wearing?",
    options: [
      { label: "Cozy hoodie",          energy:  1, vibe: "Cozy",  social:  0 },
      { label: "Leather jacket",       energy:  0, vibe: "Edgy",  social:  1 },
      { label: "Vintage thrift find",  energy:  0, vibe: "Artsy", social:  0 },
      { label: "Casual",               energy:  1, vibe: null,    social:  0 },
      { label: "Pride fit",            energy:  0, vibe: "Queer", social:  1 },
    ]
  }
];

const VENUES = [
  { name: "Diablicos Coffee",  file: "diablicos.png",  vibe: "Artsy", icons: ["☕", "✨", "☕"] },
  { name: "Will's Pub",        file: "wills.png",      vibe: "Indie", icons: ["♪",  "♫",  "★"]  },
  { name: "Syzn Thrift",       file: "syzn.png",       vibe: "Edgy",  icons: ["✦",  "⚡",  "★"]  },
  { name: "Funky's Vintage",   file: "funkys.png",     vibe: "Indie", icons: ["✦",  "♻",  "✨"]  },
];

let state;
let searchImg;
let mascotImgs = {};

let energy, social, vibeCounts;
let choiceIdx, venueIdx;
let personalityLabel;

let mapScroll, mascotX, venueTimer, floatIcons;

function preload() {
  searchImg = loadImage(ASSET_BASE + "search.png");
  VENUES.forEach(v => { mascotImgs[v.file] = loadImage(ASSET_BASE + v.file); });
}

function setup() {
  createCanvas(W, H);
  textFont("monospace");
  resetGame();
}

function resetGame() {
  state = INTRO;
  energy = 1;
  social = 1;
  vibeCounts = {};
  choiceIdx = 0;
  venueIdx = 0;
  personalityLabel = "";
  mapScroll = 0;
  mascotX = W + 120;
  venueTimer = 0;
  floatIcons = [];
}

// --- draw loop ---

function draw() {
  switch (state) {
    case INTRO:   drawIntro();   break;
    case MORNING: drawMorning(); break;
    case MAP:     drawMap();     break;
    case VENUE:   drawVenue();   break;
    case ENDCARD: drawEndcard(); break;
  }
}

// --- screens ---

function drawIntro() {
  background(28, 18, 48);

  fill(255, 220, 100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(30);
  text("A Day with Search", W / 2, 190);

  textSize(14);
  fill(180, 160, 220);
  text("a single-session adventure", W / 2, 235);

  let bob = sin(frameCount * 0.05) * 5;
  drawSprite(searchImg, W / 2, H / 2 - 10 + bob, 160);

  let pulse = map(sin(frameCount * 0.07), -1, 1, 120, 255);
  fill(255, pulse);
  textSize(15);
  text("tap anywhere to start", W / 2, H - 110);
}

function drawMorning() {
  background(245, 235, 210);

  let bob = sin(frameCount * 0.05) * 3;
  drawSprite(searchImg, W - 55, 70 + bob, 80);

  fill(120, 90, 160);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text(`morning  ${choiceIdx + 1}/${CHOICES.length}`, 24, 30);

  let c = CHOICES[choiceIdx];

  fill(40, 20, 60);
  textAlign(CENTER, TOP);
  textSize(19);
  text(c.prompt, W / 2, 100);

  let bx = 28, bw = W - 56, bh = 56, gap = 12, startY = 190;
  c.options.forEach((opt, i) => {
    let by = startY + i * (bh + gap);
    fill(255);
    stroke(190, 160, 210);
    strokeWeight(2);
    rect(bx, by, bw, bh, 14);
    noStroke();
    fill(50, 30, 70);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(opt.label, bx + bw / 2, by + bh / 2);
  });
}

function drawMap() {
  background(120, 190, 240);

  fill(100, 180, 100);
  noStroke();
  rect(0, H - 140, W, 140);

  fill(80, 160, 80);
  for (let x = (-(mapScroll * 1.5) % 90); x < W + 90; x += 90) {
    rect(x, H - 130, 60, 18, 4);
  }

  fill(160, 140, 120);
  rect(0, H - 120, W, 30);
  fill(230, 220, 80);
  for (let x = (-(mapScroll * 2) % 80); x < W + 80; x += 80) {
    rect(x, H - 108, 40, 8, 2);
  }

  mapScroll += 2.5;

  let progress = min(mapScroll / 180, 1);
  let sx = lerp(-60, W / 2 - 60, progress);
  let tilt = (progress < 1) ? sin(frameCount * 0.2) * 0.05 : 0;
  push();
  translate(sx + 50, H - 220);
  rotate(tilt);
  drawSprite(searchImg, 0, 0, 100);
  pop();

  if (mapScroll > 200) {
    let v = VENUES[venueIdx];
    fill(255, 245, 255, 230);
    stroke(140, 100, 180);
    strokeWeight(2);
    rect(W / 2 - 140, H / 2 - 36, 280, 72, 14);
    noStroke();
    fill(90, 60, 120);
    textAlign(CENTER, CENTER);
    textSize(13);
    text("Arriving at...", W / 2, H / 2 - 12);
    textSize(17);
    fill(60, 30, 100);
    text(v.name, W / 2, H / 2 + 18);
  }

  if (mapScroll > 340) {
    state = VENUE;
    venueTimer = 0;
    mascotX = W + 120;
    floatIcons = [];
  }
}

function drawVenue() {
  background(255, 248, 230);

  let v = VENUES[venueIdx];
  venueTimer++;

  mascotX = lerp(mascotX, W / 2 + 30, 0.09);
  let bob = sin(frameCount * 0.05 + 1.0) * 4;
  drawSprite(mascotImgs[v.file], mascotX, H / 2 - 50 + bob, 200);

  noStroke();
  fill(50, 25, 75);
  textAlign(CENTER, TOP);
  textSize(22);
  text(v.name, W / 2, 50);

  textSize(13);
  fill(160, 120, 200);
  text(v.vibe + " vibes", W / 2, 84);

  let sc = 1.0;
  if (venueTimer < 20)       sc = map(venueTimer, 0,  20, 1.0, 1.2);
  else if (venueTimer < 40)  sc = map(venueTimer, 20, 40, 1.2, 1.0);
  let bob2 = sin(frameCount * 0.05) * 4;
  drawSprite(searchImg, 70, H / 2 + 20 + bob2, 110 * sc);

  if (venueTimer % 20 === 0) {
    floatIcons.push({
      x: mascotX + random(-70, 70),
      y: H / 2 - 100,
      icon: random(v.icons),
      life: 60
    });
  }

  textAlign(CENTER, CENTER);
  textSize(20);
  floatIcons.forEach(ic => {
    ic.y -= 1.4;
    ic.life--;
    fill(255, map(ic.life, 0, 60, 0, 255));
    text(ic.icon, ic.x, ic.y);
  });
  floatIcons = floatIcons.filter(ic => ic.life > 0);

  let isLast = venueIdx >= VENUES.length - 1;
  drawButton(isLast ? "Head home ✦" : "Keep exploring →", W / 2, H - 110, 200, 50);
}

function drawEndcard() {
  background(28, 18, 48);

  fill(255, 220, 100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text("What a day!", W / 2, 160);

  let bob = sin(frameCount * 0.05) * 5;
  drawSprite(searchImg, W / 2, H / 2 - 80 + bob, 150);

  textSize(14);
  fill(180, 160, 220);
  text("Today's vibe:", W / 2, H / 2 + 60);

  textSize(28);
  fill(255, 220, 100);
  text(personalityLabel, W / 2, H / 2 + 100);

  let eLabel = ["Low Energy", "Balanced", "High Energy"][energy];
  let sLabel = ["Solo Mode", "Balanced", "Social Butterfly"][social];
  textSize(12);
  fill(160, 140, 200);
  text(eLabel + "  ·  " + sLabel, W / 2, H / 2 + 140);

  drawButton("Play again", W / 2, H - 110, 180, 50);
}

// --- game logic ---

function pickOption(opt) {
  energy = constrain(energy + opt.energy, 0, 2);
  social = constrain(social + opt.social, 0, 2);
  if (opt.vibe) vibeCounts[opt.vibe] = (vibeCounts[opt.vibe] || 0) + 1;

  choiceIdx++;
  if (choiceIdx >= CHOICES.length) {
    personalityLabel = resolvePersonality();
    goToMap();
  }
}

function resolvePersonality() {
  let top = null, topN = 0;
  // ties favor later entry, matching the spec
  ["Cozy", "Indie", "Edgy", "Artsy", "Queer"].forEach(v => {
    if ((vibeCounts[v] || 0) >= topN) { top = v; topN = vibeCounts[v] || 0; }
  });
  return top || "Casual";
}

function goToMap() {
  state = MAP;
  mapScroll = 0;
}

// --- helpers ---

function drawSprite(img, cx, cy, size) {
  image(img, cx - size / 2, cy - size / 2, size, size);
}

function drawButton(label, cx, cy, bw, bh) {
  fill(80, 50, 130);
  noStroke();
  rect(cx - bw / 2, cy - bh / 2, bw, bh, 14);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(15);
  text(label, cx, cy);
}

function hitButton(cx, cy, bw, bh) {
  return mouseX > cx - bw / 2 && mouseX < cx + bw / 2 &&
         mouseY > cy - bh / 2 && mouseY < cy + bh / 2;
}

// --- input ---

function mousePressed() {
  if (state === INTRO) {
    state = MORNING;
    return;
  }

  if (state === MORNING) {
    let c = CHOICES[choiceIdx];
    let bx = 28, bw = W - 56, bh = 56, gap = 12, startY = 190;
    c.options.forEach((opt, i) => {
      let by = startY + i * (bh + gap);
      if (mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh) {
        pickOption(opt);
      }
    });
    return;
  }

  if (state === VENUE) {
    if (hitButton(W / 2, H - 110, 200, 50)) {
      venueIdx++;
      if (venueIdx >= VENUES.length) state = ENDCARD;
      else goToMap();
    }
    return;
  }

  if (state === ENDCARD) {
    if (hitButton(W / 2, H - 110, 180, 50)) resetGame();
    return;
  }
}

function touchStarted() {
  mousePressed();
  return false;
}
