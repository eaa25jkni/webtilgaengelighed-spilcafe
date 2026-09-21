"use strict"; // Aktiverer strict mode - hjælper med at fange fejl

// Starter app når DOM er loaded
document.addEventListener("DOMContentLoaded", initApp);

// ===== GLOBALE VARIABLER =====
    let allGames = [];

    const gamesContainer = document.querySelector("#game-list");

    let favoriteIds = JSON.parse(localStorage.getItem("favoriteGames")) || []; //vi henter dataen fra local storage om vi har nogle favorit brætspil. hvis der ikke er noget oprettes der en tom liste []




// ===== INITIALISERING =====
    function initApp() {
        console.log("javaScript kører");
        getGames(); // Hent alle games fra JSON og start applikationen
    }
  



// ===== DATA HENTNING =====
    async function getGames() {
    
        console.log("🌐 Henter alle games fra JSON...");
        const response = await fetch(
            "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
        );

        allGames = await response.json();
        console.log(`📊 JSON data modtaget: ${allGames.length} games`);

        //populateGenreDropdown(); // Udfyld dropdown med genres <-----
        //LocationDropdown(); // Udfyld dropdown med locations <-----
        displayGames(allGames);
        //populateCarousel(); // Tilføj top-rated games til karrussel
        //populateScrollCarousel(); // Tilføj nyere games til scroll-karrussel
        //updateActiveFiltersDisplay(); // Initialiser aktive filtre display
    }


    //===========FAVORITTER===========
        function isFavorite(id) {
            return favoriteIds.includes(id);
        }

        //=====FAVORIT TOGGLE FUNKTION======

        //Man skal kunne toggle mellem gem favorit og fjern favorit.

        function toggleFavorite(id) {
            if (favoriteIds.includes(id)) {
                favoriteIds = favoriteIds.filter((favoriteId) => {
                    return favoriteId !== id; //tjekker på en id, hvis det er inkluderet, så er det true, og så skal den Så fjerne id fra arrayet.
                });
            } else {
                favoriteIds.push(id);  //hvis ikke id findes på listen, så er det false og den kører push, hvor den tilføjer id'et favorite id
            }

            localStorage.setItem("favoriteGames", JSON.stringify(favoriteIds)); //Vi gemmer i localstorage

            displayGames(allGames); //Så kører vi listen igen, således ikonerne opdateres
        }

        // Opdater alle ikoner og aria for et specifikt spil
        function updateFavoriteButton(button, id) {
        const fav = isFavorite(id);
            button.setAttribute("aria-pressed", fav) //tilføjer antributten aria-pressed
            button.querySelector("img").scr = fav 
            ? "images/favorit-fyldt-ikon.png" //hvis fav er sand, så skal hjertet være fyldt
            : "images/favorit-tomt-ikon.png"; //hvis falsk skal hjertet være tomt
        }
     


// ===== VISNING =====  

