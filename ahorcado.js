/* ================= LÓGICA DEL JUEGO ================= */

// Palabras (en minúscula, sin tildes ni ñ)
const palabras = ["programa","teclado","ventana","internet","variable","computador","arreglo","funcion", "lampara", "pampara", "salsa", "salsero", "regueton"];

const INTENTOS_INICIALES = 6;
let palabraSecreta = "";
let letrasUsadas = [];
let intentos = INTENTOS_INICIALES;

function elegirPalabra(){ return palabras[Math.floor(Math.random()*palabras.length)]; }
function haGanado(){ return [...palabraSecreta].every(l => letrasUsadas.includes(l)); }
function haPerdido(){ return intentos <= 0; }

function ingresarLetra(entrada){
  if(haGanado() || haPerdido()) return "El juego ya terminó.";
  const letra = entrada.toLowerCase();
  if(letra.length !== 1 || letra < "a" || letra > "z") return "Ingresa solo una letra válida.";
  if(letrasUsadas.includes(letra)) return `Ya usaste la "${letra}".`;
  letrasUsadas.push(letra);
  if(palabraSecreta.includes(letra)){
    return haGanado() ? "¡Ganaste!" : "¡Correcto!";
  }
  intentos--;
  return haPerdido() ? `Perdiste. La palabra era: ${palabraSecreta}` : `Incorrecto. Te quedan ${intentos}.`;
}

function reiniciarJuego(){
  palabraSecreta = elegirPalabra();
  letrasUsadas = [];
  intentos = INTENTOS_INICIALES;
}

/* ================= HORCA (SVG) ================= */

const PARTES = [
  {d:'M62 388 Q180 383 298 388', w:5},      // base
  {d:'M92 386 Q88 200 91 76', w:5},          // columna
  {d:'M91 78 Q170 73 252 78', w:5},          // voladizo
  {d:'M250 78 Q249 100 250 122', w:4.5},     // cuerda
  {c:[250,149,24], w:4.5},                   // cabeza
  {d:'M250 173 Q251 215 250 258', w:4.5},    // torso
  {d:'M250 192 Q232 208 216 226', w:4.5},    // brazo izquierdo
  {d:'M250 192 Q268 208 284 226', w:4.5},    // brazo derecho
  {d:'M250 258 Q236 282 222 306', w:4.5},    // pierna izquierda
  {d:'M250 258 Q264 282 278 306', w:4.5},    // pierna derecha
];
// errores (0..6) -> cuántas piezas se dibujan
const PIEZAS_POR_ERROR = [0, 3, 5, 6, 8, 9, 10];
const INK = '#141412';

