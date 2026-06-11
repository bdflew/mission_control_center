// voice.js — Voice Tier 1 (zero keys, zero cost): push-to-talk speech-to-text
// via the Web Speech API + per-agent text-to-speech voices. Tier 2 (premium
// ElevenLabs voice) is tried first for the twin via /api/tts and falls back
// honestly to the browser voice.
// Push-to-talk by design: no always-on microphone.
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const MCVoice = window.MCVoice = {
    sttSupported: !!SR,
    ttsSupported: 'speechSynthesis' in window,
    listening: false,
  };

  // ---- push-to-talk: click to listen, auto-stops on result/silence ----
  let rec = null;
  MCVoice.pushToTalk = function (onText, btnEl) {
    if (!SR) { alert('Voice input needs Chrome (Web Speech API).'); return; }
    if (MCVoice.listening && rec) { try { rec.stop(); } catch (e) {} return; }
    rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
    MCVoice.listening = true;
    if (btnEl) btnEl.classList.add('is-listening');
    const done = () => {
      MCVoice.listening = false;
      if (btnEl) btnEl.classList.remove('is-listening');
    };
    rec.onresult = (e) => {
      const t = e.results[0] && e.results[0][0] ? e.results[0][0].transcript : '';
      if (t && onText) onText(t);
      done();
    };
    rec.onerror = done; rec.onend = done;
    try { rec.start(); } catch (e) { done(); }
  };

  // ---- per-agent TTS ----
  function agentVoice(agentId) {
    const a = (window.MC && MC.agents || []).find(x => x.id === agentId);
    return (a && a.voice) || { rate: 1.0, pitch: 1.0 };
  }
  MCVoice.speak = function (text, agentId) {
    if (!MCVoice.ttsSupported || !text) return;
    const v = agentVoice(agentId);
    const clean = String(text).replace(/[*_`#>]/g, '').slice(0, 600);
    const isTwin = window.MC && MC.twin && agentId === MC.twin.agentId;
    const browserSpeak = () => {
      try {
        const u = new SpeechSynthesisUtterance(clean);
        u.rate = v.rate || 1; u.pitch = v.pitch || 1;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } catch (e) {}
    };
    if (isTwin) { // premium voice first for the twin, honest fallback
      fetch((window.MCLive ? MCLive.API : '') + '/api/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      }).then(r => { if (!r.ok) throw 0; return r.blob(); })
        .then(b => {
          const url = URL.createObjectURL(b);
          const a = new Audio(url);
          a.onended = () => URL.revokeObjectURL(url); // blobs leaked per reply
          a.onerror = () => URL.revokeObjectURL(url);
          a.play().catch(() => { URL.revokeObjectURL(url); browserSpeak(); });
        })
        .catch(browserSpeak);
    } else browserSpeak();
  };

  // ---- speak-replies toggle (persisted) ----
  MCVoice.speakOn = () => localStorage.getItem('mcVoiceSpeak') === '1';
  MCVoice.toggleSpeak = () => {
    localStorage.setItem('mcVoiceSpeak', MCVoice.speakOn() ? '0' : '1');
    return MCVoice.speakOn();
  };

  // ---- auto-speak agent replies in direct channels when enabled ----
  function hook() {
    if (!window.MCLive || !MCLive.onEvent) return;
    MCLive.onEvent(evt => {
      if (evt.type !== 'chat' || !evt.message) return;
      const m = evt.message;
      if (!MCVoice.speakOn()) return;
      if (m.role !== 'agent') return;
      if (!m.channel || m.channel.indexOf('agent:') !== 0) return;
      MCVoice.speak(m.text, m.from);
    });
  }
  if (window.MCLive) hook(); else window.addEventListener('DOMContentLoaded', hook);
})();
