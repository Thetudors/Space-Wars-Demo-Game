//Aliases
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle;

//Create a Pixi Application
let app = new Application({
    backgroundColor: 0x1099bb,
    resolution: 1
}
);
//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loader
    .add("images/player.png")
    .add("images/bullet.png")
    .add("images/enemy.png")
    .add("images/bullet2.png")
    .add("images/star.png")
    .add("images/planet.png")
    .add("images/retry.png")
    .load(setup);


const scoreStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 28,
    fill: "white",
    stroke: '#ff3300',
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
});
const messageStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 40,
    fill: "white",
    stroke: '#ff3300',
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
});

//Define any variables that are used in more than one function
let enemy;
let player;
let playerLife = 3;
let bullet;
let bullet2;
let star;
let planet;
let shootSound;
var gameMusic;
var loseSound;
let explosionSound;
let isEnemyShot = false;
let playerScore = 0;
let scoreText;
let highScore = 0;
let highScoreText;
let time = 120;
let timeText;
let gameMessage;
let isGameFinish = false;
let retryButton;
let playerUp = false;
let playerDown = false;
let starsVy = 0;
var intervalEnemySpawner;
var intervalEnemyShoot;
var intervalGameControl;
var bullets = [];
var bulletSpeed = 5;
var bullets2 = [];
var bullet2Speed = 5;
var playerLifes = [];
var enemys = [];
var enemySpeed = 2;
var stars = [];
app.stage.interactive = true;


let left = keyboard("ArrowLeft"),
    right = keyboard("ArrowRight"),
    up = keyboard("ArrowUp"),
    down = keyboard("ArrowDown");

function winGame() {
    clearInterval(intervalEnemyShoot);
    clearInterval(intervalEnemySpawner);
    clearInterval(intervalGameControl);
    gameMessage.text = "Win !";
    app.stage.addChild(gameMessage);
    app.stage.addChild(retryButton);
    victorySound.play();
    gameMusic.stop();
    app.ticker.stop();

}

function startIntervals() {
    intervalEnemySpawner = setInterval(enemySpawner, 1000);
    intervalEnemyShoot = setInterval(enemyShootSpawner, 2000);

    intervalGameControl = setInterval(() => {
        time--;
        if (time % 60 < 10) {
            timeText.text = Math.floor(time / 60) + ":0" + time % 60;
        } else {
            timeText.text = Math.floor(time / 60) + ":" + time % 60;
        }

        if (time < 0) {
            isGameFinish = true;
            if (playerLife >= 0) {

                if (playerScore > highScore) {
                    setCookie("highscore", playerScore, 2);
                    highScoreText.text = "High Score : " + getCookie("highscore");
                    console.log("New High Score")
                }
            }

        }


    }, 1000);
}
function setup() {
    startIntervals();


    //Game Music
    gameMusic = new Howl({
        src: ['sounds/Epic_End.mp3'],
        autoplay: true,
        loop: true,
        volume: 0.5
    });
    gameMusic.play();


    //Sounds---------------
    shootSound = new Howl({
        src: ['sounds/shoot.mp3']
    });

    victorySound = new Howl({
        src: ['sounds/Victory_Tune.mp3']
    });

    explosionSound = new Howl({
        src: ['sounds/explosion.mp3']
    });
    loseSound = new Howl({
        src: ['sounds/lose.mp3']
    });



    player = new Sprite(resources["images/player.png"].texture);
    player.anchor.x = 0.5;
    player.anchor.y = 0.5;
    player.scale.x = 0.1;
    player.scale.y = 0.1;
    player.vx = 5;

    enemy = new Sprite(resources["images/enemy.png"].texture);
    // move the sprite to the center of the screen
    player.position.x = app.renderer.width / 2;
    player.position.y = 500;

    var background = new PIXI.Graphics();
    background.beginFill(0x000000);
    background.drawRect(0, 0, 800, 600);
    background.endFill();
    app.stage.addChild(background);

    scoreText = new PIXI.Text("Score : 0", scoreStyle);
    scoreText.position.x = 650;
    app.stage.addChild(scoreText);

    highScoreText = new PIXI.Text("High Score : 0", scoreStyle);
    highScoreText.position.x = 585;
    highScoreText.position.y = 50;
    app.stage.addChild(highScoreText);

    timeText = new PIXI.Text("0:00", scoreStyle);
    timeText.position.x = 725;
    timeText.position.y = 550;
    app.stage.addChild(timeText);

    gameMessage = new PIXI.Text("Game Over", messageStyle);
    gameMessage.position.x = app.renderer.height / 2;
    gameMessage.position.y = app.renderer.height / 2;

    retryButton = new PIXI.Sprite(resources["images/retry.png"].texture);
    retryButton.scale.x = 0.5;
    retryButton.scale.y = 0.5;
    retryButton.position.x = app.renderer.height / 2;
    retryButton.position.y = (app.renderer.height / 2) + 50;
    retryButton.buttonMode = true;
    retryButton.interactive = true;
    retryButton.on('pointerdown', onButtonDown);


    planet = new Sprite(resources["images/planet.png"].texture);
    planet.position.x = 500;
    planet.position.y = app.renderer.height / 2;
    planet.scale.x = 0.01;
    planet.scale.y = 0.01;
    app.stage.addChild(planet);

    app.stage.addChild(player);
    enemySpawner();
    enemySpawner();
    enemySpawner();
    starsInit();
    playerLifeInit();

    if (checkCookie()) {
        highScoreText.text = "High Score : " + getCookie("highscore");
        highScore = getCookie("highscore");
    }

    bullet = new Sprite(resources["images/bullet.png"].texture);

    app.ticker.add(delta => gameLoop(delta));


}
function starsInit() {
    for (var i = 0; i <= 50; i++) {
        let star = new Sprite(resources["images/star.png"].texture);
        let randomX = randomInt(10, 790);
        let randomY = randomInt(10, 590);
        star.position.x = randomX;
        star.position.y = randomY;
        star.scale.x = 0.1;
        star.scale.y = 0.1;
        stars.push(star);
        app.stage.addChild(star);
    }
}