function ojos(n){
  if(n < 5) return '';
  const x = 250, y = 149;
  if(n < 10) return `<circle cx="${x-8}" cy="${y-3}" r="2.4" fill="${INK}"/><circle cx="${x+8}" cy="${y-3}" r="2.4" fill="${INK}"/>`;
  return `<path d="M${x-11} ${y-7} L${x-5} ${y+1} M${x-5} ${y-7} L${x-11} ${y+1} M${x+5} ${y-7} L${x+11} ${y+1} M${x+11} ${y-7} L${x+5} ${y+1}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
}

let piezasMostradas = 0;
function dibujarHorca(n){
  const nueva = i => i >= piezasMostradas ? ' draw' : '';
  let fijo = `<line x1="40" y1="392" x2="320" y2="392" class="faint"/>`;
  let colgado = '';
  PARTES.slice(0, n).forEach((p, i) => {
    const el = p.c
      ? `<circle class="stroke-part${nueva(i)}" pathLength="1" cx="${p.c[0]}" cy="${p.c[1]}" r="${p.c[2]}" stroke-width="${p.w}"/>`
      : `<path class="stroke-part${nueva(i)}" pathLength="1" d="${p.d}" stroke-width="${p.w}"/>`;
    if(i >= 3) colgado += el; else fijo += el;
  });
  if(n >= 4) colgado += `<circle cx="250" cy="124" r="3" fill="${INK}"/>` + ojos(n);
  svg.innerHTML = fijo + (colgado ? `<g class="pendulum">${colgado}</g>` : '');
  piezasMostradas = n;
}

/* ================= INTERFAZ ================= */

const svg = document.getElementById('svg');
const wordEl = document.getElementById('word');
const keysEl = document.getElementById('keys');
const msgEl = document.getElementById('msg');
const dotsEl = document.getElementById('dots');
let ultima = '';

function construirTeclas(){
  keysEl.innerHTML = '';
  for(const l of 'abcdefghijklmnopqrstuvwxyz'){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'key'; b.id = 'key-' + l;
    b.textContent = l.toUpperCase();
    b.onclick = () => jugar(l);
    keysEl.appendChild(b);
  }
}

function actualizar(fallo){
  // horca
  const n = PIEZAS_POR_ERROR[INTENTOS_INICIALES - intentos];
  if(n !== piezasMostradas) dibujarHorca(n);
  if(fallo){ svg.classList.remove('shake'); void svg.getBoundingClientRect(); svg.classList.add('shake'); }
  // intentos
  dotsEl.innerHTML = '';
  for(let i = 0; i < INTENTOS_INICIALES; i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i < intentos ? '' : ' off');
    dotsEl.appendChild(d);
  }
  // palabra
  wordEl.innerHTML = '';
  wordEl.style.setProperty('--n', palabraSecreta.length);
  wordEl.classList.toggle('win', haGanado());
  for(const l of palabraSecreta){
    const s = document.createElement('div');
    s.className = 'slot';
    if(letrasUsadas.includes(l)){
      s.textContent = l.toUpperCase();
      if(l === ultima) s.classList.add('new');
    } else if(haPerdido()){
      s.textContent = l.toUpperCase();
      s.classList.add('miss');
    } else s.innerHTML = '&nbsp;';
    wordEl.appendChild(s);
  }
  // teclas
  for(const b of keysEl.children){
    const l = b.id.slice(4), usada = letrasUsadas.includes(l);
    b.disabled = usada || haGanado() || haPerdido();
    if(usada) b.classList.add(palabraSecreta.includes(l) ? 'ok' : 'bad');
  }
}

function jugar(entrada){
  const antes = letrasUsadas.length, intentosAntes = intentos;
  msgEl.textContent = ingresarLetra(entrada);
  ultima = letrasUsadas.length > antes ? entrada.toLowerCase() : '';
  actualizar(intentos < intentosAntes);
  mostrarResultado();
}

/* ----- animación de victoria / derrota ----- */
const gameEl = document.querySelector('.game');
const resultEl = document.getElementById('result');
let resultadoMostrado = false;

function mostrarResultado(){
  if(resultadoMostrado || !(haGanado() || haPerdido())) return;
  resultadoMostrado = true;
  const gano = haGanado();
  resultEl.textContent = gano ? '¡Ganaste!' : 'Perdiste';
  resultEl.className = 'result show ' + (gano ? 'win' : 'lose');
  if(gano){
    gameEl.classList.add('won');
    lanzarConfeti();
  } else {
    gameEl.classList.add('lost');
    gameEl.classList.remove('shake'); void gameEl.getBoundingClientRect(); gameEl.classList.add('shake');
  }
}

function lanzarConfeti(){
  for(let i = 0; i < 36; i++){
    const c = document.createElement('span');
    c.className = 'confeti';
    const w = 4 + Math.random() * 6;
    c.style.left = Math.random() * 100 + '%';
    c.style.width = w + 'px';
    c.style.height = (Math.random() < .5 ? w : w * 3) + 'px';
    c.style.borderRadius = Math.random() < .5 ? '50%' : '0';
    c.style.opacity = (0.5 + Math.random() * .5).toFixed(2);
    c.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
    c.style.animationDelay = (Math.random() * .8) + 's';
    gameEl.appendChild(c);
    setTimeout(() => c.remove(), 5000);
  }
}

function limpiarResultado(){
  resultadoMostrado = false;
  resultEl.className = 'result';
  gameEl.classList.remove('won', 'lost', 'shake');
  document.querySelectorAll('.confeti').forEach(c => c.remove());
}

function nuevaPartida(){
  reiniciarJuego();
  limpiarResultado();
  ultima = ''; piezasMostradas = -1;
  msgEl.textContent = 'Elige una letra.';
  construirTeclas();
  actualizar(false);
}

document.getElementById('reset').onclick = nuevaPartida;
document.addEventListener('keydown', e => {
  if(e.ctrlKey || e.metaKey || e.altKey) return;
  if(/^[a-zA-Z]$/.test(e.key)) jugar(e.key);
});
nuevaPartida();
