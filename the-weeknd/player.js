/* =========================================================
   LECTEUR — official YouTube embeds driven by the turntable
   (IFrame API, youtube-nocookie.com). Nothing is hosted here.
   ========================================================= */

let apiPromise = null;
export function loadYouTube(timeout = 12000) {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => reject(new Error('youtube-blocked'));
    document.head.append(s);
    setTimeout(() => { if (!window.YT?.Player) reject(new Error('youtube-timeout')); }, timeout);
  });
  apiPromise.catch(() => { apiPromise = null; });
  return apiPromise;
}

/**
 * createPlayer(mount, { onState(state), onError(code), onReady() })
 * state: 'playing' | 'paused' | 'ended' | 'buffering' | 'cued' | 'unstarted'
 */
export function createPlayer(mount, handlers = {}) {
  let yt = null, ready = false, pending = null, rate = 1, volume = 80;
  const STATES = { '-1': 'unstarted', 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering', 5: 'cued' };

  async function ensure(firstId, autoplay) {
    if (yt) return yt;
    const YT = await loadYouTube();
    return new Promise(resolve => {
      const host = document.createElement('div');
      mount.innerHTML = '';
      mount.append(host);
      yt = new YT.Player(host, {
        host: 'https://www.youtube-nocookie.com',
        videoId: firstId,
        width: '100%', height: '100%',
        playerVars: { autoplay: autoplay ? 1 : 0, playsinline: 1, rel: 0, modestbranding: 1, origin: location.origin },
        events: {
          onReady: () => {
            ready = true;
            try { yt.setVolume(volume); yt.setPlaybackRate(rate); } catch { /* ignore */ }
            handlers.onReady?.();
            if (pending) { const p = pending; pending = null; p(); }
            if (autoplay) { try { yt.playVideo(); } catch { /* ignore */ } }
            resolve(yt);
          },
          onStateChange: e => handlers.onState?.(STATES[e.data] || 'unknown'),
          onError: e => handlers.onError?.(e.data),
        },
      });
    });
  }

  let creating = null;
  return {
    /** load a video; autoplay=true right after a user gesture */
    async load(id, autoplay = true) {
      if (!yt && !creating) {
        creating = ensure(id, autoplay);
        try { await creating; } finally { if (!ready) creating = null; }
        return;
      }
      if (!ready) { pending = () => this.load(id, autoplay); return; }
      if (autoplay) yt.loadVideoById({ videoId: id, startSeconds: 0 }); else yt.cueVideoById({ videoId: id, startSeconds: 0 });
      try { yt.setPlaybackRate(rate); } catch { /* ignore */ }
    },
    play() { if (ready) yt.playVideo(); },
    pause() { if (ready) yt.pauseVideo(); },
    stop() { if (ready) yt.stopVideo(); },
    setRate(r) { rate = r; if (ready) { try { yt.setPlaybackRate(r); } catch { /* ignore */ } } },
    setVolume(v) { volume = v; if (ready) { try { yt.setVolume(v); } catch { /* ignore */ } } },
    progress() {
      if (!ready) return 0;
      try { const d = yt.getDuration(); return d ? yt.getCurrentTime() / d : 0; } catch { return 0; }
    },
    time() { if (!ready) return [0, 0]; try { return [yt.getCurrentTime(), yt.getDuration()]; } catch { return [0, 0]; } },
    get ready() { return ready; },
  };
}
