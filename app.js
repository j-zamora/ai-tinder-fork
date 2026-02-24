// app.js
// Plain global JS, no modules.

// -------------------
// Data generator
// -------------------
const TAGS = [
  "Coffee","Hiking","Movies","Live Music","Board Games","Cats","Dogs","Traveler",
  "Foodie","Tech","Art","Runner","Climbing","Books","Yoga","Photography"
];
const FIRST_NAMES = [
  "Alex","Sam","Jordan","Taylor","Casey","Avery","Riley","Morgan","Quinn","Cameron",
  "Jamie","Drew","Parker","Reese","Emerson","Rowan","Shawn","Harper","Skyler","Devon"
];
const CITIES = [
  "Brooklyn","Manhattan","Queens","Jersey City","Hoboken","Astoria",
  "Williamsburg","Bushwick","Harlem","Lower East Side"
];
const JOBS = [
  "Product Designer","Software Engineer","Data Analyst","Barista","Teacher",
  "Photographer","Architect","Chef","Nurse","Marketing Manager","UX Researcher"
];
const BIOS = [
  "Weekend hikes and weekday lattes.",
  "Dog parent. Amateur chef. Karaoke enthusiast.",
  "Trying every taco in the city — for science.",
  "Bookstore browser and movie quote machine.",
  "Gym sometimes, Netflix always.",
  "Looking for the best slice in town.",
  "Will beat you at Mario Kart.",
  "Currently planning the next trip."
];

const UNSPLASH_SEEDS = [
  "1515462277126-2b47b9fa09e6",
  "1520975916090-3105956dac38",
  "1519340241574-2cec6aef0c01",
  "1554151228-14d9def656e4",
  "1548142813-c348350df52b",
  "1517841905240-472988babdf9",
  "1535713875002-d1d0cf377fde",
  "1545996124-0501ebae84d0",
  "1524504388940-b1c1722653e1",
  "1531123897727-8f129e1688ce",
];

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickTags() { return Array.from(new Set(Array.from({length:4}, ()=>sample(TAGS)))); }
function imgFor(seed) {
  return `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=80`;
}
function pickPhotos() {
  const shuffled = [...UNSPLASH_SEEDS].sort(() => Math.random() - 0.5);
  const count = 2 + Math.floor(Math.random() * 3); // 2–4 photos
  return shuffled.slice(0, count).map(imgFor);
}

function generateProfiles(count = 12) {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    profiles.push({
      id: `p_${i}_${Date.now().toString(36)}`,
      name: sample(FIRST_NAMES),
      age: 18 + Math.floor(Math.random() * 22),
      city: sample(CITIES),
      title: sample(JOBS),
      bio: sample(BIOS),
      tags: pickTags(),
      photos: pickPhotos(),
    });
  }
  return profiles;
}

// -------------------
// Swipe logic
// -------------------
function getTopCard() {
  return deckEl.lastElementChild;
}

function dismissCard(card, direction) {
  if (!card || card.classList.contains('card--exit-left') || card.classList.contains('card--exit-right') || card.classList.contains('card--exit-up')) return;
  card.classList.remove('card--dragging');
  card.style.transform = '';
  if (direction === 'right') card.classList.add('card--exit-right');
  else if (direction === 'up') card.classList.add('card--exit-up');
  else card.classList.add('card--exit-left');
  card.addEventListener('transitionend', () => card.remove(), { once: true });
}

function showPhoto(card, index) {
  card.querySelectorAll('.card__gallery-img').forEach((img, i) =>
    img.classList.toggle('active', i === index)
  );
  card.querySelectorAll('.card__dot').forEach((dot, i) =>
    dot.classList.toggle('active', i === index)
  );
  card.dataset.photoIndex = index;
}

