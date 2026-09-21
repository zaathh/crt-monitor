// Accurate Mouse Coordinate Unwarping for Curved CRT Screens

export function unwarpMouseCoordinates(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  bulge: number,
  bezelEnabled: boolean,
  bezelThickness: number,
  contentWidth: number,
  contentHeight: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const px = clientX - rect.left - rect.width * 0.5;
  const py = clientY - rect.top - rect.height * 0.5;

  let halfW = rect.width * 0.5;
  let halfH = rect.height * 0.5;

  if (bezelEnabled) {
    const t = Math.max(2, bezelThickness);
    halfW = Math.max(10, halfW - t);
    halfH = Math.max(10, halfH - t);
  }

  let nx = px / halfW;
  let ny = py / halfH;

  if (bulge > 0.001) {
    const d = nx * nx + ny * ny;
    const k1 = bulge * 0.09;
    const k2 = bulge * 0.03;
    const factor = 1.0 + k1 * d + k2 * d * d;
    const scale = 1.0 + (bulge * 0.07);
    nx = (nx * factor) / scale;
    ny = (ny * factor) / scale;
  }

  const texX = nx * 0.5 + 0.5;
  const texY = ny * 0.5 + 0.5;

  return {
    x: Math.max(0, Math.min(contentWidth, texX * contentWidth)),
    y: Math.max(0, Math.min(contentHeight, texY * contentHeight))
  };
}
