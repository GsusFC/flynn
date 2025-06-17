// --- Helpers portados de Victor 2 (versión resumida) ---
//   1) calculateAngle_SmoothWaves
//   2) calculateAngle_SeaWaves
//   3) calculateAngle_GeometricPattern
// Resto de funciones se añadirán cuando se necesiten.

export function calculateAngle_SmoothWaves(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
): number {
  const normX = baseX / logicalWidth;
  const normY = baseY / logicalHeight;
  const angleOffset = Math.sin(normX * 10 + timeFactor) + Math.cos(normY * 10 + timeFactor);
  return angleOffset; // radianes directamente, no grados
}

export function calculateAngle_SeaWaves(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
  seaWaveFrequency: number,
  seaWaveAmplitude: number,
): number {
  const normX = baseX / logicalWidth;
  const normY = baseY / logicalHeight;
  const wave = Math.sin(normX * seaWaveFrequency + timeFactor * 2);
  const ripple = Math.cos(normY * 5 + timeFactor * 0.5);
  const angleOffset = (wave * 0.8 + ripple * 0.2);
  return angleOffset * seaWaveAmplitude * 0.1; // radianes, escalado apropiadamente
}

export function calculateAngle_GeometricPattern(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
): number {
  const centerX = logicalWidth / 2;
  const centerY = logicalHeight / 2;
  const dx = baseX - centerX;
  const dy = baseY - centerY;
  const angleToCenter = Math.atan2(dy, dx);
  let tangentialAngle = angleToCenter + Math.PI / 2;
  const rotationSpeed = 0.3;
  tangentialAngle += timeFactor * rotationSpeed;
  return tangentialAngle; // ya está en radianes
} 