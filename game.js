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
  ROOM_ITEMS.forEach(item => item.completed = false);
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
  background(255, 245, 220);

  drawCRTFrame();

  fill(170, 120, 80);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(42);
  textStyle(BOLD);
  text("A DAY", W / 2, 140);
  text("WITH SEARCH", W / 2, 200);
  textStyle(NORMAL);

  textSize(13);
  fill(140, 100, 60);
  text("~ A cozy adventure ~", W / 2, 270);

  let bob = sin(frameCount * 0.05) * 8;
  drawSprite(searchImg, W / 2, H / 2 + 60 + bob, 200);

  let pulse = map(sin(frameCount * 0.07), -1, 1, 100, 200);
  fill(220, 150, 100, pulse);
  textSize(16);
  text("> TAP TO START <", W / 2, H - 100);

  drawRoomDecorations();
}

function drawMorning() {
  background(255, 245, 220);

  drawCRTFrame();

  drawPixelBorder(10, 10, W - 20, 85, 3, color(180, 140, 100));

  fill(140, 100, 60);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text("MORNING ROUTINE", W / 2, 48);
  textStyle(NORMAL);

  if (selectedItem === null) {
    let bob = sin(frameCount * 0.05) * 8;
    drawSprite(searchImg, W / 2, 170 + bob, 120);

    fill(100, 70, 40);
    textAlign(CENTER, TOP);
    textSize(13);
    text("[ SELECT AN ITEM ]", W / 2, 310);

    ROOM_ITEMS.forEach((item, i) => {
      let isHovered = dist(mouseX, mouseY, item.x, item.y) < 65;
      let scale = isHovered ? 1.2 : 1.0;

      if (isHovered) {
        fill(255, 200, 130);
        stroke(200, 140, 80);
      } else {
        fill(255, 230, 180);
        stroke(180, 140, 100);
      }
      strokeWeight(3);
      rect(item.x - 55 * scale, item.y - 55 * scale, 110 * scale, 110 * scale, 8);

      noStroke();
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(60);
      text(item.emoji, item.x, item.y - 8);

      fill(120, 80, 50);
      textSize(12);
      textStyle(BOLD);
      text(item.title, item.x, item.y + 50);
      textStyle(NORMAL);
    });
  } else {
    drawChoiceScreen(selectedItem);
  }

  drawRoomDecorations();
}

function drawChoiceScreen(item) {
  drawPixelBorder(15, 50, W - 30, H - 100, 4, color(180, 140, 100));

  fill(100, 70, 40);
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
      fill(255, 200, 130);
      stroke(200, 140, 80);
    } else {
      fill(255, 235, 200);
      stroke(180, 140, 100);
    }
    strokeWeight(3);
    rect(bx, by, bw, bh, 6);

    noStroke();
    fill(100, 70, 40);
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(BOLD);
    text(opt.label, bx + bw / 2, by + bh / 2);
    textStyle(NORMAL);
  });

  fill(160, 120, 80);
  stroke(160, 120, 80);
  strokeWeight(2);
  rect(W / 2 - 80, H - 60, 160, 40, 4);
  noStroke();
  fill(255, 245, 220);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("< BACK", W / 2, H - 40);
}

