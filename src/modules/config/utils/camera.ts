export function cameraErrorMessage(error: unknown): string {
  const name = error && typeof error === 'object' && 'name' in error ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'A câmera não foi autorizada. Libere o acesso no navegador ou escolha uma foto.'
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'Nenhuma câmera foi encontrada. Você pode escolher uma foto do dispositivo.'
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'A câmera está em uso ou indisponível. Feche outros aplicativos e tente novamente.'
  }
  return 'Não foi possível abrir a câmera. Tente novamente ou escolha uma foto.'
}

export function captureSize(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, 1600 / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export function stopCamera(stream: { getTracks(): Array<{ stop(): void }> } | null): void {
  stream?.getTracks().forEach((track) => track.stop())
}
