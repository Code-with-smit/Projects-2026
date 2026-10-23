/* =========================================================
   CIPHER — Password Generator
   Vanilla JS only. No frameworks, no dependencies.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     Character sets
     --------------------------------------------------------- */
  const CHAR_SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*",
  };

  /* ---------------------------------------------------------
     DOM references
     --------------------------------------------------------- */
  const lengthSlider = document.getElementById("length-slider");
  const lengthValue = document.getElementById("length-value");

  const optUpper = document.getElementById("opt-upper");
  const optLower = document.getElementById("opt-lower");
  const optNumbers = document.getElementById("opt-numbers");
  const optSymbols = document.getElementById("opt-symbols");

  const generateBtn = document.getElementById("generate-btn");
  const passwordOutput = document.getElementById("password-output");
  const copyBtn = document.getElementById("copy-btn");
  const copyToast = document.getElementById("copy-toast");

  const warningMsg = document.getElementById("warning-msg");

  const strengthFill = document.getElementById("strength-fill");
  const strengthLabel = document.getElementById("strength-label");
  const entropyLabel = document.getElementById("entropy-label");

  const historyList = document.getElementById("history-list");
  const historyCount = document.getElementById("history-count");

  /* In-memory history (last 5). Not persisted — keeps generated
     secrets out of localStorage. */
  const history = [];
  const HISTORY_LIMIT = 5;

  let currentPassword = "";

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */

  // Cryptographically strong random integer in [0, max)
  function secureRandomInt(max) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return buffer[0] % max;
  }

  function getActiveCharset() {
    let pool = "";
    if (optUpper.checked) pool += CHAR_SETS.upper;
    if (optLower.checked) pool += CHAR_SETS.lower;
    if (optNumbers.checked) pool += CHAR_SETS.numbers;
    if (optSymbols.checked) pool += CHAR_SETS.symbols;
    return pool;
  }

  function getActiveSetCount() {
    return [optUpper, optLower, optNumbers, optSymbols].filter((o) => o.checked).length;
  }

  function hasSelection() {
    return getActiveSetCount() > 0;
  }

  /* ---------------------------------------------------------
     Password generation
     Guarantees at least one character from each *selected*
     category, then fills the remainder randomly, then shuffles.
     --------------------------------------------------------- */
  function generatePassword() {
    if (!hasSelection()) {
      showWarning(true);
      passwordOutput.textContent = "Click generate";
      passwordOutput.classList.add("is-placeholder");
      updateStrength("");
      return;
    }
    showWarning(false);

    const length = parseInt(lengthSlider.value, 10);
    const activeSets = [];
    if (optUpper.checked) activeSets.push(CHAR_SETS.upper);
    if (optLower.checked) activeSets.push(CHAR_SETS.lower);
    if (optNumbers.checked) activeSets.push(CHAR_SETS.numbers);
    if (optSymbols.checked) activeSets.push(CHAR_SETS.symbols);

    const fullPool = getActiveSetCount() ? activeSets.join("") : "";
    const chars = [];

    // Ensure each selected category appears at least once (if length allows)
    activeSets.forEach((set) => {
      if (chars.length < length) {
        chars.push(set[secureRandomInt(set.length)]);
      }
    });

    // Fill the rest from the combined pool
    while (chars.length < length) {
      chars.push(fullPool[secureRandomInt(fullPool.length)]);
    }

    // Fisher–Yates shuffle so guaranteed chars aren't always up front
    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    currentPassword = chars.join("");
    passwordOutput.textContent = currentPassword;
    passwordOutput.classList.remove("is-placeholder");

    updateStrength(currentPassword);
    addToHistory(currentPassword);
  }

  /* ---------------------------------------------------------
     Warning message
     --------------------------------------------------------- */
  function showWarning(show) {
    warningMsg.classList.toggle("show", show);
  }

  /* ---------------------------------------------------------
     Strength + entropy
     Entropy (bits) = length * log2(pool size)
     --------------------------------------------------------- */
  function calculateEntropy(password) {
    if (!password) return 0;
    let poolSize = 0;
    if (optUpper.checked) poolSize += CHAR_SETS.upper.length;
    if (optLower.checked) poolSize += CHAR_SETS.lower.length;
    if (optNumbers.checked) poolSize += CHAR_SETS.numbers.length;
    if (optSymbols.checked) poolSize += CHAR_SETS.symbols.length;
    if (poolSize === 0) return 0;
    return Math.round(password.length * Math.log2(poolSize));
  }

  function updateStrength(password) {
    const entropy = calculateEntropy(password);
    entropyLabel.textContent = `${entropy} bits`;

    let pct = 0;
    let label = "—";
    let color = "var(--text-low)";

    if (password) {
      if (entropy < 40) {
        pct = 33;
        label = "Weak";
        color = "var(--weak)";
      } else if (entropy < 70) {
        pct = 66;
        label = "Medium";
        color = "var(--medium)";
      } else {
        pct = 100;
        label = "Strong";
        color = "var(--strong)";
      }
    }

    strengthFill.style.width = pct + "%";
    strengthFill.style.background = color;
    strengthLabel.textContent = label;
    strengthLabel.style.color = password ? color : "var(--text-mid)";
  }

  /* ---------------------------------------------------------
     Clipboard
     --------------------------------------------------------- */
  async function copyPassword() {
    if (!currentPassword) return;

    try {
      await navigator.clipboard.writeText(currentPassword);
    } catch (err) {
      // Fallback for older browsers / non-secure contexts
      const tempInput = document.createElement("textarea");
      tempInput.value = currentPassword;
      tempInput.style.position = "fixed";
      tempInput.style.opacity = "0";
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    }

    flashCopied();
  }

  function flashCopied() {
    copyToast.classList.add("show");
    copyBtn.classList.add("is-copied");
    clearTimeout(flashCopied._t);
    flashCopied._t = setTimeout(() => {
      copyToast.classList.remove("show");
      copyBtn.classList.remove("is-copied");
    }, 1600);
  }

  /* ---------------------------------------------------------
     History (last 5, in-memory only)
     --------------------------------------------------------- */
  function addToHistory(password) {
    history.unshift(password);
    if (history.length > HISTORY_LIMIT) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyCount.textContent = history.length;
    historyList.innerHTML = "";

    if (history.length === 0) {
      const empty = document.createElement("li");
      empty.className = "history__empty";
      empty.textContent = "Nothing generated yet.";
      historyList.appendChild(empty);
      return;
    }

    history.forEach((pwd) => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = pwd;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pwd);
        } catch (err) {
          /* clipboard unavailable — silently ignore for history rows */
        }
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = "Copy"), 1200);
      });

      li.appendChild(span);
      li.appendChild(btn);
      historyList.appendChild(li);
    });
  }

  /* ---------------------------------------------------------
     Event wiring
     --------------------------------------------------------- */
  lengthSlider.addEventListener("input", () => {
    lengthValue.textContent = lengthSlider.value;
  });

  generateBtn.addEventListener("click", generatePassword);
  copyBtn.addEventListener("click", copyPassword);

  [optUpper, optLower, optNumbers, optSymbols].forEach((opt) => {
    opt.addEventListener("change", () => {
      if (hasSelection()) showWarning(false);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement !== copyBtn) {
      generatePassword();
    }
  });

  // Initial render
  renderHistory();
  updateStrength("");

  /* ===========================================================
     Ambient background — subtle drifting particle grid
     Purely decorative, paused under reduced-motion preference.
     =========================================================== */
  (function ambientCanvas() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    let width, height, particles;
    const DENSITY = 14000; // px^2 per particle

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.max(18, Math.floor((width * height) / DENSITY));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        a: Math.random() * 0.5 + 0.15,
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 180, 41, ${p.a * 0.5})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
  })();
})();