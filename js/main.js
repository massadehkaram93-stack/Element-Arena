import { logic } from "./logic.js" ;
import { render } from "./render.js" ;
import { sounds , playSound } from "./sounds.js" ;

let player = JSON.parse(localStorage.getItem("player") || `{
    "name": "",
    "coins": 0,
    "inventory": [
        {
            "title": "درع الوقت",
            "id": "Time Shield",
            "amount": 0
        },
        {
            "title": "الحذف الرقمي",
            "id": "Digital Delete",
            "amount": 0
        },
        {
            "title": "عين الصقر",
            "id": "Falcon Eye",
            "amount": 0
        },
        {
            "title": "تجميد الوقت",
            "id": "Freeze time",
            "amount": 0
        },
        {
            "title": "التركيز",
            "id": "the focus",
            "amount": 0
        },
        {
            "title": "البوصلة",
            "id": "compass",
            "amount": 0
        },
        {
            "title": "سرعة البرق",
            "id": "lightning speed",
            "amount": 0
        }
    ],
    "equippedPowers": []
}`);

let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || `{
        "easy": [],
        "middly": [],  
        "hard": []
}`);

let Update = JSON.parse(localStorage.getItem("Update") || "true") ;   

if (Update) {
    player = {
        name: "",
        coins: 1000,
        inventory: [
        { 
            title: "درع الوقت", 
            id: "Time Shield", 
            amount: 0 
        },

        { 
            title: "الحذف الرقمي", 
            id: "Digital Delete", 
            amount: 0 
        },

        { 
            title: "عين الصقر", 
            id: "Falcon Eye", 
            amount: 0 
        },

        {
            title: "تجميد الوقت", 
            id: "Freeze time", 
            amount: 0 
        },

        { 
            title: "التركيز", 
            id: "the focus",
            amount: 0 
        },

        {
            title: "البوصلة", 
            id: "compass", 
            amount: 0
        },

        { 
            title: "سرعة البرق", 
            id: "lightning speed", 
            amount: 0 
        },

        ],

        equippedPowers: [],
    }

    Update = false ;
    localStorage.setItem("Update" , JSON.stringify(Update));
};

let items  = [
    {title:"درع الوقت" , image:"imgs/Time Shield.jpg" , description:"فعّل الدرع لتحصل على فرصة نجاة واحدة. عند انتهاء الوقت أثناء تفعيل الدرع، لن تخسر وستحصل على 5 ثوانٍ إضافية" , amount:1 , price:200 , id:"Time Shield" , fn: (gameState) => logic.TimeShieldAbility(gameState)},
    {title:"الحذف الرقمي" , image:"imgs/Digital Delete.jpg" , description:"تقوم بأخراج بطاقتين من الجولة" , amount:1 , price:150 , id:"Digital Delete" , fn: (gameState) => logic.digitalDeleteAbility(gameState)},
    {title:"عين الصقر" , image:"imgs/Falcon Eye.jpg" , description:"تكشف جميع الكروت لمدة ثانيتين" , amount:2 , price:100 , id:"Falcon Eye" , fn: (gameState) => logic.falconEyeAbility(gameState)},
    {title:"تجميد الوقت" , image:"imgs/Freeze time.jpg" , description:"يقوم بتجميد المؤقت لمدة خمس ثواني" , amount:3 , price:75 , id:"Freeze time" ,  fn: (gameState) => logic.freezeTimeAbility(gameState)}, 
    {title:"التركيز" , image:"imgs/the focus.jpg" , description:"يعطل تأثيرات التحذير والنبض عند اقتراب انتهاء الوقت" , amount:3 , price:60 , id:"the focus" , fn: (gameState) => logic.foucsAbility(gameState)}, 
    {title:"البوصلة" , image:"imgs/compass.jpg" , description:"تشير إلى زوج من البطاقات المتطابقة بإطار متوهج لمدة ثانية واحدة  " , amount:2 , price:50 , id:"compass" , fn: (gameState) => logic.compassAbility(gameState)},
    {title:"سرعة البرق" , image:"imgs/lightning speed.jpg" , description:"تقوم بتسريع قلب الكروت لمدة 10 ثواني" , amount:3 , price:50 , id:"lightning speed" , fn: (gameState) => logic.lightningSpeedAbility(gameState)},
] ;

