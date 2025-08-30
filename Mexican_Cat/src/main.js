// Importa el web component (instala: npm i @google/model-viewer)
import '@google/model-viewer';

const viewer = document.getElementById('viewer');
const overlay = document.getElementById('overlay');
const playBtn = document.getElementById('playBtn');
const bgm = document.getElementById('bgm');
const msg = document.getElementById('msg');

/* ===== Config ===== */
const SELECTED_CLIP = '';                // '' = primera anim del GLB
const ZOOM_DURATION = 2;                 // 00:00 → 00:02 (s)
const ORBIT_START = { az: 90, el: 85, r: 22 };
const ORBIT_END = { az: 90, el: 85, r: 12 };
const TARGET_Y = 1.5;
const TIME_SCALE = 1.5;                 // velocidad anim GLB

// Fase 2 (00:03 → 00:06): giro + movimiento errático
const SPIN_DURATION = 3;                // segundos
const SPIN_TURNS = 2;                // vueltas completas (2 = 720°)
const SPIN_DIRECTION = 1;                // 1 = horario, -1 = antihorario

// Intensidades del “errático” (ajusta a gusto)
const ROLL_JITTER_DEG = 6;   // temblor extra sobre el giro base
const JIT_TX_M = 0.10; // paneo X del target (m)
const JIT_TY_M = 0.08; // paneo Y del target (m)
const JIT_R_M = 0.12; // jitter del radio (m)
const BASE_HZ = 2.2;  // frecuencia base
const VAR_HZ = 1.3;  // variación

/* ===== Easing ===== */
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ===== Zoom sólo del radio ===== */
function animateOrbitRadius({ from, to, duration }) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / (duration * 1000), 1);
    const u = easeInOutCubic(t);
    const r = from.r + (to.r - from.r) * u;
    viewer.cameraOrbit = `${from.az}deg ${from.el}deg ${r}m`;
    if (t < 1) requestAnimationFrame(step);
    else viewer.jumpCameraToGoal();
  }
  requestAnimationFrame(step);
}

/* ===== Ruido suave (sin librerías) ===== */
function smoothNoise(t, f1, f2, phase = 0) {
  return (
    0.6 * Math.sin(2 * Math.PI * f1 * t + phase) +
    0.4 * Math.sin(2 * Math.PI * f2 * t + phase * 1.37)
  ) * 0.85;
}

/* ===== Giro en Z + movimiento errático (manteniendo frente) ===== */
function animateErraticSpinZ({
  baseAz = ORBIT_END.az,
  baseEl = ORBIT_END.el,
  baseR = ORBIT_END.r,
  baseTy = TARGET_Y,
  duration = SPIN_DURATION,
  turns = SPIN_TURNS,
  direction = SPIN_DIRECTION
}) {
  const start = performance.now();
  const totalDeg = 360 * turns * direction; // giro total (horario o anti)

  function step(now) {
    const elapsed = (now - start) / 1000;
    const t = Math.min(elapsed / duration, 1);

    // 1) giro “reloj” lineal
    const rollBase = totalDeg * t;

    // 2) jitter extra en roll
    const rollJit = ROLL_JITTER_DEG * smoothNoise(elapsed, BASE_HZ, VAR_HZ, 0.3);

    // 3) paneos y radio erráticos
    const tx = JIT_TX_M * smoothNoise(elapsed, BASE_HZ * 0.9, VAR_HZ * 1.1, 0.9);
    const ty = baseTy + JIT_TY_M * smoothNoise(elapsed, BASE_HZ * 1.2, VAR_HZ * 0.8, 1.7);
    const r = baseR + JIT_R_M * smoothNoise(elapsed, BASE_HZ * 0.8, VAR_HZ * 1.4, 2.6);

    // aplica framing (frontal)
    viewer.cameraTarget = `${tx.toFixed(3)}m ${ty.toFixed(3)}m 0m`;
    viewer.cameraOrbit = `${baseAz}deg ${baseEl}deg ${r.toFixed(3)}m`;

    // roll Z del encuadre
    viewer.style.transform = `rotateZ(${(rollBase + rollJit).toFixed(3)}deg)`;

    if (t < 1) requestAnimationFrame(step);
    else {
      viewer.style.transform = '';  // quita esto si quieres que quede inclinado
      viewer.jumpCameraToGoal();
    }
  }
  requestAnimationFrame(step);
}

/* ===== Reproducir ===== */
async function startPlayback() {
  msg.textContent = '';
  document.body.classList.add('playing'); // fondo blanco

  // Carga diferida del modelo
  if (!viewer.src) viewer.src = viewer.getAttribute('data-src');

  // Espera GLB
  if (viewer.readyState !== 'complete') {
    await new Promise(res => viewer.addEventListener('load', res, { once: true }));
  }
  viewer.classList.add('ready');

  // Cámara base (frontal)
  viewer.interpolationDecay = 0;
  viewer.cameraTarget = `0m ${TARGET_Y}m 0m`;
  viewer.cameraOrbit = `${ORBIT_START.az}deg ${ORBIT_START.el}deg ${ORBIT_START.r}m`;
  viewer.jumpCameraToGoal();

  // 00:00 → 00:02: zoom (22 → 12m)
  animateOrbitRadius({ from: ORBIT_START, to: ORBIT_END, duration: ZOOM_DURATION });

  // 00:03 → 00:06: giro Z + errático (ahora inicia al segundo 3)
  setTimeout(() => {
    animateErraticSpinZ({
      baseAz: ORBIT_END.az,
      baseEl: ORBIT_END.el,
      baseR: ORBIT_END.r,
      baseTy: TARGET_Y,
      duration: SPIN_DURATION,
      turns: SPIN_TURNS,
      direction: SPIN_DIRECTION
    });
  }, 3000); // ← inicia en el segundo 3

  // Animación GLB (timeScale = velocidad)
  try {
    const list = viewer.availableAnimations || [];
    if (SELECTED_CLIP && list.includes(SELECTED_CLIP)) viewer.animationName = SELECTED_CLIP;
    else if (list.length) viewer.animationName = list[0];
    viewer.timeScale = TIME_SCALE;
  } catch { }

  // Play anim + audio
  viewer.currentTime = 0;
  viewer.play({ repetitions: 1 });

  bgm.currentTime = 0;
  try { await bgm.play(); }
  catch { msg.textContent = 'El navegador bloqueó el audio. Toca Play otra vez.'; }

  // Limpia overlay
  setTimeout(() => overlay.remove(), 300);
}

/* ===== Eventos ===== */
playBtn.addEventListener('click', async () => {
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  await startPlayback();
});

viewer.addEventListener('error', (e) => {
  console.error('model-viewer error:', e);
  msg.textContent = 'Error cargando el modelo (revisa la ruta /assets/...).';
});