function drawMap() {
  background(120, 180, 220);

  let cloudOffset = (mapScroll * 0.3) % 400;
  drawClouds(cloudOffset);

  fill(60, 100, 50);
  noStroke();
  let treeOffset = (mapScroll * 0.7) % 200;
  for (let x = -treeOffset; x < W + 200; x += 200) {
    drawTree(x, H - 200, 45);
  }

  fill(150, 130, 80);
  rect(0, H - 200, W, 25);

  fill(50, 80, 40);
  noStroke();
  rect(0, H - 140, W, 140);

  fill(40, 70, 35);
  for (let x = (-(mapScroll * 1.5) % 90); x < W + 90; x += 90) {
    rect(x, H - 130, 70, 20, 4);
  }

  fill(100, 90, 60);
  rect(0, H - 115, W, 25);
  fill(200, 190, 80);
  for (let x = (-(mapScroll * 2) % 80); x < W + 80; x += 80) {
    rect(x, H - 105, 45, 10, 2);
  }

  mapScroll += 2.5;

  let progress = min(mapScroll / 180, 1);
  let sx = lerp(-60, W / 2 - 60, progress);
  let tilt = (progress < 1) ? sin(frameCount * 0.2) * 0.05 : 0;
  push();
  translate(sx + 50, H - 220);
  rotate(tilt);
  drawSprite(searchImg, 0, 0, 110);
  pop();

  if (mapScroll > 200) {
    let v = VENUES[venueIdx];
    drawCozyChat(W / 2, H / 2 - 40, ">> " + v.name);
    if (mapScroll > 260) {
      fill(140, 100, 60);
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

  drawPixelBorder(15, 15, W - 30, 180, 3, color(180, 140, 100));

  mascotX = lerp(mascotX, W / 2 + 30, 0.09);
  let bob = sin(frameCount * 0.05 + 1.0) * 5;
  drawSprite(mascotImgs[v.file], mascotX, 115 + bob, 180);

  noStroke();
  fill(120, 80, 50);
  textAlign(CENTER, TOP);
  textSize(22);
  textStyle(BOLD);
  text(v.name, W / 2, 25);
  textStyle(NORMAL);

  textSize(13);
  fill(160, 120, 80);
  text("[ " + v.vibe + " VIBES ]", W / 2, 50);

  fill(100, 70, 40);
  textSize(11);
  textAlign(CENTER, TOP);
  text(v.description, 18, 72, W - 36, 95);

  let sc = 1.0;
  if (venueTimer < 20)       sc = map(venueTimer, 0,  20, 1.0, 1.2);
  else if (venueTimer < 40)  sc = map(venueTimer, 20, 40, 1.2, 1.0);
  let bob2 = sin(frameCount * 0.05) * 5;
  drawSprite(searchImg, 75, H / 2 + 60 + bob2, 100 * sc);

  if (venueTimer % 20 === 0) {
    floatIcons.push({
      x: mascotX + random(-70, 70),
      y: 100,
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
    fill(160, 120, 80);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    let nextLabel = venueIdx >= VENUES.length - 1 ? "HEAD HOME" : "CONTINUE";
    text("[ TAP TO " + nextLabel + " ]", W / 2, H - 50);
  }
}

function drawEndcard() {
  background(255, 245, 220);

  drawCRTFrame();

  drawPixelBorder(30, 90, W - 60, 300, 4, color(180, 140, 100));

  fill(170, 120, 80);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  textStyle(BOLD);
  text("WHAT A DAY!", W / 2, 140);
  textStyle(NORMAL);

  let bob = sin(frameCount * 0.05) * 8;
  drawSprite(searchImg, W / 2, H / 2 - 40 + bob, 160);

  textSize(16);
  fill(140, 100, 60);
  text("TODAY'S VIBE:", W / 2, H / 2 + 85);

  textSize(40);
  fill(220, 150, 100);
  textStyle(BOLD);
  text(personalityLabel, W / 2, H / 2 + 145);
  textStyle(NORMAL);

  let eLabel = ["LOW ENERGY", "BALANCED", "HIGH ENERGY"][energy];
  let sLabel = ["SOLO MODE", "BALANCED", "SOCIAL"][social];
  textSize(12);
  fill(140, 100, 60);
  text(eLabel + "  ::  " + sLabel, W / 2, H / 2 + 195);

  drawButton("PLAY AGAIN", W / 2, H - 75, 200, 50);

  drawRoomDecorations();
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
  fill(160, 120, 80);
  stroke(120, 80, 50);
  strokeWeight(3);
  rect(cx - bw / 2, cy - bh / 2, bw, bh, 8);
  fill(255, 245, 220);
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

function drawCozyChat(cx, cy, text) {
  fill(255, 245, 255);
  stroke(180, 140, 100);
  strokeWeight(3);
  rect(cx - 80, cy - 45, 160, 90, 12);
  triangle(cx - 25, cy + 45, cx, cy + 60, cx + 25, cy + 45);
  noStroke();
  fill(120, 80, 50);
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  text(text, cx, cy);
  textStyle(NORMAL);
}

function drawCRTFrame() {
  fill(200, 160, 120);
  rect(-20, -20, W + 40, 60, 8);
  rect(-20, H - 40, W + 40, 60, 8);
  rect(-20, 40, 60, H - 80, 8);
  rect(W - 40, 40, 60, H - 80, 8);

  fill(160, 120, 80);
  rect(-10, -8, W + 20, 28, 4);
  rect(-10, H - 20, W + 20, 28, 4);
}

function drawRoomDecorations() {
  fill(220, 180, 130);
  textSize(36);
  textAlign(CENTER, CENTER);

  text("🌱", 20, 150);
  text("📚", W - 20, 250);
  text("☕", 25, H - 180);
  text("🎮", W - 25, H - 200);
}

function drawClouds(offset) {
  fill(255, 255, 255, 180);
  noStroke();

  drawCloud(50 - offset, 80, 65);
  drawCloud(280 - offset, 130, 55);
  drawCloud(150 - offset, 70, 60);
  drawCloud(350 - offset, 150, 50);
}

function drawCloud(x, y, size) {
  ellipse(x, y, size * 1.3, size * 0.7);
  ellipse(x - size * 0.45, y + size * 0.12, size * 0.9, size * 0.6);
  ellipse(x + size * 0.45, y + size * 0.12, size * 0.9, size * 0.6);
}

function drawTree(x, y, size) {
  fill(70, 90, 50);
  noStroke();
  rect(x + size * 0.3, y + size * 0.65, size * 0.4, size * 0.8, 3);

  fill(50, 80, 40);
  ellipse(x + size * 0.5, y - size * 0.15, size * 0.9, size * 0.75);
  ellipse(x + size * 0.15, y + size * 0.12, size * 0.7, size * 0.65);
  ellipse(x + size * 0.85, y + size * 0.12, size * 0.7, size * 0.65);
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
        if (dist(mouseX, mouseY, item.x, item.y) < 65) {
          selectedItem = item;
        }
      });
    } else {
      if (mouseY > 130 && mouseY < H - 80) {
        let bx = 30, bw = W - 60, bh = 60, gap = 12, scrollY = 130;
        selectedItem.options.forEach((opt, i) => {
          let by = scrollY + i * (bh + gap);
          if (mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh) {
            pickOption(opt, selectedItem);
          }
        });
      } else if (mouseY > H - 80) {
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
    if (mouseX > W/2 - 100 && mouseX < W/2 + 100 && mouseY > H - 110 && mouseY < H - 55) {
      resetGame();
    }
    return;
  }
}

function touchStarted() {
  mousePressed();
  return false;
}
