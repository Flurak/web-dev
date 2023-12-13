let gameLoopId;

// Creating custom event emitter
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  // Add a listener
  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }
  // Emit the message
  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload));
    }
  }
  // Clear all listeners
  clear() {
    this.listeners = {};
  }
}
// Base class for the game objects
class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = "";
    this.width = 0;
    this.height = 0;
    this.img = undefined;
  }
  // Draw the game objects to the canvas
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
  // Create a rectangle representing the position and size of the game object
  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width,
    };
  }
}
// Hero GameObject
class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 99), (this.height = 75);
    this.type = "Hero";
    this.speed = { x: 0, y: 0 };
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
  }
  // Fire a laser from the ship
  fire() {
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    this.cooldown = 500;

    let id = setInterval(() => {
      if (this.cooldown > 0) {
        this.cooldown -= 100;
        if (this.cooldown === 0) {
          clearInterval(id);
        }
      }
    }, 200);
  }
  // Check cooldown if the hero can fire again
  canFire() {
    return this.cooldown === 0;
  }

  //Decrease the player's life
  decrementLife() {
    this.life--;
    if (this.life === 0) {
      this.dead = true;
    }
  }
  // Increase points
  incrementPoints() {
    this.points += 100;
  }
}

// Enemy GameObject
class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 98), (this.height = 50);
    this.type = "Enemy";
    // Moves the enemy down the screen
    let id = setInterval(() => {
      if (this.y < canvas.height - this.height) {
        this.y += 5;
      } else {
        console.log("Stopped at", this.y);
        clearInterval(id);
      }
    }, 300);
  }
}

// Laser GameObject

class Laser extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 9), (this.height = 33);
    this.type = "Laser";
    this.img = laserImg;
    // Moves the laser upwards
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100);
  }
}

// Function to asynchronously load images
function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}
// Checking for collision
function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

// Constants for different messages
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};
// Setting Global Variables
let heroImg,
  enemyImg,
  laserImg,
  lifeImg,
  canvas,
  ctx,
  gameObjects = [],
  hero,
  eventEmitter = new EventEmitter();

// EVENTS
let onKeyDown = function (e) {
  // console.log(e.keyCode);
  switch (e.keyCode) {
    case 37:
    case 39:
    case 38:
    case 40: // Arrow keys
    case 32:
      e.preventDefault();
      break; // Space
    default:
      break; // do not block other keys
  }
};

window.addEventListener("keydown", onKeyDown);

// Emits message on keyboard input events
window.addEventListener("keyup", (evt) => {
  // Checks which key is pressed and emits the right message
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if (evt.keyCode === 32) {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
  } else if (evt.key === "Enter") {
    eventEmitter.emit(Messages.KEY_EVENT_ENTER);
  }
});
// Function to create a group of enemies
function createEnemies() {
  // defining the total and size of the enemies
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  // Calculate the coordinates for the enemy formation
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;
  // Loop to create the row of enemies
  for (let x = START_X; x < STOP_X; x += 98) {
    // Another loop to create multiple rows
    for (let y = 0; y < 50 * 5; y += 50) {
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg;
      // Add the enemies to the gameObjects array
      gameObjects.push(enemy);
    }
  }
}

// Function to create the player ship
function createHero() {
  // Defines where to create the hero on the canvas
  hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
  hero.img = heroImg;
  // add the hero to the gameObjects array
  gameObjects.push(hero);
}

// Function to handle collisions
function updateGameObjects() {
  // separating the gameObjects array based on the object type
  const enemies = gameObjects.filter((go) => go.type === "Enemy");
  const lasers = gameObjects.filter((go) => go.type === "Laser");

  // Check for collision between the ship and enemies
  enemies.forEach((enemy) => {
    const heroRect = hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  });
  // Check for collision between the laser and enemies
  lasers.forEach((l) => {
    enemies.forEach((m) => {
      if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: l,
          second: m,
        });
      }
    });
  });
  // Remove dead gameObjects from the array
  gameObjects = gameObjects.filter((go) => !go.dead);
}

function drawGameObjects(ctx) {
  gameObjects.forEach((go) => go.draw(ctx));
}

// Initializing the game
function initGame() {
  // Clear the gameObjects array
  gameObjects = [];
  // Create enemy and hero objects
  createEnemies();
  createHero();
  // Set up event listeners for key events
  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 20;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 20;
  });

  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    // Fire a laser if the player can
    if (hero.canFire()) {
      hero.fire();
    }
    // console.log('cant fire - cooling down')
  });

  eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
    // Emitter to reset the game when 'Enter' is pressed
    resetGame();
  });
  // Collision event handlers
  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    hero.incrementPoints();
    // Victory condition
    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });
  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    // Handle collision between enemy and hero
    enemy.dead = true;
    hero.decrementLife();
    // Lose condition
    if (isHeroDead()) {
      eventEmitter.emit(Messages.GAME_END_LOSS);
      return; // loss before victory
    }
    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });
  // Set up the game ending
  eventEmitter.on(Messages.GAME_END_WIN, () => {
    // Victory game end
    endGame(true);
  });

  eventEmitter.on(Messages.GAME_END_LOSS, () => {
    // Loss game end
    endGame(false);
  });
}
// Function to end the game
function endGame(win) {
  clearInterval(gameLoopId);

  // set delay so we are sure any paints have finished
  setTimeout(() => {
    // Clear the canvas and fill it with a black background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (win) {
      // Message to display after  victory
      displayMessage(
        "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
        "green"
      );
    } else {
      // Message to display after  loss
      displayMessage(
        "You died !!! Press [Enter] to start a new game Captain Pew Pew"
      );
    }
  }, 200);
}
// Function to check if the player has died
function isHeroDead() {
  return hero.life <= 0;
}

// Function to check if all enemies are dead
function isEnemiesDead() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
}

// Function to daw the remaining life of the player
function drawLife() {
  // TODO, 35, 27
  //

  const START_POS = canvas.width - 180;
  for (let i = 0; i < hero.life; i++) {
    ctx.drawImage(lifeImg, START_POS + 45 * (i + 1), canvas.height - 37);
  }
}

// Function to draw the points of the ship
function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("Points: " + hero.points, 10, canvas.height - 20);
}

// Function to display a message
function displayMessage(message, color = "red") {
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// Function to reset the game
function resetGame() {
  if (gameLoopId) {
    clearInterval(gameLoopId);
    eventEmitter.clear();
    initGame();
    // Start a new game loop
    gameLoopId = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawPoints();
      drawLife();
      updateGameObjects();
      drawGameObjects(ctx);
    }, 100);
  }
}
// Function to draw text on the canvas
function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}
// Event handler for when the window is fully loaded
window.onload = async () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  // Load textures (images) asynchronously
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");
  laserImg = await loadTexture("assets/laserRed.png");
  lifeImg = await loadTexture("assets/life.png");

  // Initialize the game and start the game loop
  initGame();
  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPoints();
    drawLife();
    updateGameObjects();
    drawGameObjects(ctx);
  }, 100);
};
