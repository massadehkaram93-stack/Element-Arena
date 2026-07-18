import { logic } from "./logic.js";

let mainScreen = document.querySelector(".main-screen");
let loadingScreen = document.querySelector(".loading-screen");
let gameScreen = document.querySelector(".game-screen");

let namePlace = document.querySelector(".user-name");
let uiOverlay = document.querySelector(".ui-overlay");
let sideMenu = document.querySelector(".side-menu");

let cardsSpace = document.querySelector(".cards-space");
let shopBody = document.querySelector(".shop-body");
let storageBody = document.querySelector(".storage-body");

let allCards = document.querySelectorAll(".card");
let timer = document.querySelector(".timer");
let powerMenu = document.querySelector(".powers-menu");

let allPowers = document.querySelectorAll(".power-icon");

let first = document.querySelector(".first");
let scound = document.querySelector(".scound");
let third = document.querySelector(".theerd");
let allPlatforms = [first , scound , third];

function foucsAbility () {
    timer.classList.remove("auto-throb");
    timer.classList.remove("fast-auto-throb");
    cardsSpace.classList.remove("warning");
    cardsSpace.classList.remove("danger");
}

function lightningSpeedUi (gameState) {
    timer.classList.add("Speed");
    cardsSpace.classList.add("Speed");
    timer.innerHTML = `<span>⚡</span> ${gameState.timeLeft}`;
}

function freezeTimeUi (gameState) {
    timer.classList.add("freeze");
    cardsSpace.classList.add("freeze");
    timer.innerHTML = `<span>❄</span> ${gameState.timeLeft}`;
}

function shieldUi (gameState) {
    cardsSpace.classList.add("Shield");
    timer.classList.add("Shield");
    timer.dataset.color = "white";
    if (gameState.timeLeft === 0) {
        timer.classList.remove("Shield");
        cardsSpace.classList.remove("Shield");
        gameState.activePowers.shieldUi = false;
        gameState.activePowers.uiAbilites = false;
    }   
    timer.innerHTML = `<span>🛡</span> ${gameState.timeLeft}`;
}

function loadTimerCases (gameState) {
    let temp = [
        {condition: () => gameState.activePowers.foucs || gameState.activePowers.uiAbilites , action: (gameState) => foucsAbility(gameState)},
        {condition: () => gameState.activePowers.lightningSpeedUi , action: (gameState) => lightningSpeedUi(gameState)},
        {condition: () => gameState.activePowers.freezeTimeUi , action: (gameState) => freezeTimeUi(gameState)},
        {condition: () => gameState.activePowers.shieldUi , action: (gameState) => shieldUi(gameState)},
    ];
    return temp ;
}

function stopTimerUi () {
    timer.classList.add("none");
    timer.classList.remove("throb");
    timer.classList.remove("auto-throb");
    timer.classList.remove("fast-auto-throb");
    cardsSpace.classList.remove("warning");
    cardsSpace.classList.remove("danger");
    timer.classList.remove("Shield");
    cardsSpace.classList.remove("Shield");
    timer.classList.remove("Speed");
    cardsSpace.classList.remove("Speed");
    timer.classList.remove("freeze");
    cardsSpace.classList.remove("freeze");
}


let timerCases = [] ;

