import { render } from "./render.js" ;
import { sounds , playSound } from "./sounds.js" ;

let powerMenu = document.querySelector(".powers-menu");
let cardsSpace = document.querySelector(".cards-space");
let timer = document.querySelector(".timer");

function theTimeFrozen  (gameState , turn) {
    gameState.activePowers.freezeTimeUsed = false ;
    render.renderTimer(gameState.timeLeft , true , gameState);
    clearInterval(gameState.currentTimerId);
    render.freezeTimeAbilityUi(gameState);
}

function thePlayerWin (gameState , turn) {
    clearInterval(gameState.currentTimerId) ;
    powerMenu.dataset.status = "none";
    playSound(sounds.win);
    gameState.roundCoins += gameState.winningReward ;
    render.renderTimer(gameState.timeLeft , turn , gameState , gameState.stopTheGame);
}

function falconEyeActive (gameState , turn) {
    clearInterval(gameState.currentTimerId);
    gameState.timeBeforeStart = 2 ;
    render.renderTimer(gameState.timeBeforeStart , false , gameState);
    logic.startTheTimer(gameState , false);
}

function decreaseTime (gameState , turn) {
    --gameState.timeLeft ;
    render.renderTimer(gameState.timeLeft , turn , gameState);
}

function activateTimeShield (gameState , turn) {
    gameState.activePowers.shieldUsed = true ;
    gameState.activePowers.shieldReady = false ;
    logic.TimeShieldAbility(gameState);
}

function triggerGameOver (gameState , turn) {
    if (gameState.activePowers.shieldReady) {
        activateTimeShield(gameState);
    }   else {
        powerMenu.dataset.status = "none";
        playSound(sounds.lose);
        gameState.roundCoins += gameState.loseReward ;
        render.renderTimer(gameState.timeLeft , false , gameState , true);
        render.renderLoseScreeen(gameState.loseReward , gameState.matchedPairs , gameState.cardsToMatch);
        clearInterval(gameState.currentTimerId);
    }   
}


