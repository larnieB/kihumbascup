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
const pocketButtons = document.querySelectorAll(".pocket");
const stakeInput = document.getElementById("stake-input");
const quickStakeButtons = document.querySelectorAll(".quick-btn");
const placeBetBtn = document.getElementById("place-bet-btn");
const historyList = document.getElementById("history-list");

// --- Navbar, Mobile Menu & Auth Modal UI ---
const hamburgerBtn = document.getElementById("hamburger-btn");
const mobileMenu = document.getElementById("mobile-menu");
const profileMenuBtn = document.getElementById("profile-menu-btn");
const profileDropdownMenu = document.getElementById("profile-dropdown-menu");

const authModal = document.getElementById("auth-modal");
const closeAuthModal = document.getElementById("close-auth-modal");
const authTabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

// Toggle mobile hamburger menu
hamburgerBtn?.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Toggle desktop profile dropdown
profileMenuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  profileDropdownMenu.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  profileDropdownMenu?.classList.add("hidden");
});

// Helper to open modal on either 'login' or 'signup' tab
function openAuthModal(defaultTab = "login") {
  mobileMenu.classList.add("hidden");
  authModal.classList.remove("hidden");
  switchAuthTab(defaultTab);
}

function switchAuthTab(tabName) {
  authTabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === tabName));
  loginForm.classList.toggle("hidden", tabName !== "login");
  signupForm.classList.toggle("hidden", tabName !== "signup");
}

// Wire up all Login / Sign Up triggers (desktop + mobile)
document.getElementById("open-login-btn")?.addEventListener("click", () => openAuthModal("login"));
document.getElementById("mobile-login-btn")?.addEventListener("click", () => openAuthModal("login"));
document.getElementById("open-signup-btn")?.addEventListener("click", () => openAuthModal("signup"));
document.getElementById("mobile-signup-btn")?.addEventListener("click", () => openAuthModal("signup"));

closeAuthModal?.addEventListener("click", () => authModal.classList.add("hidden"));
authModal?.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.classList.add("hidden");
});

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchAuthTab(tab.dataset.tab));
});

// --- Authentication State & API Handlers ---
let currentUser = null;

function setAuthState(user) {
  currentUser = user;
  const isLoggedIn = Boolean(user);

  document.getElementById("guest-controls")?.classList.toggle("hidden", isLoggedIn);
  document.getElementById("mobile-guest-links")?.classList.toggle("hidden", isLoggedIn);
  document.getElementById("user-controls")?.classList.toggle("hidden", !isLoggedIn);
  document.getElementById("mobile-user-links")?.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    document.getElementById("nav-username").textContent = user.username;
    document.getElementById("user-avatar").textContent = user.username.charAt(0).toUpperCase();
    document.getElementById("wallet-balance").textContent = `$${parseFloat(user.balance).toFixed(2)}`;
  }
}

// Check active session when page loads
fetch("check_session.php")
  .then((res) => res.json())
  .then((data) => {
    if (data.status === "success") setAuthState(data.user);
  });

// Handle Sign Up Submit
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("signup-error");
  errorEl.classList.add("hidden");

  const payload = {
    username: document.getElementById("signup-username").value.trim(),
    phoneNumber: document.getElementById("signup-phone").value.trim(),
    email: document.getElementById("signup-email").value.trim(),
    password: document.getElementById("signup-password").value
  };

  const res = await fetch("register.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();

  if (data.status === "success") {
    setAuthState(data.user);
    authModal.classList.add("hidden");
    signupForm.reset();
  } else {
    errorEl.textContent = data.message || "Sign up failed.";
    errorEl.classList.remove("hidden");
  }
});

// Handle Log In Submit
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("login-error");
  errorEl.classList.add("hidden");

  const payload = {
    identifier: document.getElementById("login-email").value.trim(),
    password: document.getElementById("login-password").value
  };

  const res = await fetch("login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();

  if (data.status === "success") {
    setAuthState(data.user);
    authModal.classList.add("hidden");
    loginForm.reset();
  } else {
    errorEl.textContent = data.message || "Invalid credentials.";
    errorEl.classList.remove("hidden");
  }
});

// Handle Log Out (Desktop + Mobile)
async function handleLogout() {
  await fetch("logout.php");
  setAuthState(null);
  mobileMenu?.classList.add("hidden");
}

document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
document.getElementById("mobile-logout-btn")?.addEventListener("click", handleLogout);