export const render = {
    goToGameScreen: () => {
        mainScreen.classList.add("none");
        loadingScreen.classList.remove("none");

        setTimeout(() => {
            loadingScreen.classList.add("none");
            gameScreen.classList.remove("none");
        }, 2500);
    },

    renderUserName: (player) => {
        namePlace.innerText = `✨ اهلا بك, ${player.name}`;
    },

    openMenu: (menu) => {
        menu.classList.remove("none");
        menu.classList.remove("close");
        menu.classList.add("open");
        uiOverlay.classList.add("active");
    },

    closeMenu: (menu) => {
        menu.classList.remove("open");
        menu.classList.add("close");
        setTimeout(() => {
            menu.classList.add("none");
        }, 1000);
        uiOverlay.classList.remove("active");
    },

    renderShop: (items, player) => {
        shopBody.innerHTML = items.map(item => {
            return `<div class="card" data-price="${item.price}" data-title="${item.title}" data-status="${logic.getShopCardsStatus(item, player)}">
                <img src="${item.image}" alt="صورة للقدرة" width="150">
                <button class="buy-btn">${item.price}🟡</button>
                <button class="info" data-description="${item.description}" data-title="${item.title}"  >📜</button>
            </div>`
        }).join("");
    },

    renderStorage: (player, items) => {
        storageBody.innerHTML = items.map((item, index) => {
            return `<div class="card" data-title="${item.title}" data-amount="${item.amount}" data-number="${player.inventory[index].amount}" data-count-color="${logic.getInventoryStatusColor(item.amount, player.inventory[index].amount)}" data-status="${logic.isThePowerUsed(item.id, player)}" data-use="${logic.getInventoryStatusUse(player.inventory[index].amount)}" ">
                        <img src="${item.image}" alt="" width="150">
                        <button class ="use-btn" data-max="false">استخدم</button>
                    </div> `
        }).join("");

    },

    rotateCard: (card, gameState) => {
        render.addBlockClickCards();
        if (card.classList.contains("rotate")) {
            card.classList.remove("rotate");
            card.classList.add("revers-rotate");
        } else {
            if (card.classList.contains("revers-rotate")) {
                card.classList.remove("revers-rotate");
                card.classList.add("rotate");
            } else {
                card.classList.add("rotate");
            }
        }

        if (!gameState.activePowers.lightningSpeedUi) {
            setTimeout(() => {
                render.removeBlockClickCards();
            }, 100);
        } else {
            render.removeBlockClickCards();
        }
    },

    renderGameScreen: (level) => {
        namePlace.classList.add("none");
        sideMenu.classList.add("none");
        timer.classList.remove("none");
        powerMenu.dataset.status = level;
    },

    renderTimer: (time, turn, gameState, stop) => {
        if (timerCases.length === 0) {
            timerCases = loadTimerCases(gameState);  
        }

        timerCases.forEach((caes) => {
            if (caes.condition()) {
                caes.action(gameState);
            }
        });

        timer.dataset.color = "white";

        if (!gameState.activePowers.foucs && !gameState.activePowers.lightningSpeedUi && !gameState.activePowers.freezeTimeUi && !gameState.activePowers.shieldUi) {
            if (turn) {
                if (time > 10) {
                    timer.dataset.color = "white";
                } else if (time <= 10 && time > 5) {
                    timer.classList.remove("throb");
                    timer.classList.add("auto-throb");
                    timer.dataset.color = "orange";
                    cardsSpace.classList.add("warning");
                } else if (time <= 5 && time < 6) {
                    timer.classList.remove("auto-throb");
                    timer.classList.add("fast-auto-throb");
                    timer.dataset.color = "red";
                    cardsSpace.classList.remove("warning");
                    cardsSpace.classList.add("danger");
                }
            }
            timer.innerHTML = `<span>⌛</span> ${time}`;
        }
        
        if (time === 0 && gameState.activePowers.foucs) {
            gameState.activePowers.foucs = false;
        }
        
        if (!timer.classList.contains("auto-throb") && !timer.classList.contains("fast-auto-throb")) {
            timer.classList.add("throb");
        }

        if (stop) {
            stopTimerUi();
        }

    },

    resetRoundAbilitiesUi: (gameState) => {
        timer.classList.remove("throb");
        timer.classList.remove("auto-throb");
        timer.classList.remove("fast-auto-throb");
        timer.classList.remove("Shield");
        timer.classList.remove("freeze");
        timer.classList.remove("Speed");

        cardsSpace.classList.remove("warning");
        cardsSpace.classList.remove("danger");
        cardsSpace.classList.remove("Shield");
        cardsSpace.classList.remove("freeze");
        cardsSpace.classList.remove("Speed");

        timer.innerHTML = `<span>⌛</span> ${gameState.timeLeft}`;
        timer.dataset.color = "white";
    },

    renderGameCards: (arr) => {
        cardsSpace.innerHTML = arr.map((card) => {
            return `<div class="card" data-type="${card.type}">
                            <div class="card-body rotate">
                                <div class="front"><img src='${card.image}' alt="" class="front-img"></div>
                                <div class="back"><img src="imgs/The card appeared.png" alt="" class = "back-img"></div>
                            </div>
                    </div>`
        }).join("");
    },

    rotateAllCards: () => {
        let allCardsBody = document.querySelectorAll(".card-body");
        allCardsBody.forEach((card) => {
            card.classList.remove("rotate");
            card.classList.add("revers-rotate");
        });
    },

    addBlockClickCards: () => {
        allCards.forEach((card) => {
            card.classList.add("block");
        });
    },

    removeBlockClickCards: () => {
        allCards.forEach((card) => {
            card.classList.remove("block");
        });
    },

    hiddenMatchedCards: (Mcard, gamestate) => {
        let allCards = document.querySelectorAll(".card");
        if (!gamestate.activePowers.lightningSpeed) {
            render.addBlockClickCards();
            setTimeout(() => {
                render.removeBlockClickCards();
            }, 500);
        }
        allCards.forEach((card) => {
            if (card.dataset.type == Mcard.dataset.type) {
                card.classList.add("matched");
                Mcard.classList.add("matched");
            }
        });
    },

    renderWinScreeen: (winReward, timeLeft) => {
        cardsSpace.dataset.status = "win-screen";
        cardsSpace.innerHTML = `<div class="win-screen none">

                                    <h1 class="title">🎉 أحسنت!</h1>

                                    <p class="heroP">لقد أكملت المرحلة بنجاح ايها البطل</p>

                                    <div class = "time-result"> الوقت المتبقي: ${timeLeft} ثانية ⏱️</div>
                    
                                    <div class ="money-result"> العملات المكتسبة : ${winReward} 🟡</div>

                                    <button class ="replay-btn">اعادة لعب</button>
                                    
                                    <button class ="home-btn">الشاشة الرئيسية</button>

                                </div>`

    },

    renderLoseScreeen: (loseReward, matchedCards, cardsToMatch) => {
        cardsSpace.dataset.status = "lose-screen";
        cardsSpace.innerHTML = `<div class="lose-screen none">

                                    <h1 class = "title">💀 خسارة!</h1>

                                    <p class="heroP">انتهى الوقت قبل إكمال جميع الكروت</p>

                                    <div class = "matched-cards">🃏 الأزواج المطابقة: ${matchedCards} / ${cardsToMatch}</div>
                                    
                                        <div class ="money-result"> العملات المكتسبة : ${loseReward} 🟡</div>

                                    <button class ="replay-btn">اعادة المحاولة</button>
                                    
                                    <button class ="home-btn">الشاشة الرئيسية</button>
                                    
                                </div>`
    },

    returnToGamePage: () => {
        namePlace.classList.remove("none");
        sideMenu.classList.remove("none");
        powerMenu.dataset.status = "none";
    },

    renderDifficulteMenu: () => {
        cardsSpace.dataset.status = "chose-difficulte";

        cardsSpace.innerHTML = `<div class="chose-difficulte">

                                    <h3 class="title">اختر الصعوبة</h3>

                                    <ul>
                                        <li class="hard">صعب</li>
                                        <li class="middly">متوسط</li>
                                        <li class="easy">سهل</li>
                                    </ul>

                                </div>`
    },

    renderCoins: (coinObject) => {
        let coinInput = document.querySelector("#Money");
        const symbols = { 0: "", 1: "K", 2: "M", 3: "B" };
        let unit = "";

        for (let i = 0; i < 3; i++) {
            if (symbols[coinObject.unitIndex]) {
                unit = symbols[coinObject.unitIndex];
                break;
            }
        }
        coinInput.value = `${Number(coinObject.scaledNumber)}${unit}`;
    },

    renderChosedPowers: (player, items) => {
        let powerMenu = document.querySelector(".powers-menu");

        if (player.equippedPowers.length != 0) {
            let allItems = items.filter((item) => {
                return player.equippedPowers.some(Pitem => Pitem.id === item.id);
            });

            powerMenu.innerHTML = allItems.map((item) => {
                return `<div class = "power-icon" data-id="${item.id}">
                        <img src="${item.image}" alt="" class="power-img">
                    </div>`
            }).join("");
        } else {
            powerMenu.innerHTML = `<p>لا توجد مهارات مجهزة !</p>
            <p> اذهب الي المتجر واشتري القدرات و جهزها 🔮</p>
            `;
        }
    },

    addBlockClickPowers: () => {
        allPowers.forEach((power) => {
            power.classList.add("block");
        });
    },

    removeBlockClickPowers: () => {
        allPowers.forEach((power) => {
            power.classList.remove("block");
        });
    },

    freezeTimeAbilityUi: (gameState) => {
        clearInterval(gameState.currentTimerId);

        gameState.currentTimerId = setInterval(() => {

            const snow = document.createElement("div");

            document.querySelector(".game-screen").appendChild(snow);

            snow.classList.add("snow");
            snow.innerHTML = "❄️";

            snow.style.left = Math.random() * 100 + "%";

            snow.addEventListener("animationend", () => {
                snow.remove();
            });

        }, 200);

        setTimeout(() => {
            clearInterval(gameState.currentTimerId);
            gameState.activePowers.freezeTimeUi = false;
            gameState.activePowers.uiAbilites = false;
            timer.classList.remove("freeze");
            cardsSpace.classList.remove("freeze");
            render.renderTimer(gameState.timeLeft, true, gameState);
            logic.startTheTimer(gameState, true);
        }, 5000);
    },

    renderLeaderboard: (leaderboard, level) => {
        allPlatforms.forEach((place, index) => {
            place.dataset.score = `${leaderboard[level][index] != undefined ? leaderboard[level][index].time : "---"}`;

            if (place.dataset.score != "---") {
                place.dataset.score = `${place.dataset.score}s`;
            }
        });
    },
};