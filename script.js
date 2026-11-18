// Standard 8-Ball colors and sample odds multipliers
const BALLS = [
  { number: 1, color: "#eab308", type: "Solid", odds: 1.5 },
  { number: 2, color: "#2563eb", type: "Solid", odds: 1.5 },
  { number: 3, color: "#dc2626", type: "Solid", odds: 1.6 },
  { number: 4, color: "#7e22ce", type: "Solid", odds: 1.6 },
  { number: 5, color: "#ea580c", type: "Solid", odds: 1.7 },
  { number: 6, color: "#16a34a", type: "Solid", odds: 1.7 },
  { number: 7, color: "#7f1d1d", type: "Solid", odds: 1.8 },
  { number: 8, color: "#171717", type: "8-Ball", odds: 2.4 },
  { number: 9, color: "#eab308", type: "Stripe", odds: 1.5 },
  { number: 10, color: "#2563eb", type: "Stripe", odds: 1.5 },
  { number: 11, color: "#dc2626", type: "Stripe", odds: 1.6 },
  { number: 12, color: "#7e22ce", type: "Stripe", odds: 1.6 },
  { number: 13, color: "#ea580c", type: "Stripe", odds: 1.7 },
  { number: 14, color: "#16a34a", type: "Stripe", odds: 1.7 },
  { number: 15, color: "#7f1d1d", type: "Stripe", odds: 1.8 }
];

// Application state
const state = {
  player: null,
  playerOdds: 0,
  ball: null,
  ballOdds: 0,
  pocket: null,
  pocketOdds: 0,
  stake: 10
};

// DOM Elements
const ballGrid = document.getElementById("ball-grid");
const playerButtons = document.querySelectorAll(".player-btn");
const pocketButtons = document.querySelectorAll(".pocket");
const stakeInput = document.getElementById("stake-input");
const quickStakeButtons = document.querySelectorAll(".quick-btn");
const placeBetBtn = document.getElementById("place-bet-btn");
const historyList = document.getElementById("history-list");

document.addEventListener('DOMContentLoaded', () => {
    const playerOptionsContainer = document.getElementById('player-options');

    fetch('get_active_game.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.noOfPlayers > 0) {
                playerOptionsContainer.innerHTML = ''; // Clear container

                // Optional: Calculate balanced default odds based on player count
                const defaultOdds = (data.noOfPlayers * 0.90).toFixed(2);

                for (let i = 1; i <= data.noOfPlayers; i++) {
                    const playerName = `Player ${i}`;
                    
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'player-btn';
                    btn.dataset.player = playerName;
                    btn.dataset.odds = defaultOdds;

                    btn.innerHTML = `
                        <span class="player-name">${playerName}</span>
                        <span class="odds-badge">${defaultOdds}x</span>
                    `;

                    playerOptionsContainer.appendChild(btn);
                }
            } else {
                playerOptionsContainer.innerHTML = '<p>No active game right now.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching active game:', error);
            playerOptionsContainer.innerHTML = '<p>Failed to load players.</p>';
        });
});

// 1. Render Balls 1-15
function renderBalls() {
  BALLS.forEach((ball) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ball-btn";
    btn.dataset.number = ball.number;

    const isStriped = ball.number >= 9;
    const graphicClass = isStriped ? "ball-graphic striped" : "ball-graphic";
    const graphicStyle = isStriped
      ? `--stripe-color: ${ball.color};`
      : `background-color: ${ball.color};`;

    btn.innerHTML = `
      <div class="${graphicClass}" style="${graphicStyle}">
        <span class="ball-number">${ball.number}</span>
      </div>
      <span class="ball-odds">${ball.odds.toFixed(1)}x</span>
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".ball-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.ball = `Ball #${ball.number} (${ball.type})`;
      state.ballOdds = ball.odds;
      updateBetSlip();
    });

    ballGrid.appendChild(btn);
  });
}

// 2. Player Selection Listeners
playerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    playerButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.player = btn.dataset.player;
    state.playerOdds = parseFloat(btn.dataset.odds);
    updateBetSlip();
  });
});

// 3. Pocket Selection Listeners
pocketButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    pocketButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.pocket = btn.dataset.pocket;
    state.pocketOdds = parseFloat(btn.dataset.odds);
    updateBetSlip();
  });
});

// 4. Stake Input & Quick Buttons
stakeInput.addEventListener("input", (e) => {
  state.stake = parseFloat(e.target.value) || 0;
  updateBetSlip();
});

quickStakeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const amount = parseFloat(btn.dataset.amount);
    stakeInput.value = amount;
    state.stake = amount;
    updateBetSlip();
  });
});

// 5. Update Bet Slip Summary & Odds Calculation
function updateBetSlip() {
  document.getElementById("summary-player").textContent = state.player || "Not selected";
  document.getElementById("summary-ball").textContent = state.ball || "Not selected";
  document.getElementById("summary-pocket").textContent = state.pocket || "Not selected";

  const isComplete = state.player && state.ball && state.pocket && state.stake > 0;

  if (state.player && state.ball && state.pocket) {
    const combinedOdds = state.playerOdds * state.ballOdds * state.pocketOdds;
    const payout = combinedOdds * state.stake;

    document.getElementById("summary-odds").textContent = `${combinedOdds.toFixed(2)}x`;
    document.getElementById("potential-payout").textContent = `$${payout.toFixed(2)}`;
  } else {
    document.getElementById("summary-odds").textContent = "0.00x";
    document.getElementById("potential-payout").textContent = "$0.00";
  }

  placeBetBtn.disabled = !isComplete;
  placeBetBtn.textContent = isComplete ? "Place Prop Bet" : "Complete Selections to Bet";
}

// 6. Handle Bet Placement
placeBetBtn.addEventListener("click", () => {
  const combinedOdds = (state.playerOdds * state.ballOdds * state.pocketOdds).toFixed(2);
  const payout = (combinedOdds * state.stake).toFixed(2);

  const li = document.createElement("li");
  li.className = "history-item";
  li.innerHTML = `
    <strong>${state.player}</strong> to pot <strong>${state.ball}</strong> in <strong>${state.pocket}</strong><br/>
    Stake: $${state.stake.toFixed(2)} @ ${combinedOdds}x → <strong>Win $${payout}</strong>
  `;

  historyList.prepend(li);

  // Reset selections for next bet
  state.player = null;
  state.ball = null;
  state.pocket = null;
  document.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
  updateBetSlip();
});

// Initialize
renderBalls();
