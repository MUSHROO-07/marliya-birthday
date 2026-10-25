(() => {
  const $ = (s) => document.querySelector(s);
  const config = window.MARLIYA_CONFIG || {};
  let supabase = null;
  if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY && window.supabase?.createClient) {
    supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  }

  // Starfield: restrained, low-motion decoration.
  const stars = $('#stars');
  for (let i = 0; i < 105; i++) {
    const star = document.createElement('i'); star.className = 'star';
    star.style.left = `${Math.random() * 100}%`; star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${2.5 + Math.random() * 5}s`);
    star.style.animationDelay = `${Math.random() * -7}s`;
    if (i % 5 === 0) { star.style.width = '3px'; star.style.height = '3px'; }
    stars.appendChild(star);
  }
  const finaleStars = $('.finale-stars');
  for (let i = 0; i < 45; i++) {
    const star = document.createElement('i'); star.className = 'star';
    star.style.left = `${Math.random() * 100}%`; star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${3 + Math.random() * 6}s`); star.style.animationDelay = `${Math.random() * -8}s`;
    finaleStars.appendChild(star);
  }

  // Birthday countdown: local time, rolls to the next October 26 after the date passes.
  function updateCountdown() {
    const now = new Date(); let target = new Date(now.getFullYear(), 9, 26, 0, 0, 0);
    if (now >= target) target = new Date(now.getFullYear() + 1, 9, 26, 0, 0, 0);
    const seconds = Math.max(0, Math.floor((target - now) / 1000));
    $('#days').textContent = String(Math.floor(seconds / 86400)).padStart(2, '0');
    $('#hours').textContent = String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0');
    $('#minutes').textContent = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    $('#seconds').textContent = String(seconds % 60).padStart(2, '0');
    const isBirthday = now.getMonth() === 9 && now.getDate() === 26;
    $('#countdownNote').textContent = isBirthday ? 'Alhamdulillah — today is your day. May it be full of barakah.' : `Counting down to ${target.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}.`;
  }
  updateCountdown(); setInterval(updateCountdown, 1000);

  // Scroll reveal and reading progress.
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
  const progress = $('#progress');
  function updateProgress() { const max = document.documentElement.scrollHeight - innerHeight; progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`; }
  addEventListener('scroll', updateProgress, { passive: true }); updateProgress();
  $('#backToTop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // Childhood image is optional; if present, reveal it and hide the placeholder.
  const childhoodPhoto = $('#childhoodPhoto');
  childhoodPhoto.addEventListener('load', () => { childhoodPhoto.hidden = false; $('#photoPlaceholder').hidden = true; });
  childhoodPhoto.addEventListener('error', () => { childhoodPhoto.hidden = true; $('#photoPlaceholder').hidden = false; });

  const toast = $('#toast'); let toastTimer;
  function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 4200); }
  const form = $('#wishForm'); const wall = $('#wishWall'); const wishStatus = $('#wishStatus');
  function escapeText(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function renderWish(wish) {
    const card = document.createElement('article'); card.className = 'wish-card';
    card.innerHTML = `<span class="wish-ornament">✧</span><p class="wish-message">${escapeText(wish.message)}</p><div class="wish-author"><span>${escapeText(wish.name)}</span><small>${escapeText(wish.relationship || 'A birthday wish')}</small></div>`;
    wall.prepend(card);
  }
  async function loadWishes() {
    if (!supabase) { $('#wishCount').textContent = 'Your community notes will appear here'; return; }
    const { data, error } = await supabase.from('marliya_wishes').select('id,name,relationship,message,created_at').eq('approved', true).order('created_at', { ascending: false }).limit(30);
    if (error) { $('#wishCount').textContent = 'Wish Wall connection needs checking'; return; }
    wall.querySelectorAll('.wish-card:not(.sample)').forEach(el => el.remove());
    if (data.length) { wall.querySelectorAll('.sample').forEach(el => el.remove()); data.forEach(renderWish); }
    $('#wishCount').textContent = `${data.length} ${data.length === 1 ? 'wish' : 'wishes'} shared`;
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); const fd = new FormData(form);
    const wish = { name: String(fd.get('name') || '').trim(), relationship: String(fd.get('relationship') || 'Other'), message: String(fd.get('message') || '').trim() };
    if (!wish.name || !wish.message) { showToast('Please add your name and a message first.'); return; }
    if (wish.name.length > 50 || wish.message.length > 500) { showToast('Please shorten your note a little.'); return; }
    const button = form.querySelector('button[type="submit"]'); button.disabled = true; button.style.opacity = '.65';
    try {
      if (!supabase) {
        wishStatus.textContent = 'Demo mode — connect Supabase to send a shared wish.';
        showToast('The Wish Wall needs its Supabase connection before wishes can be sent online.');
        return;
      }
      const { error } = await supabase.from('marliya_wishes').insert({ ...wish, approved: false });
      if (error) throw error;
      form.reset(); wishStatus.textContent = 'Your note was received and is waiting for approval.';
      showToast('Your wish was sent. Thank you for making her day special.');
    } catch (err) {
      console.error(err); wishStatus.textContent = 'We could not send that just now. Please try again.';
      showToast('Could not send the wish. Please check the connection and try again.');
    } finally { button.disabled = false; button.style.opacity = '1'; }
  });
  loadWishes();

  // Sound remains off by default; the button gives a gentle visual toggle without autoplay.
  const soundToggle = $('#soundToggle'); let soundOn = false;
  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.innerHTML = soundOn ? '♫ <span>Sound on</span>' : '♫ <span>Sound off</span>';
    showToast(soundOn ? 'Sound toggle is a visual placeholder for now; no audio is played.' : 'Sound is off.');
    if (soundOn) { soundOn = false; soundToggle.innerHTML = '♫ <span>Sound off</span>'; }
  });
})();
