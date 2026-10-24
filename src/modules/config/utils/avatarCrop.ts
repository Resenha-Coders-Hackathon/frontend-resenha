export function clampAvatarZoom(zoom: number): number {
  return Math.max(1, Math.min(5, zoom))
}

export function avatarCrop(
  width: number,
  height: number,
  zoom: number,
  centerX = width / 2,
  centerY = height / 2,
): { x: number; y: number; size: number } {
  const size = Math.min(width, height) / Math.max(1, zoom)
  return {
    x: Math.max(0, Math.min(width - size, centerX - size / 2)),
    y: Math.max(0, Math.min(height - size, centerY - size / 2)),
    size,
  }
}
