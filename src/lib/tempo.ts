/**
 * Leituras do relógio isoladas fora dos componentes.
 *
 * As páginas do sistema são todas `force-dynamic` — renderizam uma vez por
 * requisição, então ler a hora ali é seguro. Mantendo as chamadas aqui, o
 * componente continua sendo uma função pura de seus dados.
 */

export const DIA_MS = 86_400_000;

export function agora(): number {
  return Date.now();
}

/** ISO de N dias atrás, para filtrar consultas. */
export function desdeDias(dias: number): string {
  return new Date(agora() - dias * DIA_MS).toISOString();
}

export function ehHoje(iso: string, referencia: number): boolean {
  return (
    new Date(iso).toDateString() === new Date(referencia).toDateString()
  );
}
