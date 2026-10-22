// Meta diaria de calorías y macros. Mismas fórmulas que la pestaña Cálculos de Coatrack (lib/calculos.ts allá).

export type Sex = 'F' | 'M';
export type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';

export type Profile = {
  sex: Sex;
  birth_date: string; // 'AAAA-MM-DD'
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  deficit_pct: number; // 0 = mantener
};

// Edad cumplida hoy a partir de 'AAAA-MM-DD'.
export function edad(birthDate: string, hoy = new Date()) {
  const [y, m, d] = birthDate.split('-').map(Number);
  let years = hoy.getFullYear() - y;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) years -= 1;
  return years;
}

// Metabolismo basal (kcal/día), fórmula de Mifflin-St Jeor: la más precisa de las de uso común.
export function tmb(weightKg: number, heightCm: number, age: number, sex: Sex) {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'M' ? 5 : -161);
}

// Factor de actividad: multiplica el metabolismo basal para dar el gasto calórico diario.
export const ACTIVIDAD: Record<ActivityLevel, { label: string; detalle: string; factor: number }> = {
  sedentario: { label: 'Sedentario', detalle: 'Trabajo sentado, casi sin ejercicio', factor: 1.2 },
  ligero: { label: 'Ligero', detalle: 'Ejercicio 1–3 días por semana', factor: 1.375 },
  moderado: { label: 'Moderado', detalle: 'Ejercicio 3–5 días por semana', factor: 1.55 },
  activo: { label: 'Activo', detalle: 'Ejercicio 6–7 días por semana', factor: 1.725 },
  muy_activo: { label: 'Muy activo', detalle: 'Trabajo físico + entrenamiento diario', factor: 1.9 },
};

// Qué tan rápido bajar: % que se resta del gasto diario.
export const RITMOS: { pct: number; label: string }[] = [
  { pct: 0, label: 'Mantener' },
  { pct: 10, label: 'Suave' },
  { pct: 20, label: 'Moderado' },
  { pct: 25, label: 'Rápido' },
];

// Por debajo de esto no se recomienda comer sin supervisión médica.
const PISO: Record<Sex, number> = { F: 1200, M: 1500 };

const KCAL_POR_KG = 7700; // aprox. lo que hay que dejar de comer para perder 1 kg de grasa

// Calorías del día y macros en gramos: proteína 2 g/kg con déficit (1,8 sin él) para cuidar el músculo,
// grasa 25 % de las calorías, el resto carbohidratos.
export function meta(p: Profile) {
  const basal = tmb(p.weight_kg, p.height_cm, edad(p.birth_date), p.sex);
  const gasto = basal * ACTIVIDAD[p.activity_level].factor;
  const calculada = Math.round((gasto * (1 - p.deficit_pct / 100)) / 10) * 10;
  const conPiso = p.deficit_pct > 0 && calculada < PISO[p.sex];
  const kcal = conPiso ? PISO[p.sex] : calculada;
  const proteina = Math.round(p.weight_kg * (p.deficit_pct > 0 ? 2 : 1.8));
  const grasa = Math.round((kcal * 0.25) / 9);
  const carbos = Math.max(0, Math.round((kcal - proteina * 4 - grasa * 9) / 4));
  const kgPorSemana = Math.max(0, ((gasto - kcal) * 7) / KCAL_POR_KG);
  return { basal: Math.round(basal), gasto: Math.round(gasto), kcal, proteina, grasa, carbos, kgPorSemana, conPiso };
}
