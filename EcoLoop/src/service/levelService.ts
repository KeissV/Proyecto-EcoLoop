// Sistema de niveles basado en puntos acumulados.
// Para agregar/ajustar niveles solo hay que editar esta tabla: el resto de la app
// (pantalla de reto cumplido, perfil, etc.) se calcula automaticamente a partir de ella.

export type LevelDefinition = {
  level: number;
  name: string;
  minPoints: number;
};

export const LEVELS: LevelDefinition[] = [
  { level: 0, name: "Principiante", minPoints: 0 },
  { level: 1, name: "Aprendiz Eco", minPoints: 100 },
  { level: 2, name: "Defensor", minPoints: 250 },
  { level: 3, name: "Guardian Verde", minPoints: 450 },
  { level: 4, name: "Eco Heroe", minPoints: 700 },
  { level: 5, name: "Embajador Planetario", minPoints: 1000 },
];

export type LevelInfo = {
  level: number;
  name: string;
  minPoints: number;
  nextLevelPoints: number | null;
  nextLevelName: string | null;
  pointsToNextLevel: number | null;
};

export function getLevelForPoints(points: number): LevelInfo {
  const safePoints = Number.isFinite(points) ? Math.max(0, points) : 0;

  let current = LEVELS[0];
  let currentIndex = 0;

  LEVELS.forEach((entry, index) => {
    if (safePoints >= entry.minPoints) {
      current = entry;
      currentIndex = index;
    }
  });

  const next = LEVELS[currentIndex + 1] ?? null;

  return {
    level: current.level,
    name: current.name,
    minPoints: current.minPoints,
    nextLevelPoints: next ? next.minPoints : null,
    nextLevelName: next ? next.name : null,
    pointsToNextLevel: next ? Math.max(0, next.minPoints - safePoints) : null,
  };
}

export function didLevelUp(previousPoints: number, newPoints: number) {
  const before = getLevelForPoints(previousPoints);
  const after = getLevelForPoints(newPoints);
  return after.level > before.level;
}
