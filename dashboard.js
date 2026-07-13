// Dashboard entrance animation + simple analytics (click tally)
(function() {
  const params = new URLSearchParams(window.location.search);
  const kick = params.get('kick');

  const primary = document.getElementById('translatedOption');
  const secondary = document.getElementById('originalOption');

  // Entrance animation when redirected with kick=1
  if (kick && (primary || secondary)) {
    if (primary) primary.classList.add('enter-zoom');
    if (secondary) secondary.classList.add('enter-slide');
    // remove classes after animation completes
    setTimeout(() => {
      if (primary) primary.classList.remove('enter-zoom');
      if (secondary) secondary.classList.remove('enter-slide');
    }, 1800);
  }

  // Simple analytics: tally clicks and persist in localStorage
  const STORAGE_KEY = 'tanzaflix_choice_counts_v1';
  const loadCounts = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const saveCounts = (c) => localStorage.setItem(STORAGE_KEY, JSON.stringify(c));

  const setupCard = (el) => {
    if (!el) return;
    const id = el.id;
    const counts = loadCounts();
    const badge = document.createElement('span');
    badge.className = 'choice-badge';
    badge.textContent = counts[id] || 0;
    el.appendChild(badge);

    el.addEventListener('click', (e) => {
      e.preventDefault();
      const c = loadCounts();
      c[id] = (c[id] || 0) + 1;
      saveCounts(c);
      badge.textContent = c[id];
      // visual feedback
      el.classList.add('clicked');
      setTimeout(() => el.classList.remove('clicked'), 600);
      // proceed (placeholder) - in real app navigate to content list
      setTimeout(() => {
        // For now just log and stay
        console.log('Selected', id, 'counts', c[id]);
      }, 400);
    });
  };

  setupCard(primary);
  setupCard(secondary);
})();