let allCards = [
    {amount:2 , image:"imgs/fire card.jpg" , type:"Fire"},
    {amount:2 , image:"imgs/water card.jpg" , type:"Water" },
    {amount:2 , image:"imgs/windy card.jpg" , type:"Windy"},
    {amount:2 , image:"imgs/earth.jpg" , type:"Earth"},
    {amount:2 , image:"imgs/ice card.jpg" , type:"Ice"},
    {amount:2 , image:"imgs/poison card.jpg" , type:"Poison"},
    {amount:2 , image:"imgs/light card.png" , type:"Light"},
    {amount:2 , image:"imgs/dark card.png" , type:"Dark"}
];

let levels = {
    easy:{title:"easy" , time:20 , timeBeforeFlip:3 , cardsNumbers:8 , cardsToMatch:4 , win:30 , lose:10 , dataAttr:"grid4*2"},
    middly:{title:"middly" ,time:25 , timeBeforeFlip:3 , cardsNumbers:12 , cardsToMatch:6 , win:50 , lose:15 , dataAttr:"grid6*2"},
    hard:{title:"hard" ,time:30 , timeBeforeFlip:3 , cardsNumbers:16 , cardsToMatch:8 , win:100 , lose:20 , dataAttr:"grid8*2"},
};

const gameState = {
    cardsNumbers: 0,
    matchedPairs: 0,
    cardsToMatch: 0,
    timeLeft: 0,
    timeBeforeStart: 0,
    winningReward: 0,
    loseReward: 0 ,
    stopTheGame:false,
    currentLevelName:"",
    currentLevel: null,
    roundCoins: 0 ,
    currentTimerId: null,
    equippedPowers:[] ,
    activePowers:{shieldReady: false,
        shieldUI: false,
        shieldUsed: false,
        falconEye: false,
        freezeTimeUsed:false,
        freezeTimeUi:false,
        foucs: false,
        lightningSpeedUsed:false,
        lightningSpeedUi:false,
        uiAbilites : false ,
    } ,
    canFlip:true ,
    canUsePower: true ,
};

let SelctionCards = [] ;

let mainScreen = document.querySelector(".main-screen");
let gameScreen = document.querySelector(".game-screen");



function handlePairSelection () {
    const SelctionCard = SelctionCards ;
    render.addBlockClickCards();
    logic.cardMatchingCheck(SelctionCard , gameState , leaderboard , levels);

    if (gameState.activePowers.lightningSpeedUsed) {
        setTimeout(() => {
            render.removeBlockClickCards();
        }, 200);
    }   else {
        setTimeout(() => {
            render.removeBlockClickCards();
        }, 700);
    }
}

function startTheGame (gameState) {
    render.renderGameScreen(gameState.currentLevelName);
    logic.randomCardSelection(allCards , gameState.cardsNumbers);
    render.renderChosedPowers(player , items);
    render.renderTimer(gameState.timeBeforeStart , false , gameState);
    logic.startTheTimer(gameState , false);
    render.addBlockClickPowers();
    render.addBlockClickCards();

        setTimeout(() => {
        render.removeBlockClickCards();
        render.removeBlockClickPowers();
        render.rotateAllCards();
        render.renderTimer(gameState.timeLeft , true , gameState);
        logic.startTheTimer(gameState , true );
    } , (gameState.timeBeforeStart * 1000));
}

function loadLevel (level) {
    gameState.cardsNumbers = level.cardsNumbers ;
    gameState.matchedPairs = 0;
    gameState.cardsToMatch = level.cardsToMatch ;
    gameState.timeLeft = level.time ;
    gameState.timeBeforeStart = level.timeBeforeFlip ;
    gameState.winningReward = level.win ;
    gameState.loseReward = level.lose ;
    gameState.stopTheGame = false ;
    gameState.currentLevelName = level.title;
}

