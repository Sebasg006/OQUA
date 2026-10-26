// Día que se está viendo en Inicio (null = hoy). Lo usa el "+" de la barra para anotar en ese mismo día.
let diaElegido: string | null = null;

export const setDiaElegido = (day: string | null) => {
  diaElegido = day;
};

export const getDiaElegido = () => diaElegido;
