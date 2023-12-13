// game.js

let heroHealth = 10;
let orcHealth = 8;
let heroGold = 0;
let isGameOver = false;

function startGame() {
  // Reset game state
  heroHealth = 10;
  orcHealth = 8;
  // Do not reset heroGold to carry it over between matches
  isGameOver = false;

  // Display initial message
  displayResult("A wild orc appears!");

  // Enable attack buttons
  const swordButton = createAttackButton("Sword", 3);
  const kickButton = createAttackButton("Kick", 1);

  document.body.appendChild(swordButton);
  document.body.appendChild(kickButton);

  // Display hero's initial status
  displayHeroStatus();
}

function createAttackButton(attackName, damage) {
  const button = document.createElement("button");
  button.textContent = attackName;
  button.onclick = () => {
    if (!isGameOver) {
      heroAttack(damage);
      orcAttack();
      checkGameStatus();
    }
  };

  return button;
}

function heroAttack(damage) {
  orcHealth -= damage;

  displayResult(
    `You use ${
      damage === 3 ? "Sword" : "Kick"
    } and deal ${damage} damage! Orc's health: ${orcHealth}`
  );
}

function orcAttack() {
  if (orcHealth > 0) {
    const orcDamage = 2;
    heroHealth -= orcDamage;
  }
}

function checkGameStatus() {
  if (heroHealth <= 0) {
    endGame("Game Over! The orc defeats you.");
  } else if (orcHealth <= 0) {
    heroGold += 2;
    endGame("Congratulations! You defeat the orc and earned 2 gold!");
  }
}

function endGame(message) {
  isGameOver = true;
  displayResult(message);

  // Remove attack buttons
  const swordButton = document.querySelector("button:nth-of-type(2)");
  const kickButton = document.querySelector("button:nth-of-type(3)");
  if (swordButton) {
    swordButton.remove();
  }
  if (kickButton) {
    kickButton.remove();
  }
}

function displayResult(message) {
  const resultElement = document.getElementById("result");
  resultElement.textContent = message;
}

function displayHeroStatus() {
  const heroStatusElement = document.getElementById("heroStatus");
  heroStatusElement.textContent = `Hero's Health: ${heroHealth} | Gold: ${heroGold}`;
}
