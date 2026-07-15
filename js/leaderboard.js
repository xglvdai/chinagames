/**
 * ZenMatch Games — Shared Leaderboard Module
 * Provides: submitScore(), showNameInput(), fetchLeaderboard()
 */
(function() {
  'use strict';

  const API_BASE = 'https://api.zenmatchgames.com';

  // ===== Name Input Overlay =====
  // Each game page should include: <div id="nameInputOverlay" class="name-input-overlay">...</div>
  function createNameInputOverlay() {
    if (document.getElementById('nameInputOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'nameInputOverlay';
    overlay.className = 'name-input-overlay';
    overlay.innerHTML = `
      <div class="name-input-modal">
        <div class="name-input-icon">&#x1F3C6;</div>
        <h3 id="nameInputTitle">Submit Your Score!</h3>
        <p id="nameInputMessage">Enter your player name to join the global leaderboard.</p>
        <div class="name-input-score" id="nameInputScore"></div>
        <input type="text" id="nameInputField" class="name-input-field"
               placeholder="Your Player Name" maxlength="20" autocomplete="off">
        <div class="name-input-error" id="nameInputError"></div>
        <div class="name-input-actions">
          <button id="nameInputSkip" class="btn btn-secondary btn-sm">Skip</button>
          <button id="nameInputSubmit" class="btn btn-primary btn-sm">Submit Score</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Add styles if not already present
    if (!document.getElementById('leaderboard-styles')) {
      const style = document.createElement('style');
      style.id = 'leaderboard-styles';
      style.textContent = `
        .name-input-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          z-index: 1000; justify-content: center; align-items: center;
        }
        .name-input-overlay.active { display: flex; }
        .name-input-modal {
          background: var(--color-surface, #1a1a2e); border: 1px solid var(--color-gold, #d4a853);
          border-radius: 12px; padding: 2rem; max-width: 400px; width: 90%;
          text-align: center; animation: modalSlideUp 0.3s ease;
        }
        @keyframes modalSlideUp { from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); } }
        .name-input-modal h3 { color: var(--color-gold, #d4a853); margin-bottom: 0.5rem; }
        .name-input-modal p { color: var(--color-text-dim, #aaa); margin-bottom: 1rem; font-size: 0.9rem; }
        .name-input-score {
          color: var(--color-text, #fff); font-size: 1.1rem; font-weight: 600;
          margin-bottom: 1rem; padding: 0.5rem; background: rgba(212,168,83,0.1);
          border-radius: 6px;
        }
        .name-input-field {
          width: 100%; padding: 0.75rem; border: 2px solid var(--color-border, #333);
          border-radius: 8px; background: var(--color-bg, #0d0d1a);
          color: var(--color-text, #fff); font-size: 1rem; margin-bottom: 0.75rem;
          outline: none; transition: border-color 0.2s; text-align: center;
        }
        .name-input-field:focus { border-color: var(--color-gold, #d4a853); }
        .name-input-error { color: #e74c3c; font-size: 0.85rem; margin-bottom: 0.5rem; min-height: 1.2em; }
        .name-input-actions { display: flex; gap: 0.75rem; justify-content: center; }
        .name-input-submitting .name-input-field,
        .name-input-submitting .name-input-actions button { opacity: 0.6; pointer-events: none; }
        .name-input-success { color: #2ecc71; font-size: 0.9rem; }
      `;
      document.head.appendChild(style);
    }
  }

  // ===== Show Name Input =====
  window.showNameInput = function(gameId, scoreText, callback) {
    createNameInputOverlay();
    const overlay = document.getElementById('nameInputOverlay');
    const field = document.getElementById('nameInputField');
    const error = document.getElementById('nameInputError');
    const submitBtn = document.getElementById('nameInputSubmit');
    const skipBtn = document.getElementById('nameInputSkip');
    const scoreDisplay = document.getElementById('nameInputScore');
    const msg = document.getElementById('nameInputMessage');
    const title = document.getElementById('nameInputTitle');

    title.textContent = 'Submit Your Score!';
    msg.textContent = 'Enter your player name to join the global leaderboard.';
    scoreDisplay.textContent = scoreText || '';
    field.value = localStorage.getItem('zenmatch_player_name') || '';
    error.textContent = '';
    overlay.classList.remove('name-input-submitting');
    overlay.classList.add('active');
    field.focus();

    function cleanup() {
      overlay.classList.remove('active', 'name-input-submitting');
    }

    // Reusable submit handler
    async function doSubmit() {
      const name = field.value.trim();
      if (!name || name.length < 2) {
        error.textContent = 'Name must be at least 2 characters.';
        field.focus();
        return;
      }
      if (name.length > 20) {
        error.textContent = 'Name must be 20 characters or fewer.';
        field.focus();
        return;
      }
      if (/[<>{}]/.test(name)) {
        error.textContent = 'Name contains invalid characters.';
        field.focus();
        return;
      }

      error.textContent = '';
      overlay.classList.add('name-input-submitting');
      submitBtn.textContent = 'Submitting...';

      // Save player name
      localStorage.setItem('zenmatch_player_name', name);

      try {
        const res = await fetch(API_BASE + '/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game: gameId, player: name, ...callback() })
        });
        if (res.ok) {
          title.textContent = 'Score Submitted!';
          msg.innerHTML = '<span class="name-input-success">&#10003; Your score has been recorded!</span>';
          scoreDisplay.textContent = '';
          field.style.display = 'none';
          submitBtn.textContent = 'OK';
          submitBtn.onclick = cleanup;
          skipBtn.style.display = 'none';
        } else {
          const data = await res.json().catch(() => ({}));
          error.textContent = data.error || 'Submission failed. Please try again.';
          overlay.classList.remove('name-input-submitting');
          submitBtn.textContent = 'Submit Score';
        }
      } catch (err) {
        console.warn('Leaderboard API unreachable, saving locally:', err);
        // Fallback: save locally
        const scores = JSON.parse(localStorage.getItem('zenmatch_local_scores') || '{}');
        if (!scores[gameId]) scores[gameId] = [];
        scores[gameId].push({ player: name, ...callback(), date: new Date().toISOString() });
        scores[gameId].sort((a, b) => (b.score || 0) - (a.score || 0));
        localStorage.setItem('zenmatch_local_scores', JSON.stringify(scores));

        title.textContent = 'Score Saved Locally!';
        msg.innerHTML = '<span style="color:#f39c12;">&#9888; API not available. Score saved on this device.</span>';
        scoreDisplay.textContent = '';
        field.style.display = 'none';
        submitBtn.textContent = 'OK';
        submitBtn.onclick = cleanup;
        skipBtn.style.display = 'none';
      }
    }

    submitBtn.onclick = doSubmit;
    skipBtn.onclick = cleanup;
    field.onkeydown = function(e) {
      if (e.key === 'Enter') { e.preventDefault(); doSubmit(); }
    };
  };

  // ===== Fetch Leaderboard =====
  window.fetchLeaderboard = async function(gameId) {
    try {
      const res = await fetch(API_BASE + '/api/leaderboard/' + gameId);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data && data.length) return data;
      throw new Error('Empty');
    } catch (err) {
      // Fallback to local scores
      const scores = JSON.parse(localStorage.getItem('zenmatch_local_scores') || '{}');
      return (scores[gameId] || []).slice(0, 10);
    }
  };

})();
