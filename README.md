# El Ahorcado

Juego del ahorcado en el navegador, sin dependencias ni instalación. Estilo visual de tinta sobre papel: cada error dibuja una parte de la horca y del monigote.

## Estructura

```
ahorcado.html   Estructura de la página
ahorcado.css    Estilos y animaciones
ahorcado.js     Lógica del juego, dibujo de la horca e interfaz
README.md       Este archivo
```

Los tres archivos deben estar en la misma carpeta.

## Cómo ejecutarlo

Abre `ahorcado.html` en cualquier navegador (doble clic). No requiere servidor.

Las tipografías (Fraunces e IBM Plex Mono) se cargan desde Google Fonts. Sin internet el juego funciona igual, pero usa fuentes del sistema.

## Cómo se juega

1. Se elige una palabra al azar y se muestra con una casilla vacía por letra.
2. Elige letras haciendo clic en el teclado en pantalla o escribiendo en tu teclado.
3. Si la letra está en la palabra, aparece en su posición. Si no, pierdes un intento y se dibuja una parte de la horca.
4. Empiezas con **6 intentos** (los puntos de arriba a la derecha).
5. Ganas al descubrir todas las letras. Pierdes al quedarte sin intentos, y entonces se revela la palabra.
6. Repetir una letra o pulsar una tecla que no sea una letra no descuenta intentos.
7. El botón **Nueva partida** reinicia el juego con otra palabra.

## Cambiar las palabras

Edita la lista `palabras` al inicio de `ahorcado.js`:

```js
const palabras = ["programa", "teclado", "ventana", "salsa"];
```

Reglas para las palabras:

- En minúscula.
- Sin tildes ni `ñ` (el teclado solo tiene las letras de la `a` a la `z`). Por ejemplo, `funcion` y no `función`.
- Sin espacios ni guiones.
- Pueden ser de cualquier largo: la palabra siempre se muestra en una sola línea y las casillas se encogen si hace falta.

## Cómo está organizado el código (`ahorcado.js`)

**Lógica**

| Elemento | Qué hace |
|---|---|
| `palabras` | Lista de palabras posibles |
| `INTENTOS_INICIALES` | Intentos con los que empieza cada partida (6) |
| `palabraSecreta`, `letrasUsadas`, `intentos` | Estado de la partida actual |
| `elegirPalabra()` | Devuelve una palabra al azar |
| `haGanado()` | `true` si todas las letras de la palabra ya fueron usadas |
| `haPerdido()` | `true` si no quedan intentos |
| `ingresarLetra(letra)` | Valida y procesa una jugada; devuelve el mensaje para mostrar |
| `reiniciarJuego()` | Elige nueva palabra y restablece el estado |

**Horca**

- `PARTES` define las 10 piezas dibujadas como trazos SVG (base, columna, voladizo, cuerda, cabeza, torso, dos brazos, dos piernas).
- `PIEZAS_POR_ERROR` indica cuántas piezas se ven según los errores cometidos: `[0, 3, 5, 6, 8, 9, 10]`. El primer error dibuja la estructura completa, y con el último el monigote queda completo con los ojos en aspa.
- `dibujarHorca(n)` dibuja las primeras `n` piezas y anima solo las nuevas. La cuerda y el monigote se balancean como un péndulo.

**Interfaz**

- `construirTeclas()` crea las 26 letras.
- `actualizar(fallo)` redibuja horca, intentos, palabra y teclas. Si hubo fallo, la horca vibra.
- `jugar(letra)` conecta un clic o tecla con la lógica y refresca la pantalla.
- `nuevaPartida()` reinicia la lógica y la interfaz.
- `mostrarResultado()`, `lanzarConfeti()` y `limpiarResultado()` manejan las animaciones de victoria y derrota.

## Animaciones de resultado

Al terminar la partida se muestra un sello sobre la horca:

- **Ganaste:** aparece el sello «¡Ganaste!», la horca se desvanece y cae confeti de tinta.
- **Perdiste:** aparece el sello «Perdiste», la tarjeta vibra y el monigote se balancea con fuerza hasta quedar quieto. La palabra se revela en gris.

En el código: `mostrarResultado()` decide qué animación lanzar (solo una vez por partida), `lanzarConfeti()` crea las piezas y `limpiarResultado()` lo deja todo listo para la siguiente partida. Los estilos están en la sección «resultado» de `ahorcado.css`.

## Personalización rápida

- **Colores:** variables al inicio de `ahorcado.css` (`--paper`, `--ink`, etc.).
- **Tamaño del cuadro:** `max-width` de `.game` en `ahorcado.css`.
- **Número de intentos:** cambia `INTENTOS_INICIALES` en `ahorcado.js`. Si cambias el 6, ajusta también `PIEZAS_POR_ERROR` para que tenga un valor por cada error posible (de 0 hasta `INTENTOS_INICIALES`).

## Accesibilidad

- Se puede jugar solo con el teclado.
- Los mensajes del juego se anuncian a lectores de pantalla (`aria-live`).
- Se respeta la preferencia del sistema de reducir animaciones.