// Vis ÉT game card til game list
function displayGames(gameList) {

    const html = gameList
    .map((game) => {      //.map kører igennem vores games, og skal tjekke om spillet er en favorit, og dermed bliver det rigtige ikon vist.
        let favoriteIcon

        if (isFavorite(game.id)) { //hvis favorit id'et er true, så skal der vises en fyldt hjerte
            favoriteIcon = "images/favorit-fyldt-ikon.png"

        } else { //hvis ikke så skal stjernen være tom
            favoriteIcon = "images/favorit-tomt-ikon.png"
        }

    return `
        <article class="game-card">
                <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster" />
                <button type="button" class="favorite-btn" data-id="${game.id}" aria-pressed="${isFavorite(game.id)}" aria-label="Favoritknap">
                    <img src="${favoriteIcon}" alt="FavoritKnap" class="favorite-icon"/>
                </button>
                
            <div class="game-info">
                <div class="game-card-overskrift">
                    <h2>${game.title} </h2>
                    <span class="game-rating"><img src="images/Stjerne ikon.png" alt="Rating" class="rating-icon"> ${game.rating}</span>

                </div>

                <ul>
                    <li class="game-shelf">Hylde ${game.shelf}</li>
                    <li class="game-players"><img src="images/Spillere ikon.png" alt="Players" class="players-icon"> ${game.players.min}-${game.players.max} spillere</li>
                    <li class="game-playtime"><img src="images/Tid ikon.png" alt="Playtime" class="playtime-icon"> ${game.playtime} minutter</li>
                    <li class="game-genre"></li><img src="images/Kategori ikon.png" alt="Genre" class="genre-icon"> ${game.genre}</li>
                </ul>
            </div>
        </article>
    
    `;
    })
    .join(""); //det samler vores html stringer som map laver til en lang html-stirng.
    


    //=========DOM-MANIPULATION==========
    gamesContainer.innerHTML = html; //Her indsættes det i vores HTML i vores gamesContainer.


    //=========FAVORITKNAPPER==========

        //vi samler alle favorit knapperne i en variable ved at søge efter alle elementer med classen favorite-btn
        const favoriteButtons = gamesContainer.querySelectorAll(".favorite-btn");

        favoriteButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.stopPropagation(); //dette gør sådan at kørtet ikke også åbnes, når favoritknappen klikkes.
                const gameId = Number(button.dataset.id); //hvorefter den så skal hente hver id og lave det om et tal
            toggleFavorite(gameId);

            //Tilgængelighed til tastaturnavigation
            //Når der klikkes på en favoritknap gentegnes hele listen, så for at sørge for at brugeren starter samme sted som før med tab, altså at de ikke mister deres position:
            const sameButton = gamesContainer.querySelector (
                `.favorite-btn[data-id="${gameId}"]`     //vi finder samme favoritknap, og gemmer den i const sameButton
            );
            if (sameButton) {
                sameButton.focus(); //gør den valgte favorit knap aktiv igen
            }

            });
        });


    //=========ÅBEN MODAL===========
        //Når vi indtænker tilgængelighed er det vigtigt, at man kan åbne game-card både med musen (click) og med tasturet (tab og enter)

        const gameCards = document.querySelectorAll(".game-card")

        gameCards.forEach((card, index) => { //for hvert kort får funktionen de værdier: det aktuelle kort (html elementet), og index, altså den placering i listen.
            const game = gameList[index];

            //Så man kan klikke med musen
            card.addEventListener("click", () => {
                showGameModal(game);
            });


            //Så man kan bruge tab og enter eller mellemrum til at åbne modalen
            card.addEventListener("keydown", (event) => {
                if (event.target !== card) return; //så fokus kun gælder når det er på selve kortet og ikke når det er på favoritknappen som ligger inden i kortet.

                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault(); //som standart ruller mellemrumtasten ned på siden, det ville vi gerne undgå når de klikker på kortet. Derfor siger vi dette
                    showGameModal(game);
                }
            });

        });
}


// ===== MODAL =====
    function showGameModal(game) {
    console.log("🎭 Åbner modal for:", game.title);

    // Byg HTML struktur dynamisk
    const dialogContent = document.querySelector("#dialog-content");
    const favoriteIconSrc = isFavorite(game.id)
        ? "images/favorit-fyldt-ikon.png"
        : "images/favorit-tomt-ikon.png";

    dialogContent.innerHTML = `
    <article class="modal-game-card">

        <div class="game-poster-container">
            <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster" />
            <button type="button" class="favorite-btn" data-id="${game.id}" aria-pressed="${isFavorite(game.id)}" aria-label="Favoritknap">
                        <img src="${favoriteIconSrc}" alt="FavoritKnap" class="favorite-icon"/>
            </button>
        </div>

        <div class="dialog-game-info">
            <h1>${game.title} </h1>
            <p class="game-description">${game.description}</p>
            <p class="game-shelf">Hylde ${game.shelf}</p>

            <ul class="game-icons-grid">
                <li class="game-genre"><img src="images/Kategori ikon.png" alt="Genre" class="genre-icon"> ${game.genre}</li>
                <li class="game-rating"><img src="images/Stjerne ikon.png" alt="Rating" class="rating-icon"> ${game.rating}</li>
                <li class="game-players"><img src="images/Spillere ikon.png" alt="Players" class="players-icon"> ${game.players.min}-${game.players.max} spillere</li>
                <li class="game-playtime"><img src="images/Tid ikon.png" alt="Playtime" class="playtime-icon"> ${game.playtime} minutter</li>
                <li class="game-age"><img src="images/Alder ikon.png" alt="Age" class="age-icon"> ${game.age}+</li>
                <li class="game-difficulty"><img src="images/Sværhedsgrad ikon.png" alt="Difficulty" class="difficulty-icon"> ${game.difficulty}</li>
            </ul>

            <p class="game-rules">${game.rules}</p>
            </div>
        </article>
    `;

    // Favoritknappen inde i modalen
    const modalFavoriteButton = dialogContent.querySelector(".favorite-btn");
    modalFavoriteButton.addEventListener("click", () => {
        toggleFavorite(game.id);
        updateFavoriteButton(modalFavoriteButton, game.Id); //så opdatere favoritknappen kun
    });

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