//Retry Button
function onButtonDown() {
    location.reload();

}



app.stage.on("mousedown", function (e) {
    shoot(player.rotation, {
        x: player.position.x,
        y: player.position.y
    });
})



function playerLifeInit() {

    //Player Life Init
    for (var i = 0; i < playerLife; i++) {
        let lifeImage = new Sprite(resources["images/player.png"].texture);
        lifeImage.position.x = 40 * (i + 0.5);
        lifeImage.position.y = 25;
        lifeImage.scale.x = 0.09;
        lifeImage.scale.y = 0.09;
        app.stage.addChild(lifeImage);
        playerLifes.push(lifeImage);
    }
}

function playerLoseLife() {
    playerLife--;
    app.stage.removeChild(playerLifes.pop());
    if (playerLife < 0) {
        app.ticker.stop();
        clearInterval(intervalEnemyShoot);
        clearInterval(intervalEnemySpawner);
        clearInterval(intervalGameControl);
        gameMusic.stop();
        loseSound.play();
        app.stage.addChild(gameMessage);
        app.stage.addChild(retryButton);
    }
}

function ScoreUpdate() {
    playerScore++;
    scoreText.text = "Score : " + playerScore;

}


function enemySpawner() {
    let newEnemy = new Sprite(resources["images/enemy.png"].texture);
    let randomX = randomInt(100, 700);
    newEnemy.position.x = randomX;
    newEnemy.position.y = 100;
    newEnemy.scale.x = 0.2;
    newEnemy.scale.y = -0.2;
    enemys.push(newEnemy);
    app.stage.addChild(newEnemy);

}

function enemyShootSpawner() {
    for (var e = enemys.length - 1; e >= 0; e--) {

        enemyShoot(enemys[e]);
    }
}

function enemyShoot(tempEnemy) {
    var bullet2 = new Sprite(resources["images/bullet2.png"].texture);
    bullet2.position.x = tempEnemy.position.x;
    bullet2.position.y = tempEnemy.position.y;
    bullet2.scale.x = 0.1;
    bullet2.scale.y = -0.1;
    app.stage.addChild(bullet2);
    bullets2.push(bullet2);


}

function shoot(rotation, startPosition) {
    var bullet = new Sprite(resources["images/bullet.png"].texture);
    bullet.position.x = startPosition.x - 10;
    bullet.position.y = startPosition.y - 50;
    bullet.scale.x = 0.1;
    bullet.scale.y = 0.1;
    bullet.rotation = 0;
    shootSound.play();
    app.stage.addChild(bullet);
    bullets.push(bullet);
}

function collisionEnemy() {
    for (var e = enemys.length - 1; e >= 0; e--) {
        for (var b = bullets.length - 1; b >= 0; b--) {
            if (hitTestRectangle(enemys[e], bullets[b])) {
                console.log("Hit");
                app.stage.removeChild(enemys[e]);
                app.stage.removeChild(bullets[b]);
                isEnemyShot = true;
                explosionSound.play();
                remove(bullets, bullets[b]);
                ScoreUpdate();

                continue;
            }
        }
        if (isEnemyShot === true) {
            remove(enemys, enemys[e]);

            isEnemyShot = false;

            continue;
        }
    }
}

function collisionPlayer() {
    for (var b2 = bullets2.length - 1; b2 >= 0; b2--) {
        if (hitTestRectangle(player, bullets2[b2])) {
            app.stage.removeChild(bullets2[b2]);
            remove(bullets2, bullets2[b2]);
            playerLoseLife();
            continue;
        }
    }
}

function playerControl() {
    if (left.isDown) {
        if (player.position.x < 50) {
            console.log("Ekranın Dışında");
        } else {
            player.x -= player.vx;
        }
    }

    if (right.isDown) {
        if (player.position.x > app.renderer.width - 50) {
            console.log("Ekranın Dışında");
        } else {
            player.x += player.vx;
        }
    }
    if (up.isDown) {
        starsVy = 0.5;
        if (player.position.y < 50) {
            console.log("Ekranın Dışında");
        } else {
            player.y -= player.vx;
        }

    }
    if (down.isDown) {
        starsVy = -0.5;
        if (player.position.y > app.renderer.height - 50) {
            console.log("Ekranın Dışında");
        } else {
            player.y += player.vx;
        }
    }
}

function gameLoop(delta) {

    playerControl();

    if (isGameFinish) {
        isGameFinish = false;
        winGame();
    }

    for (var e = enemys.length - 1; e >= 0; e--) {

        enemys[e].position.y += 1 * enemySpeed;
    }
    for (var b = bullets.length - 1; b >= 0; b--) {
        bullets[b].position.y -= 1 * bulletSpeed;
    }
    for (var b2 = bullets2.length - 1; b2 >= 0; b2--) {
        bullets2[b2].position.y += 1 * bullet2Speed;
    }
    for (var s = stars.length - 1; s >= 0; s--) {
        if (up.isDown || down.isDown) {
            stars[s].position.y += starsVy;
        }
        if (stars[s].position.y > 600) {
            stars[s].position.y = 0;
        }
    }
    collisionEnemy();
    collisionPlayer();
}


//Helper Function-------------------------------------

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var cont = getCookie("highscore");
    if (cont != "") {
        return true;
    } else {
        return false;
    }
}
//Keyboard Events
function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}

//Random Number Generator
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//Collision Control
function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
}

//Remove Element
function remove(array, element) {
    const index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}