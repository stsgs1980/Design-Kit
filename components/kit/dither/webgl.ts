import { VERT } from "./shaders";

/** Разбор цветов и компиляция шейдерных программ для Dither. */
/** Hex/rgb-строка → [r, g, b] в 0..1 */
export function parseColor(input: string | null | undefined): [number, number, number] | null {
  if (!input) return null;
  const value = input.trim();

  const hex = value.match(/^#?([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const raw =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((c) => c + c)
            .join("")
        : hex[1];
    return [
      parseInt(raw.slice(0, 2), 16) / 255,
      parseInt(raw.slice(2, 4), 16) / 255,
      parseInt(raw.slice(4, 6), 16) / 255,
    ];
  }

  const rgb = value.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) {
      return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
    }
  }

  return null;
}

/** Компиляция шейдера; null при ошибке компиляции. */
export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[dither] shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Линковка программы из вершинного и фрагментного шейдеров. */
export function createProgram(gl: WebGLRenderingContext, fragSource: string): WebGLProgram | null {
  const vert = createShader(gl, gl.VERTEX_SHADER, VERT);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSource);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[dither] link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
