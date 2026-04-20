const ASSET_BASE = "./";

const W = 390, H = 844;
const INTRO = 0, MORNING = 1, MAP = 2, VENUE = 3, ENDCARD = 4;

const ROOM_ITEMS = [
  {
    title: "Breakfast",
    emoji: "🍳",
    x: 100,
    y: 300,
    completed: false,
    options: [
      { label: "Skip it",                    energy: -1, vibe: null,    social:  0 },
      { label: "Make something at home",     energy:  1, vibe: "Cozy",  social:  0 },
      { label: "Grab something on the way",  energy:  1, vibe: "Indie", social:  1 },
    ]
  },
  {
    title: "Music",
    emoji: "🎵",
    x: 280,
    y: 320,
    completed: false,
    options: [
      { label: "Lo-fi beats",          energy:  0, vibe: "Cozy",  social:  0 },
      { label: "Indie punk",           energy:  1, vibe: "Edgy",  social:  0 },
      { label: "Pop",                  energy:  1, vibe: "Queer", social:  1 },
      { label: "Classical / Ambient",  energy: -1, vibe: "Artsy", social: -1 },
      { label: "A podcast",            energy:  1, vibe: "Indie", social: -1 },
    ]
  },
  {
    title: "Outfit",
    emoji: "👕",
    x: 190,
    y: 500,
    completed: false,
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
  {
    name: "Diablicos Coffee",
    file: "diablicos.png",
    vibe: "Artsy",
    icons: ["☕", "✨", "☕"],
    description: "A Panamanian-inspired hidden gem in South Eola with vibrant, magical décor and warm service. Known for sourcing world-class Geisha coffee directly from Panama's renowned Café Unido."
  },
  {
    name: "Will's Pub",
    file: "wills.png",
    vibe: "Indie",
    icons: ["♪",  "♫",  "★"],
    description: "An iconic dive bar since 1995 and the heart of Orlando's indie music scene. With intimate acoustics, live performances from local and traveling bands, and craft drinks."
  },
  {
    name: "Syzn Thrift",
    file: "syzn.png",
    vibe: "Edgy",
    icons: ["✦",  "⚡",  "★"],
    description: "A curated vintage and alternative fashion shop near UCF with affordable finds and great prices. Perfect for discovering unique, one-of-a-kind pieces."
  },
  {
    name: "Funky's Vintage",
    file: "funkys.png",
    vibe: "Indie",
    icons: ["✦",  "♻",  "✨"],
    description: "Located in the Milk District and voted Best Vintage Store in Orlando. Packed with quality vintage clothing by the pound, retro games, and collectibles."
  },
];

let state;
let searchImg;
let mascotImgs = {};

let energy, social, vibeCounts;
let venueIdx;
let personalityLabel;

let mapScroll, mascotX, venueTimer, floatIcons;
let selectedItem = null;
let textIndex = 0;
let selectedOption = null;
let canSkipAnimation = false;

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
  venueIdx = 0;
  personalityLabel = "";
  mapScroll = 0;
  mascotX = W + 120;
  venueTimer = 0;
  floatIcons = [];
  selectedItem = null;
  textIndex = 0;
  selectedOption = null;
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

  drawPixelBorder(30, 90, W - 60, 290, 4, color(255, 220, 100));

  fill(255, 220, 100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(40);
  textStyle(BOLD);
  text("A DAY", W / 2, 150);
  text("WITH SEARCH", W / 2, 210);
  textStyle(NORMAL);

  textSize(14);
  fill(180, 160, 220);
  text("~ SINGLE SESSION ADVENTURE ~", W / 2, 280);

  let bob = sin(frameCount * 0.05) * 8;
  drawSprite(searchImg, W / 2, H / 2 + 50 + bob, 200);

  let pulse = map(sin(frameCount * 0.07), -1, 1, 100, 255);
  fill(255, 100, 150, pulse);
  textSize(16);
  text("> TAP TO START <", W / 2, H - 80);
}

function drawMorning() {
  background(245, 235, 210);

  drawPixelBorder(10, 10, W - 20, 85, 3, color(120, 90, 160));

  fill(120, 90, 160);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text("MORNING ROUTINE", W / 2, 48);
  textStyle(NORMAL);

  if (selectedItem === null) {
    let bob = sin(frameCount * 0.05) * 8;
    drawSprite(searchImg, W / 2, 170 + bob, 120);

    fill(50, 30, 70);
    textAlign(CENTER, TOP);
    textSize(13);
    text("[ SELECT AN ITEM ]", W / 2, 310);

    ROOM_ITEMS.forEach((item, i) => {
      let isHovered = dist(mouseX, mouseY, item.x, item.y) < 65;
      let scale = isHovered ? 1.2 : 1.0;

      if (isHovered) {
        fill(255, 200, 100);
        stroke(255, 200, 100);
      } else {
        fill(100, 60, 150);
        stroke(150, 100, 180);
      }
      strokeWeight(3);
      rect(item.x - 55 * scale, item.y - 55 * scale, 110 * scale, 110 * scale, 8);

      noStroke();
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(60);
      text(item.emoji, item.x, item.y - 8);

      fill(40, 20, 60);
      textSize(12);
      textStyle(BOLD);
      text(item.title, item.x, item.y + 50);
      textStyle(NORMAL);
    });
  } else {
    drawChoiceScreen(selectedItem);
  }
}

function drawChoiceScreen(item) {
  drawPixelBorder(15, 50, W - 30, H - 100, 4, color(120, 80, 160));

  fill(40, 20, 60);
  textAlign(CENTER, TOP);
  textSize(24);
  textStyle(BOLD);
  text(item.title, W / 2, 70);
  textStyle(NORMAL);

  let scrollY = 130;
  let bx = 30, bw = W - 60, bh = 60, gap = 12;

  item.options.forEach((opt, i) => {
    let by = scrollY + i * (bh + gap);
    if (by > H - 100) return;

    let isHovered = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;
    if (isHovered) {
      fill(255, 200, 100);
      stroke(255, 200, 100);
    } else {
      fill(255);
      stroke(100, 60, 140);
    }
    strokeWeight(3);
    rect(bx, by, bw, bh, 6);

    noStroke();
    fill(40, 20, 60);
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(BOLD);
    text(opt.label, bx + bw / 2, by + bh / 2);
    textStyle(NORMAL);
  });

  fill(100, 70, 130);
  stroke(100, 70, 130);
  strokeWeight(2);
  rect(W / 2 - 80, H - 60, 160, 40, 4);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("< BACK", W / 2, H - 40);
}

function drawMap() {
  background(140, 200, 255);

  let cloudOffset = (mapScroll * 0.3) % 400;
  drawClouds(cloudOffset);

  fill(80, 120, 60);
  noStroke();
  let treeOffset = (mapScroll * 0.7) % 200;
  for (let x = -treeOffset; x < W + 200; x += 200) {
    drawTree(x, H - 180, 40);
  }

  fill(180, 160, 100);
  rect(0, H - 200, W, 30);

  fill(60, 90, 50);
  noStroke();
  rect(0, H - 140, W, 140);

  fill(50, 80, 40);
  for (let x = (-(mapScroll * 1.5) % 90); x < W + 90; x += 90) {
    rect(x, H - 130, 60, 18, 4);
  }

  fill(100, 100, 80);
  rect(0, H - 120, W, 30);
  fill(220, 210, 100);
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
    drawChatBubble(W / 2, H / 2, ">> " + v.name, "", 160, 100);
    if (mapScroll > 260) {
      fill(180, 150, 220);
      textAlign(CENTER, BOTTOM);
      textSize(11);
      text("[ TAP TO CONTINUE ]", W / 2, H - 60);
    }
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

  drawPixelBorder(15, 15, W - 30, 180, 3, color(100, 70, 140));

  mascotX = lerp(mascotX, W / 2 + 30, 0.09);
  let bob = sin(frameCount * 0.05 + 1.0) * 5;
  drawSprite(mascotImgs[v.file], mascotX, 115 + bob, 180);

  noStroke();
  fill(50, 25, 75);
  textAlign(CENTER, TOP);
  textSize(22);
  textStyle(BOLD);
  text(v.name, W / 2, 25);
  textStyle(NORMAL);

  textSize(13);
  fill(140, 100, 180);
  text("[ " + v.vibe + " VIBES ]", W / 2, 50);

  fill(70, 45, 110);
  textSize(11);
  textAlign(CENTER, TOP);
  text(v.description, 18, 72, W - 36, 95);

  let sc = 1.0;
  if (venueTimer < 20)       sc = map(venueTimer, 0,  20, 1.0, 1.2);
  else if (venueTimer < 40)  sc = map(venueTimer, 20, 40, 1.2, 1.0);
  let bob2 = sin(frameCount * 0.05) * 4;
  drawSprite(searchImg, 70, H / 2 + 80 + bob2, 110 * sc);

  if (venueTimer % 20 === 0) {
    floatIcons.push({
      x: mascotX + random(-70, 70),
      y: H / 2 - 100,
      icon: random(v.icons),
      life: 60
    });
  }

  textAlign(CENTER, CENTER);
  textSize(36);
  floatIcons.forEach(ic => {
    ic.y -= 1.5;
    ic.life--;
    fill(255, map(ic.life, 0, 60, 0, 200));
    text(ic.icon, ic.x, ic.y);
  });
  floatIcons = floatIcons.filter(ic => ic.life > 0);

  if (venueTimer > 35) {
    fill(140, 100, 180);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    let nextLabel = venueIdx >= VENUES.length - 1 ? "HEAD HOME" : "CONTINUE";
    text("[ TAP TO " + nextLabel + " ]", W / 2, H - 50);
  }
}

function drawEndcard() {
  background(28, 18, 48);

  drawPixelBorder(30, 90, W - 60, 300, 4, color(255, 220, 100));

  fill(255, 220, 100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  textStyle(BOLD);
  text("WHAT A DAY!", W / 2, 140);
  textStyle(NORMAL);

  let bob = sin(frameCount * 0.05) * 8;
  drawSprite(searchImg, W / 2, H / 2 - 40 + bob, 160);

  textSize(16);
  fill(180, 160, 220);
  text("TODAY'S VIBE:", W / 2, H / 2 + 85);

  textSize(40);
  fill(255, 220, 100);
  textStyle(BOLD);
  text(personalityLabel, W / 2, H / 2 + 145);
  textStyle(NORMAL);

  let eLabel = ["LOW ENERGY", "BALANCED", "HIGH ENERGY"][energy];
  let sLabel = ["SOLO MODE", "BALANCED", "SOCIAL"][social];
  textSize(12);
  fill(160, 140, 200);
  text(eLabel + "  ::  " + sLabel, W / 2, H / 2 + 195);

  drawButton("PLAY AGAIN", W / 2, H - 75, 200, 50);
}

// --- game logic ---

function pickOption(opt, item) {
  energy = constrain(energy + opt.energy, 0, 2);
  social = constrain(social + opt.social, 0, 2);
  if (opt.vibe) vibeCounts[opt.vibe] = (vibeCounts[opt.vibe] || 0) + 1;

  item.completed = true;
  let allSelected = ROOM_ITEMS.every(item => item.completed);
  if (allSelected) {
    personalityLabel = resolvePersonality();
    goToMap();
  } else {
    selectedItem = null;
  }
}

function resolvePersonality() {
  let top = null, topN = 0;
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
  stroke(200, 150, 255);
  strokeWeight(3);
  rect(cx - bw / 2, cy - bh / 2, bw, bh, 8);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text(label, cx, cy);
  textStyle(NORMAL);
}

function hitButton(cx, cy, bw, bh) {
  return mouseX > cx - bw / 2 && mouseX < cx + bw / 2 &&
         mouseY > cy - bh / 2 && mouseY < cy + bh / 2;
}

function drawPixelBorder(x, y, w, h, thickness, c) {
  fill(c);
  noStroke();
  rect(x, y, w, thickness);
  rect(x, y + h - thickness, w, thickness);
  rect(x, y + thickness, thickness, h - thickness * 2);
  rect(x + w - thickness, y + thickness, thickness, h - thickness * 2);
}

function drawChatBubble(cx, cy, line1, line2, w, h) {
  fill(255, 245, 255);
  stroke(140, 100, 180);
  strokeWeight(3);
  rect(cx - w / 2, cy - h / 2, w, h, 12);
  triangle(cx - 25, cy + h / 2, cx, cy + h / 2 + 20, cx + 25, cy + h / 2);
  noStroke();
  fill(60, 30, 100);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  if (line2 === "") {
    textSize(20);
    text(line1, cx, cy);
  } else {
    textSize(14);
    text(line1, cx, cy - 8);
    textSize(18);
    text(line2, cx, cy + 12);
  }
  textStyle(NORMAL);
}

function drawClouds(offset) {
  fill(255, 255, 255, 150);
  noStroke();

  drawCloud(50 - offset, 80, 60);
  drawCloud(280 - offset, 120, 50);
  drawCloud(150 - offset, 60, 55);
  drawCloud(350 - offset, 140, 45);
}

function drawCloud(x, y, size) {
  ellipse(x, y, size * 1.2, size * 0.6);
  ellipse(x - size * 0.4, y + size * 0.1, size * 0.8, size * 0.5);
  ellipse(x + size * 0.4, y + size * 0.1, size * 0.8, size * 0.5);
}

function drawTree(x, y, size) {
  fill(80, 120, 60);
  noStroke();
  rect(x + size * 0.3, y + size * 0.6, size * 0.4, size * 0.8);

  fill(60, 100, 50);
  ellipse(x + size * 0.5, y - size * 0.2, size * 0.8, size * 0.7);
  ellipse(x + size * 0.2, y + size * 0.1, size * 0.6, size * 0.6);
  ellipse(x + size * 0.8, y + size * 0.1, size * 0.6, size * 0.6);
}

// --- input ---

function mousePressed() {
  if (state === INTRO) {
    state = MORNING;
    return;
  }

  if (state === MORNING) {
    if (selectedItem === null) {
      ROOM_ITEMS.forEach(item => {
        if (dist(mouseX, mouseY, item.x, item.y) < 60) {
          selectedItem = item;
        }
      });
    } else {
      if (mouseY > 160 && mouseY < H - 100) {
        let bx = 40, bw = W - 80, bh = 50, gap = 10, scrollY = 160;
        selectedItem.options.forEach((opt, i) => {
          let by = scrollY + i * (bh + gap);
          if (mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh) {
            pickOption(opt, selectedItem);
          }
        });
      } else if (mouseY > H - 50) {
        selectedItem = null;
      }
    }
    return;
  }

  if (state === MAP) {
    if (mapScroll > 260) {
      mapScroll = 340;
    }
    return;
  }

  if (state === VENUE) {
    venueIdx++;
    if (venueIdx >= VENUES.length) state = ENDCARD;
    else goToMap();
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
