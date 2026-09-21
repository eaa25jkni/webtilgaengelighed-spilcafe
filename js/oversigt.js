"use strict"; // Aktiverer strict mode - hjælper med at fange fejl

// Starter app når DOM er loaded
document.addEventListener("DOMContentLoaded", initApp);

// ===== GLOBALE VARIABLER =====
let allGames = [];

// ===== INITIALISERING =====
function initApp() {
  console.log("initApp: app.js is running 🎉");
  getGames(); // Hent alle games fra JSON og start applikationen
}
  



// ===== DATA HENTNING =====
async function getGames() {
  // Hent data fra JSON - husk at URL er anderledes!
  // Gem data i allGames variablen
  // Kald andre funktioner (hvilke?)

  console.log("🌐 Henter alle games fra JSON...");
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );
  allGames = await response.json();
  console.log(`📊 JSON data modtaget: ${allGames.length} games`);
  populateGenreDropdown(); // Udfyld dropdown med genres <-----
  LocationDropdown(); // Udfyld dropdown med locations <-----
  displayGames(allGames);
  populateCarousel(); // Tilføj top-rated games til karrussel
  populateScrollCarousel(); // Tilføj nyere games til scroll-karrussel
  updateActiveFiltersDisplay(); // Initialiser aktive filtre display
}

// ===== VISNING =====  // Vis alle games - loop gennem og kald displayGame() for hver game
function displayGames(games) {
  console.log(` Viser ${games.length} games`);
  // Nulstil #game-list HTML'en
  document.querySelector("#game-list").innerHTML = "";
  // Gennemløb alle games og kør displayGame-funktionen for hver game
  for (const game of games) {
    displayGame(game);
  }
}

// Vis ÉT game card til game list
function displayGame(game) {
  const gameList = document.querySelector("#game-list");
  const favoriteIconSrc = isFavorite(game.title)
    ? "Images/Favorit fyldt ikon.png"
    : "Images/Favorit tomt ikon.png";

  const gameHTML = `
    <article class="game-card">
        <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster" />
        <img src="${favoriteIconSrc}" alt="Favorit" class="favorite-icon" onclick="toggleFavorite(event, '${game.title}')">
      <div class="game-info">
        <h2>${game.title} <span class="game-rating"><img src="Images/Stjerne ikon.png" alt="Rating" class="rating-icon"> ${game.rating}</span></h2>
        <p class="game-shelf">Hylde ${game.shelf}</p>
        <p class="game-players"><img src="Images/Spillere ikon.png" alt="Players" class="players-icon"> ${game.players.min}-${game.players.max} spillere</p>
        <p class="game-playtime"><img src="Images/Tid ikon.png" alt="Playtime" class="playtime-icon"> ${game.playtime} minutter </p>
        <p class="game-genre"><img src="Images/Kategori ikon.png" alt="Genre" class="genre-icon"> ${game.genre}</p>  
      </div>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Tilføj click event til den nye card
  const newCard = gameList.lastElementChild;
  newCard.addEventListener("click", function () {
    console.log(`🎬 Klik på: "${game.title}"`);
    showGameModal(game);
  });

  // Tilføj keyboard support
  newCard.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showGameModal(game);
    }
  });
}



// ===== MODAL =====

// ===== FAVORIT SYSTEM =====

// Håndter favorit klik
function toggleFavorite(event, gameTitle) {
  event.stopPropagation(); // Forhindrer at game card også bliver klikket
  const favoriteIcon = event.target;

  // Hent eksisterende favoritter fra localStorage
  let favorites = getFavorites();

  // Toggle mellem tomt og fyldt hjerte
  if (favoriteIcon.src.includes("Favorit tomt ikon.png")) {
    favoriteIcon.src = "Images/Favorit fyldt ikon.png";
    // Tilføj til favoritter
    if (!favorites.includes(gameTitle)) {
      favorites.push(gameTitle);
      saveFavorites(favorites);
    }
    console.log(`❤️ Tilføjet til favoritter: ${gameTitle}`);
  } else {
    favoriteIcon.src = "Images/Favorit tomt ikon.png";
    // Fjern fra favoritter
    favorites = favorites.filter((title) => title !== gameTitle);
    saveFavorites(favorites);
    console.log(`💔 Fjernet fra favoritter: ${gameTitle}`);
  }

  // Opdater alle ikoner for dette spil (både i grid og dialog)
  updateFavoriteIcons(gameTitle, favorites.includes(gameTitle));
}

// Hent favoritter fra localStorage
function getFavorites() {
  const favorites = localStorage.getItem("gamesFavorites");
  return favorites ? JSON.parse(favorites) : [];
}

// Gem favoritter i localStorage
function saveFavorites(favorites) {
  localStorage.setItem("gamesFavorites", JSON.stringify(favorites));
}

// Opdater alle favorit-ikoner for et specifikt spil
function updateFavoriteIcons(gameTitle, isFavorite) {
  const iconSrc = isFavorite
    ? "Images/Favorit fyldt ikon.png"
    : "Images/Favorit tomt ikon.png";

  // Find alle ikoner for dette spil (både i grid og dialog)
  const allIcons = document.querySelectorAll(`img[onclick*="${gameTitle}"]`);
  allIcons.forEach((icon) => {
    icon.src = iconSrc;
  });
}

// Tjek om et spil er favorit
function isFavorite(gameTitle) {
  const favorites = getFavorites();
  return favorites.includes(gameTitle);
}

// Vis (alle) game detaljer i modal
// Hvilke felter har et game? (Se JSON strukturen)

function showGameModal(game) {
  console.log("🎭 Åbner modal for:", game.title);

  // Byg HTML struktur dynamisk
  const dialogContent = document.querySelector("#dialog-content");
  const favoriteIconSrc = isFavorite(game.title)
    ? "Images/Favorit fyldt ikon.png"
    : "Images/Favorit tomt ikon.png";

  dialogContent.innerHTML = `
   <div class="game-poster-container">
     <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster" />
     <img src="${favoriteIconSrc}" alt="Favorit" class="favorite-icon" onclick="toggleFavorite(event, '${game.title}')">
   </div>
   <div class="dialog-game-info">
      <h1>${game.title} </h1>
      <h2 class="game-description">${game.description}</h2>
      <p class="game-shelf">Hylde ${game.shelf}</p>
      <div class="game-icons-grid">
        <p class="game-genre"><img src="Images/Kategori ikon.png" alt="Genre" class="genre-icon"> ${game.genre}</p> 
        <p class="game-rating"><img src="Images/Stjerne ikon.png" alt="Rating" class="rating-icon"> ${game.rating}</p>
        <p class="game-players"><img src="Images/Spillere ikon.png" alt="Players" class="players-icon"> ${game.players.min}-${game.players.max} spillere</p>
        <p class="game-playtime"><img src="Images/Tid ikon.png" alt="Playtime" class="playtime-icon"> ${game.playtime} minutter </p>
        <p class="game-age"><img src="Images/Alder ikon.png" alt="Age" class="age-icon"> ${game.age}+</p>
        <p class="game-difficulty"><img src="Images/Sværhedsgrad ikon.png" alt="Difficulty" class="difficulty-icon"> ${game.difficulty}</p>
      </div>
      <p class="game-rules">${game.rules}</p>
      </div>
  `;

  // Åbn modalen og forhindre baggrunds scroll
  document.body.classList.add("modal-open");
  document.querySelector("#game-dialog").showModal();

  // Luk modal ved klik på backdrop eller ESC
  const dialog = document.querySelector("#game-dialog");

  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
}

