/** Map a click inside an object-cover box to image pixel coordinates. */
export function objectCoverPixelAt(
  img: HTMLImageElement,
  clientX: number,
  clientY: number,
  box: DOMRect,
): { x: number; y: number } | null {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return null;

  const cw = box.width;
  const ch = box.height;
  const imageAspect = nw / nh;
  const boxAspect = cw / ch;

  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;

  if (imageAspect > boxAspect) {
    sh = nh;
    sw = nh * boxAspect;
    sx = (nw - sw) / 2;
    sy = 0;
  } else {
    sw = nw;
    sh = nw / boxAspect;
    sx = 0;
    sy = (nh - sh) / 2;
  }

  const relX = (clientX - box.left) / cw;
  const relY = (clientY - box.top) / ch;
  if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return null;

  return {
    x: Math.min(nw - 1, Math.max(0, Math.floor(sx + relX * sw))),
    y: Math.min(nh - 1, Math.max(0, Math.floor(sy + relY * sh))),
  };
}

/** Map a click inside an object-contain box to image pixel coordinates. */
export function objectContainPixelAt(
  img: HTMLImageElement,
  clientX: number,
  clientY: number,
  box: DOMRect,
): { x: number; y: number } | null {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return null;

  const cw = box.width;
  const ch = box.height;
  const scale = Math.min(cw / nw, ch / nh);
  const rw = nw * scale;
  const rh = nh * scale;
  const ox = (cw - rw) / 2;
  const oy = (ch - rh) / 2;

  const lx = clientX - box.left - ox;
  const ly = clientY - box.top - oy;
  if (lx < 0 || lx > rw || ly < 0 || ly > rh) return null;

  return {
    x: Math.min(nw - 1, Math.max(0, Math.floor(lx / scale))),
    y: Math.min(nh - 1, Math.max(0, Math.floor(ly / scale))),
  };
}

/** Undo translate(zoom) transform applied from the box center. */
export function clientAfterZoomPan(
  clientX: number,
  clientY: number,
  box: DOMRect,
  zoom: number,
  panX: number,
  panY: number,
): { x: number; y: number } {
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  return {
    x: (clientX - cx - panX) / zoom + cx,
    y: (clientY - cy - panY) / zoom + cy,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}