function addSwipeListeners(card) {
  const DISMISS_THRESHOLD = 100;
  let startX, startY, isDragging = false;
  let lastTapTime = 0;

  card.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;
    card.setPointerCapture(e.pointerId);
    card.classList.add('card--dragging');
  });

  card.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const angle = dx * 0.08;
    card.style.transform = `translateX(${dx}px) translateY(${dy}px) rotate(${angle}deg)`;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDy > absDx && dy < -30) {
      card.classList.add('card--show-super');
      card.classList.remove('card--show-nope', 'card--show-like');
    } else if (dx < -30) {
      card.classList.add('card--show-nope');
      card.classList.remove('card--show-like', 'card--show-super');
    } else if (dx > 30) {
      card.classList.add('card--show-like');
      card.classList.remove('card--show-nope', 'card--show-super');
    } else {
      card.classList.remove('card--show-nope', 'card--show-like', 'card--show-super');
    }
  });

  card.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('card--dragging', 'card--show-nope', 'card--show-like', 'card--show-super');

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Tap detection (no significant movement)
    if (absDx < 10 && absDy < 10) {
      card.style.transform = '';
      const now = Date.now();
      if (now - lastTapTime < 300) {
        const imgs = card.querySelectorAll('.card__gallery-img');
        if (imgs.length > 1) {
          let idx = parseInt(card.dataset.photoIndex || '0');
          const rect = card.getBoundingClientRect();
          idx = (e.clientX - rect.left) < rect.width / 2
            ? (idx - 1 + imgs.length) % imgs.length
            : (idx + 1) % imgs.length;
          showPhoto(card, idx);
        }
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
      return;
    }

    // Swipe detection
    if (absDy > absDx && dy < -DISMISS_THRESHOLD) {
      dismissCard(card, 'up');
    } else if (dx < -DISMISS_THRESHOLD) {
      dismissCard(card, 'left');
    } else if (dx > DISMISS_THRESHOLD) {
      dismissCard(card, 'right');
    } else {
      card.style.transform = '';
    }
  });

  card.addEventListener('pointercancel', () => {
    isDragging = false;
    card.classList.remove('card--dragging', 'card--show-nope', 'card--show-like', 'card--show-super');
    card.style.transform = '';
  });
}

// -------------------
// UI rendering
// -------------------
const deckEl = document.getElementById("deck");
const shuffleBtn = document.getElementById("shuffleBtn");
const likeBtn = document.getElementById("likeBtn");
const nopeBtn = document.getElementById("nopeBtn");
const superLikeBtn = document.getElementById("superLikeBtn");

let profiles = [];

function renderDeck() {
  deckEl.setAttribute("aria-busy", "true");
  deckEl.innerHTML = "";

  profiles.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.photoIndex = "0";

    const gallery = document.createElement("div");
    gallery.className = "card__gallery";

    p.photos.forEach((src, i) => {
      const img = document.createElement("img");
      img.className = "card__gallery-img" + (i === 0 ? " active" : "");
      img.src = src;
      img.alt = `${p.name} — photo ${i + 1}`;
      img.draggable = false;
      gallery.appendChild(img);
    });

    if (p.photos.length > 1) {
      const dots = document.createElement("div");
      dots.className = "card__dots";
      p.photos.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.className = "card__dot" + (i === 0 ? " active" : "");
        dots.appendChild(dot);
      });
      gallery.appendChild(dots);
    }

    const body = document.createElement("div");
    body.className = "card__body";

    const titleRow = document.createElement("div");
    titleRow.className = "title-row";
    titleRow.innerHTML = `
      <h2 class="card__title">${p.name}</h2>
      <span class="card__age">${p.age}</span>
    `;

    const meta = document.createElement("div");
    meta.className = "card__meta";
    meta.textContent = `${p.title} • ${p.city}`;

    const chips = document.createElement("div");
    chips.className = "card__chips";
    p.tags.forEach((t) => {
      const c = document.createElement("span");
      c.className = "chip";
      c.textContent = t;
      chips.appendChild(c);
    });

    body.appendChild(titleRow);
    body.appendChild(meta);
    body.appendChild(chips);

    const stampNope = document.createElement('span');
    stampNope.className = 'stamp stamp--nope';
    stampNope.textContent = 'NOPE';

    const stampLike = document.createElement('span');
    stampLike.className = 'stamp stamp--like';
    stampLike.textContent = 'LIKE';

    const stampSuper = document.createElement('span');
    stampSuper.className = 'stamp stamp--super';
    stampSuper.textContent = 'SUPER';

    card.appendChild(gallery);
    card.appendChild(body);
    card.appendChild(stampNope);
    card.appendChild(stampLike);
    card.appendChild(stampSuper);

    addSwipeListeners(card);
    deckEl.appendChild(card);
  });

  deckEl.removeAttribute("aria-busy");
}

function resetDeck() {
  profiles = generateProfiles(12);
  renderDeck();
}

likeBtn.addEventListener("click", () => {
  dismissCard(getTopCard(), 'right');
});
nopeBtn.addEventListener("click", () => {
  dismissCard(getTopCard(), 'left');
});
superLikeBtn.addEventListener("click", () => {
  dismissCard(getTopCard(), 'up');
});
shuffleBtn.addEventListener("click", resetDeck);

// Boot
resetDeck();