function resetRoundAbilities () {
    gameState.activePowers.shieldReady = false
    gameState.activePowers.shieldUI = false
    gameState.activePowers.shieldUsed = false
    gameState.activePowers.falconEye = false
    gameState.activePowers.freezeTimeUsed = false
    gameState.activePowers.freezeTimeUi = false
    gameState.activePowers.foucs = false
    gameState.activePowers.lightningSpeedUsed = false
    gameState.activePowers.lightningSpeedUi = false
    render.resetRoundAbilitiesUi(gameState);
}

function choseLeaderboardlevel (e , gameState) {
    let allBtns = document.querySelectorAll(".btns li");
        
    allBtns.forEach((btn) => {
        btn.classList.remove("active");
    });

    e.target.classList.add("active");
    
    if (e.target.classList.contains("easy-level")) {
        render.renderLeaderboard(leaderboard , "easy");
    }   else if (e.target.classList.contains("middly-level")) {
        render.renderLeaderboard(leaderboard , "middly");
    }   else {
        render.renderLeaderboard(leaderboard , "hard");
    }
}

function gameSetup (e , gameState) {
    SelctionCards = [] ;
    let cardsSpace = document.querySelector(".cards-space");
    let timer = document.querySelector(".timer");

    resetRoundAbilities();

    if (!e.target.classList.contains("replay-btn")) {
        let selectedLevel = Object.keys(levels)
        .find((level) => e.target.classList.contains(level));
        
        if (selectedLevel) {
            selectedLevel = levels[selectedLevel] ;
            cardsSpace.dataset.status = selectedLevel.dataAttr ;
            render.renderTimer(levels.easy.timeBeforeFlip , false , gameState);
            loadLevel(selectedLevel);
            gameState.equippedPowers = player.equippedPowers;
            gameState.currentLevel = selectedLevel ;
            gameState.roundCoins = 0 ;
        }
    }   else {
        logic.syncEquippedPowers(player);
        cardsSpace.dataset.status = gameState.currentLevel.dataAttr ;
        loadLevel(gameState.currentLevel);    
    }
    gameState.equippedPowers.forEach((power) => {
        power.used = false ;
    });
    startTheGame(gameState);
}

function saveMoney (coins) {
    player.coins += Number(coins) ;
    localStorage.setItem("player" , JSON.stringify(player));
    render.renderCoins(logic.logicCalcCoins(player.coins));
}   


if (player.name != "") {
    gameScreen.classList.remove("none");
    render.renderUserName(player);  
    resetRoundAbilities();
    logic.syncEquippedPowers(player);
    saveMoney(gameState.roundCoins);
}   else {
    mainScreen.classList.remove("none");
}