export const logic = {        
    startTheTimer: (gameState , turn) => {
        clearInterval(gameState.currentTimerId);

        const timerTriggers = [
            {condition: () => gameState.activePowers.freezeTimeUsed , action: (gameState , turn) => theTimeFrozen(gameState , turn)},
            {condition: () => gameState.stopTheGame , action: (gameState , turn) => thePlayerWin(gameState , turn)},
            {condition: () => gameState.activePowers.falconEye , action: (gameState , turn) => falconEyeActive(gameState , turn)},
            {condition: () => gameState.timeLeft > 0 , action: (gameState , turn) => decreaseTime(gameState , turn)},
            {condition: () => gameState.timeLeft === 0 , action: (gameState , turn) => triggerGameOver(gameState , turn)},
        ];

        gameState.currentTimerId = setInterval(() => {
            if (turn) {
                timerTriggers.find(trigger => {
                if (trigger.condition()) {
                    trigger.action(gameState , turn);
                    return true ;
                }
            });
            }   else {
                if (gameState.timeBeforeStart > 0) {
                    --gameState.timeBeforeStart ;
                    render.renderTimer(gameState.timeBeforeStart , turn , gameState);
                }  else {
                    clearInterval(gameState.currentTimerId);
                }
            }
        } , 1000);
    },

    shuffle: (array) => {
        for (let i = array.length -1 ; i > 0 ; i--) {
            let j = Math.floor(Math.random() * (i+1));
            [array[i] , array[j]] = [array[j] , array[i]] ;
        }
        return array ;
    },

    randomCardSelection: (arr , num) => {
        let allCards = [] ;
        let array = [] ;
        let cards1 = [] ; 
        let cards2 = [] ;
        let set = new Set();
        let set2 = new Set();
        let number = Math.floor(Math.random() * 8);

        arr.forEach(ele => {
            ele.amount = 2 ;
        });

        while (cards1.length !== (num/2)) {
            while (set.has(number)) {
                number = Math.floor(Math.random() * 8) ;
            };
            set.add(number);
            cards1.unshift(arr[number]);
            arr[number].amount--;   
        };

        number = Math.floor(Math.random() * (num/2));
        while (cards2.length !== (num/2)) {
            while (set2.has(number)) {
                number = Math.floor(Math.random() * (num/2));
            };
            set2.add(number);
            cards2.unshift(cards1[number]);
            arr[number].amount--;   
        }

        cards1.forEach((card) => {
            array.unshift(card);
        });

        cards2.forEach((card) => {
            array.unshift(card);
        });

        allCards = logic.shuffle(array);
        render.renderGameCards(allCards);
    },

    checkWinCondition: (gameState) => {
        if (gameState.matchedPairs === gameState.cardsToMatch) {
            gameState.stopTheGame = true ;
        }

        if (gameState.stopTheGame) {
            render.renderWinScreeen(gameState.winningReward , gameState.timeLeft);
        }
    },

    cardMatchingCheck: (selctionCards , gameState , leaderboard , levels) => {
        if (selctionCards[0].dataset.type === selctionCards[1].dataset.type) {
            setTimeout(() => {
                playSound(sounds.match);
                render.hiddenMatchedCards(selctionCards[0] , gameState);
            } , 500);
            ++gameState.matchedPairs;
            logic.checkWinCondition(gameState);
            if (gameState.stopTheGame) {
                logic.calcGameTime(gameState , leaderboard , levels);
            }
        }   else {
            setTimeout(() => {
                playSound(sounds.wrongMatch);
                render.rotateAllCards();
            } , 700);
        }
        selctionCards[0].classList.remove("flipped");
        selctionCards[1].classList.remove("flipped");

        gameState.canFlip = true ;
    },

    getShopCardsStatus: (item , player) => {
        let theItem = player.inventory.find((ele) => {
            if (item.title === ele.title){
                return ele ;
            }
        });

        let theRest = player.coins - item.price ;

        if (item.amount > theItem.amount && theRest >= 0) {
            return "available";
        }   else if (item.amount <= theItem.amount) {
            return "maxed" ;
        }   else if (theRest < 0) {
            return "no-funds";
        }
    },

    buyItemLogic: (title , price , player) => {
        let theItem = player.inventory.find((ele) => {
            if (title === ele.title){
                return ele ;
            }
        });

        theItem.amount++;
        player.coins -= price ;

        localStorage.setItem("player" , JSON.stringify(player));
    },

    getInventoryStatusColor: (gameAmount , playerAmount) => {
        let rate = playerAmount / gameAmount;
        if (rate >= 1) {
            return "green" ;
        }   else if (rate === 0) {
            return "red" ;
        }   else {
            return "orange" ;
        }
    },

    getInventoryStatusUse: (playerAmount) => {
        if (playerAmount > 0) {
            return "can-use";
        }   else {
            return "cant-use";
        }
    },

    selectingAbilities: (item , card , btn , player) => {
        if (player.equippedPowers.length < 3 || card.dataset.status === "use") {
            if (card.dataset.status === "not-use") {
                card.dataset.status = "use";
                player.equippedPowers.unshift({id:item.id , used:false});
            }   else if (card.dataset.status === "use") {
                card.dataset.status = "not-use";
                player.equippedPowers = player.equippedPowers.filter((power) => {
                    if (power.id !== item.id) {
                        return power ;
                    }
                });
            }
            localStorage.setItem("player" , JSON.stringify(player));
        }   else {
            btn.dataset.max = "true" ;
            setTimeout(() => {
                btn.dataset.max = "false";
            }, 300);
        }
    },

    syncEquippedPowers:(player) => {
        player.equippedPowers = player.equippedPowers.filter((power) => {
            const inventoryItem = player.inventory.find((item) => {
                if (item.id === power.id) {
                    return item ;
                }
            });
            return inventoryItem?.amount > 0 ;
        });
        localStorage.setItem("player" , JSON.stringify(player));
    },  

    isThePowerUsed:(id , player) => {
        let use = false ;
        use = player.equippedPowers.find((item) => {
            if (item.id === id) {
                return true ;
            }
        });

        if (use) {
            return "use";
        }   else {
            return "not-use";
        }
    },

    calcGameTime: (gameState , leaderboard , levels) => {
        let tempLeaderboard = {time:0 , level:""} ;

        let selectedLevel = Object.values(levels)
        .find((level) => level.title === gameState.currentLevelName);

        tempLeaderboard = {
            time:(selectedLevel.time - gameState.timeLeft),
            level:gameState.currentLevelName ,
        };    

        leaderboard[gameState.currentLevelName].unshift(tempLeaderboard);
        tempLeaderboard = {} ;

        logic.filterLeaderboard(leaderboard , selectedLevel.title);
    },

    filterLeaderboard: (leaderboard , level) => {
        leaderboard[level] = leaderboard[level].sort((a, b) => (a.time - b.time)).slice(0 , 3);
        localStorage.setItem("leaderboard" , JSON.stringify(leaderboard));
    },

    logicCalcCoins :(coins) => {
        const divisors = {
            0:1, 
            1:1000,
            2:1000000,
            3:1000000000
        }

        let scaleFactor = 1 ;
        let unitIndex = Math.floor(((coins.toString().length - 1) / 3));

        if (coins > 999) {
            for(let i = 0 ; i < 3 ; i++) {
                if (divisors[unitIndex]) {
                    scaleFactor = divisors[unitIndex] ;
                    break ;
                }
            }
        }

        coins = Number( (coins / scaleFactor).toFixed(2));

        return {
            scaledNumber: coins,
            unitIndex: unitIndex,
        }

    },

    TimeShieldAbility: (gamestate , turn) => {
        gamestate.activePowers.shieldReady = true ;

        if (gamestate.activePowers.shieldUsed) {
            playSound(sounds.shield);
            gamestate.activePowers.shieldUi = true ;
            gamestate.activePowers.uiAbilites = true ;
            gamestate.activePowers.shieldUsed  = false ;
            gamestate.activePowers.shieldReady = false ;
            gamestate.timeLeft = 5 ;
            render.renderTimer(gamestate.timeLeft , true , gamestate);
            logic.startTheTimer(gamestate , true);
        }
    },

    magicalCastingAbility: (gamestate) => {
        let card = document.querySelector(".cards-space .card:not(.matched)");
        let allCards = document.querySelectorAll(".cards-space .card");

        allCards = Array.from(allCards);

        let cards = allCards.filter((item) => {
            if (item.dataset.type === card.dataset.type) {
                return item ;
            }
        });

        cards.forEach((card) => {
            render.rotateCard(card  , gamestate);
        });

        render.addBlockClickCards();
        gamestate.canFlip = false ;

        setTimeout(() => {
            playSound(sounds.magic);
            logic.cardMatchingCheck(cards , gamestate);
            gamestate.canFlip = true ;
            render.removeBlockClickCards();
        } , 700);
    },

    falconEyeAbility: (gameState) => {
        playSound(sounds.falconEye);
        render.addBlockClickCards();
        render.addBlockClickPowers();
        gameState.activePowers.falconEye = true ;
        gameState.activePowers.uiAbilites = true ; 

        let allCards = document.querySelectorAll(".card-body");
        allCards.forEach((card) => {
            card.classList.remove("revers-rotate");
            card.classList.add("rotate");
        });

        
        setTimeout(() => {
        gameState.activePowers.uiAbilites = false ; 
            gameState.activePowers.falconEye = false ;
            allCards.forEach((card) => {
                card.classList.remove("rotate");
                card.classList.add("revers-rotate");
            });
            render.removeBlockClickCards();
            render.removeBlockClickPowers();
            render.renderTimer(gameState.timeLeft , true , gameState);
            logic.startTheTimer(gameState , true);
        } , 3000);
    },

    foucsAbility: (gameState) => {
        gameState.activePowers.foucs = true ;
        playSound(sounds.focus);
    },

    freezeTimeAbility: (gameState) =>  {
        gameState.activePowers.freezeTimeUsed = true;
        gameState.activePowers.freezeTimeUi = true ;
        gameState.activePowers.uiAbilites = true ;
        playSound(sounds.freeze);
    },

    compassAbility: (gameState) => {
        render.addBlockClickCards();
        gameState.canFlip = false ;

        let card = document.querySelector(".cards-space .card:not(.matched)");
        let allCards = document.querySelectorAll(".cards-space .card");

        allCards = Array.from(allCards);

        let cards = allCards.filter((item) => {
            if (item.dataset.type === card.dataset.type) {
                return item ;
            }
        });


        cards.forEach((card) => {
            card.classList.add("compass");
        });

        playSound(sounds.compass);

        setTimeout(() => {
            render.removeBlockClickCards();
            gameState.canFlip = true ;
            cards.forEach((card) => {
                card.classList.remove("compass");
            });
        } , 1000);

    },

    lightningSpeedAbility: (gameState) => {
        gameState.activePowers.lightningSpeedUsed = true ;
        gameState.activePowers.lightningSpeedUi = true ;
        gameState.activePowers.uiAbilites = true ;
        playSound(sounds.lightning);

        setTimeout(() => {
            gameState.activePowers.lightningSpeedUsed = false ;
            gameState.activePowers.lightningSpeedUi = false ;
            gameState.activePowers.uiAbilites = false ;
            timer.classList.remove("Speed");
            cardsSpace.classList.remove("Speed");
        } , (10 * 1000));
    },
}; 
