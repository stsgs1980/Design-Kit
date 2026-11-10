/** GLSL-программы Dither: вершинный шейдер, FBM-волна и матрица Байера 8x8. */
export const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const WAVE_FRAG = /* glsl */ `
precision highp float;

uniform vec2  resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3  waveColor;
uniform vec3  bgColor;
uniform vec2  mousePos;
uniform float enableMouseInteraction;
uniform float mouseRadius;

// --- симплекс-шум 2D (Ashima / Gustavson) -------------------------------
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

// --- фрактальный шум: 4 октавы abs(noise) --------------------------------
const int OCTAVES = 4;

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;   // сдвиг фазы во времени = «плывущий» шум
  return fbm(p + fbm(p2));          // домен-варпинг: шум внутри шума
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;   // сохраняем пропорции

  float f = pattern(uv);

  if (enableMouseInteraction > 0.5) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x *= resolution.x / resolution.y;
    float dist = length(uv - mouseNDC);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    f -= 0.5 * effect;                    // «вмятина» под курсором
  }

  vec3 col = mix(bgColor, waveColor, clamp(f, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const RETRO_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D inputBuffer;
uniform vec2  resolution;
uniform float colorNum;
uniform float pixelSize;

// Матрица Байера 8x8, посчитанная процедурно (в оригинале — const float[64]).
// bayer_N(i,j) = 4 * bayer_{N/2}(i/2, j/2) + bayer_2(i%2, j%2)
float bayer2(vec2 p) {
  float x = mod(p.x, 2.0);
  float y = mod(p.y, 2.0);
  // [[0, 2],
  //  [3, 1]]
  if (x < 0.5) return y < 0.5 ? 0.0 : 3.0;
  return y < 0.5 ? 2.0 : 1.0;
}

float bayer8(vec2 p) {
  float v = 0.0;
  float scale = 1.0;
  for (int i = 0; i < 3; i++) {
    v += bayer2(p) * scale;
    scale *= 4.0;
    p = floor(p * 0.5);
  }
  return v / 64.0;
}

vec3 dither(vec2 uv, vec3 color) {
  vec2 scaledCoord = floor(uv * resolution / pixelSize);
  float threshold = bayer8(scaledCoord) - 0.25;

  float stepSize = 1.0 / (colorNum - 1.0);
  color += threshold * stepSize;

  float bias = 0.2;                                  // «поднять» тени
  color = clamp(color - bias, 0.0, 1.0);

  // квантование до colorNum уровней
  return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  // сначала «пикселизация»: берём цвет из левого верхнего угла блока
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec4 color = texture2D(inputBuffer, uvPixel);
  color.rgb = dither(uv, color.rgb);
  gl_FragColor = color;
}
`;