const clicks = {
    "start-btn" : function (e , gameState) {
        let input = document.querySelector(".start-input");
        if (input.value !== "" && input.value.length !== 0) {
            player.name = input.value ;
            render.renderUserName(player);  
            render.renderDifficulteMenu();
            render.goToGameScreen();
            localStorage.setItem("player" , JSON.stringify(player));
        }   else {
            input.classList.add("error");
            this.setTimeout(() => {
                input.classList.remove("error");
            } , 300);
        }
    },

    "open-leaderboard" : function (e , gameStatee) {
        let allBtns = document.querySelectorAll(".btns li");
        
        allBtns.forEach((btn) => {
            btn.classList.remove("active");
        });

        allBtns[2].classList.add("active");

        let leaderboard2 = document.querySelector(".leaderboard");
        render.renderLeaderboard(leaderboard , "easy");
        render.openMenu(leaderboard2);
    },

    "close-leaderboard" : function (e , gameState) {
        let leaderboard = document.querySelector(".leaderboard");
        render.closeMenu(leaderboard);
    },

    "open-shop" : function (e , gameState) {
        let Shop = document.querySelector(".shop");
        render.renderShop(items , player);
        render.openMenu(Shop);
    },

    "close-shop" : function (e , gameState) {
        let Shop = document.querySelector(".shop");
        render.closeMenu(Shop);
    },

    "open-storage" : function (e , gameState) {
        let storage = document.querySelector(".storage");
        render.renderStorage(player , items);
        render.openMenu(storage);
    },

    "close-storage" : function (e , gameState) {
        let storage = document.querySelector(".storage");
        render.closeMenu(storage);
    },

    "home-btn" : function (e , gameState) {
        resetRoundAbilities();
        logic.syncEquippedPowers(player);
        saveMoney(gameState.roundCoins);
        render.returnToGamePage();
        render.renderDifficulteMenu();
    } ,

    "buy-btn" : function (e , gameState) {
        let card = e.target.closest(".card");
        if (card.dataset.status == "available") {
            playSound(sounds.buy);
            logic.buyItemLogic(card.dataset.title , card.dataset.price , player);
            render.renderCoins(logic.logicCalcCoins(player.coins));    
            e.target.closest(".card").dataset.status = "done";
        }
        setTimeout(() => {
            render.renderShop(items , player);
        } , 1000);
    },

    "use-btn" : function (e , gameState) {
        let card = e.target.closest(".card") ;
        let item = items.find((item) => {
            if (item.title === card.dataset.title) {
                return item ;
            }
        });
        logic.selectingAbilities(item , card , e.target , player);
    },

    "easy-level" : choseLeaderboardlevel,
    "middly-level" : choseLeaderboardlevel,
    "hard-level" : choseLeaderboardlevel,

    "front-img" : function (e , gameState) {
        playSound(sounds.click);
        let mainCard = e.target.closest(".card") ;
        mainCard.classList.remove("flipped");
        SelctionCards = [] ;
        render.rotateCard(e.target.closest(".card-body") , gameState);
    },

    //  كل شي الو علاقة بالريندر فوق و اللوجيك تحت الكومنت

    "back-img" : function(e , gameState) {
        playSound(sounds.click);
        let card = e.target.closest(".card");
        if (!e.target.closest(".card").classList.contains("flipped")) {
            if (!gameState.canFlip) return;
            card.classList.add("flipped");
            SelctionCards.unshift(e.target.closest(".card"));
            if (SelctionCards.length === 2) {
                gameState.canFlip = false ;
                handlePairSelection();
                SelctionCards = [] ;
            }
        }
        render.rotateCard(e.target.closest(".card-body") , gameState);
    },

    "easy" : gameSetup,
    "middly": gameSetup,
    "hard" : gameSetup,
    "replay-btn" : gameSetup,

    "power-img" : function (e , gameState) {
        if (!gameState.canUsePower) return;

        let elementPower = e.target.closest(".power-icon") ;
        let power = gameState.equippedPowers.find((power) => {
            if (power.id === e.target.closest(".power-icon").dataset.id) {
                return power ;
            }
        });

        if (!power.used) {
            elementPower.classList.add("used");
            let powerItem = items.find((item) => {
                if (power.id === item.id) {
                    return item ;
                }
            });

            powerItem.fn(gameState);
            power.used = true ;
            let playerItem = player.inventory.find((item) => {
                if (item.title === powerItem.title) {
                    return item ;
                }
            });
            playerItem.amount--;
            localStorage.setItem("player" , JSON.stringify(player));
        }   else {
            elementPower.classList.add("error");
            this.setTimeout(() => {
            elementPower.classList.remove("error");
            } , 300);
        }
    }
};

window.addEventListener("click" , function (e) {
    for (let className of e.target.classList) {
        if (clicks[className]) {
            clicks[className] (e , gameState) ;
            break ;
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (player.name != "") {
        let mainScreen = document.querySelector(".main-screen");
        let gameScreen = document.querySelector(".game-screen");

        mainScreen.classList.add("none");
        gameScreen.classList.remove("none");
        render.renderUserName(player);  
    }
    resetRoundAbilities();
    logic.syncEquippedPowers(player);
    saveMoney(gameState.roundCoins);
});