// 1. Dynamic Player Fetch + Click Listener Fix
document.addEventListener('DOMContentLoaded', () => {
  const playerOptionsContainer = document.getElementById('player-options');

  fetch('get_active_game.php')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success' && data.noOfPlayers > 0) {
        playerOptionsContainer.innerHTML = '';
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

          // Attach click listener directly when creating the button
          btn.addEventListener('click', () => {
            // Allow toggling off if clicked again
            if (btn.classList.contains('selected')) {
              btn.classList.remove('selected');
              state.player = null;
              state.playerOdds = 0;
            } else {
              document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
              state.player = btn.dataset.player;
              state.playerOdds = parseFloat(btn.dataset.odds);
            }
            updateBetSlip();
          });

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

    // Replace the old listener with this toggleable version:
    btn.addEventListener("click", () => {
      if (btn.classList.contains("selected")) {
        btn.classList.remove("selected");
        state.ball = null;
        state.ballOdds = 0;
      } else {
        document.querySelectorAll(".ball-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        state.ball = `Ball #${ball.number} (${ball.type})`;
        state.ballOdds = ball.odds;
      }
      updateBetSlip();
    });

    ballGrid.appendChild(btn);
  });
}




// 2. Pocket Selection Listeners (also allows toggling off)
pocketButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("selected")) {
      btn.classList.remove("selected");
      state.pocket = null;
      state.pocketOdds = 0;
    } else {
      pocketButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.pocket = btn.dataset.pocket;
      state.pocketOdds = parseFloat(btn.dataset.odds);
    }
    updateBetSlip();
  });
});

// 3. Helper to calculate combined odds safely when some options are null
function getCombinedOdds() {
  const pOdds = state.player ? state.playerOdds : 1;
  const bOdds = state.ball ? state.ballOdds : 1;
  const kOdds = state.pocket ? state.pocketOdds : 1;
  return pOdds * bOdds * kOdds;
}

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

// 4. Update Bet Slip Summary & Odds Calculation
function updateBetSlip() {
  document.getElementById("summary-player").textContent = state.player || "Any Player";
  document.getElementById("summary-ball").textContent = state.ball || "Any Ball";
  document.getElementById("summary-pocket").textContent = state.pocket || "Any Pocket";

  // Require at least a Player OR a Pocket, plus a valid stake
  const hasSelection = Boolean(state.player || state.pocket);
  const isComplete = hasSelection && state.stake > 0;

  if (hasSelection) {
    const combinedOdds = getCombinedOdds();
    const payout = combinedOdds * state.stake;

    document.getElementById("summary-odds").textContent = `${combinedOdds.toFixed(2)}x`;
    document.getElementById("potential-payout").textContent = `$${payout.toFixed(2)}`;
  } else {
    document.getElementById("summary-odds").textContent = "0.00x";
    document.getElementById("potential-payout").textContent = "$0.00";
  }

  placeBetBtn.disabled = !isComplete;
  placeBetBtn.textContent = isComplete ? "Place Prop Bet" : "Select a Player or Pocket";
}

// 5. Handle Bet Placement
placeBetBtn.addEventListener("click", async () => {
  // 1. Require login
  if (!currentUser) {
    openAuthModal("login");
    return;
  }

  // 2. Check wallet balance
  const currentBalance = parseFloat(currentUser.balance);
  if (state.stake > currentBalance) {
    alert("Insufficient wallet balance. Please deposit funds first.");
    return;
  }

  const combinedOdds = parseFloat(getCombinedOdds().toFixed(2));
  const payout = parseFloat((combinedOdds * state.stake).toFixed(2));

  const payload = {
    player: state.player || "Any Player",
    ball: state.ball || "Any Ball",
    pocket: state.pocket || "Any Pocket",
    odds: combinedOdds,
    stake: state.stake,
    potentialPayout: payout
  };

  placeBetBtn.disabled = true;
  placeBetBtn.textContent = "Placing Bet...";

  try {
    const res = await fetch("place_bet.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === "success") {
      // 3. Update balance in memory and navbar
      currentUser.balance = data.newBalance;
      document.getElementById("wallet-balance").textContent = `$${parseFloat(data.newBalance).toFixed(2)}`;

      // 4. Add to Active Bets list
      const li = document.createElement("li");
      li.className = "history-item";
      li.innerHTML = `
        <strong>${payload.player}</strong> to pot <strong>${payload.ball}</strong> in <strong>${payload.pocket}</strong><br/>
        Stake: $${payload.stake.toFixed(2)} @ ${combinedOdds.toFixed(2)}x → <strong>Win $${payout.toFixed(2)}</strong>
      `;
      historyList.prepend(li);

      // 5. Reset selections
      state.player = null;
      state.playerOdds = 0;
      state.ball = null;
      state.ballOdds = 0;
      state.pocket = null;
      state.pocketOdds = 0;
      document.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
    } else {
      alert(data.message || "Could not place bet.");
    }
  } catch (err) {
    console.error("Bet error:", err);
    alert("Network error placing bet.");
  } finally {
    updateBetSlip();
  }
});


// Initialize
renderBalls();
