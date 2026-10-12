import type { CanchaResponse } from '@/api/model/canchaResponse';
import type { TurnoDisponible } from '@/api/model/turnoDisponible';

/**
 * Formatea una hora en formato "HH:mm:ss" a "HH:mm".
 */
export const formatearHora = (hora?: string): string => {
  if (!hora) return '--:--';
  const partes = hora.split(':');
  if (partes.length >= 2) {
    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
  }
  return hora;
};

/**
 * Formatea un monto monetario en soles peruanos.
 */
export const formatearPrecio = (monto?: number | null): string => {
  if (monto === undefined || monto === null) return 'S/ 0.00';
  return `S/ ${Number(monto).toFixed(2)}`;
};

/**
 * Convierte una hora "HH:mm:ss" o "HH:mm" a minutos desde las 00:00.
 */
export const horaAMinutos = (hora: string): number => {
  const partes = hora.split(':').map(Number);
  const h = partes[0] || 0;
  const m = partes[1] || 0;
  return h * 60 + m;
};

/**
 * Convierte minutos desde las 00:00 a formato "HH:mm:ss".
 */
export const minutosAHora = (minutos: number): string => {
  const h = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
};

/**
 * Calcula la diferencia en minutos entre dos horas "HH:mm:ss".
 */
export const diferenciaMinutos = (horaInicio: string, horaFin: string): number => {
  return horaAMinutos(horaFin) - horaAMinutos(horaInicio);
};

/**
 * Calcula el precio total de un turno en una cancha dada su fecha y horas de inicio y fin,
 * siguiendo con exactitud la lógica polimórfica de tarifas del backend.
 */
export const calcularPrecioTurno = (
  cancha: CanchaResponse,
  fecha: string,
  horaInicio: string,
  horaFin: string
): number => {
  const minutosTotales = diferenciaMinutos(horaInicio, horaFin);
  if (minutosTotales <= 0) return 0;

  const tipo = cancha.tipoTarifa || 'ESTANDAR';

  if (tipo === 'ESTANDAR') {
    const precioHora = cancha.precioHora || 0;
    const horas = minutosTotales / 60;
    return Math.round(precioHora * horas * 100) / 100;
  }

  if (tipo === 'HORA_PICO') {
    const precioNormal = cancha.precioNormal || 0;
    const precioPico = cancha.precioPico || 0;
    const inicioPico = cancha.inicioPico || '18:00:00';
    const finPico = cancha.finPico || '22:00:00';

    const iniM = horaAMinutos(horaInicio);
    const finM = horaAMinutos(horaFin);
    const pIniM = horaAMinutos(inicioPico);
    const pFinM = horaAMinutos(finPico);

    // Dividir en puntos de corte
    const puntos = [iniM, finM];
    if (pIniM > iniM && pIniM < finM) puntos.push(pIniM);
    if (pFinM > iniM && pFinM < finM) puntos.push(pFinM);
    puntos.sort((a, b) => a - b);

    let total = 0;
    for (let i = 0; i < puntos.length - 1; i++) {
      const segIni = puntos[i];
      const segFin = puntos[i + 1];
      if (segFin <= segIni) continue;

      const enPico = segIni >= pIniM && segIni < pFinM;
      const tarifa = enPico ? precioPico : precioNormal;
      const duracionHoras = (segFin - segIni) / 60;
      total += tarifa * duracionHoras;
    }

    return Math.round(total * 100) / 100;
  }

  if (tipo === 'PROMOCIONAL') {
    // Tarifa base (estándar o normal)
    const precioHoraBase = cancha.precioHora || cancha.precioNormal || 0;
    const horas = minutosTotales / 60;
    let base = precioHoraBase * horas;

    const fechaConsulta = new Date(fecha);
    const vigenteDesde = cancha.vigenteDesde ? new Date(cancha.vigenteDesde) : null;
    const vigenteHasta = cancha.vigenteHasta ? new Date(cancha.vigenteHasta) : null;

    let enVigencia = true;
    if (vigenteDesde && fechaConsulta < vigenteDesde) enVigencia = false;
    if (vigenteHasta && fechaConsulta > vigenteHasta) enVigencia = false;

    if (enVigencia) {
      const descuentoPct = cancha.porcentajeDescuento || 0;
      const descuento = (base * descuentoPct) / 100;
      base = base - descuento;
    }

    return Math.round(base * 100) / 100;
  }

  return 0;
};

export interface TurnoSlot {
  inicio: string; // "HH:mm:ss"
  fin: string; // "HH:mm:ss"
  precio: number;
  esHoraPico?: boolean;
  esPromocion?: boolean;
}

/**
 * Desglosa los rangos de disponibilidad devueltos por el backend en turnos
 * horarios regulares (por defecto 1 hora), calculando el precio de cada uno.
 */
export const generarTurnosHorarios = (
  turnosDisponibles: TurnoDisponible[],
  cancha: CanchaResponse,
  fecha: string,
  duracionMinutos = 60
): TurnoSlot[] => {
  if (!turnosDisponibles || turnosDisponibles.length === 0) return [];

  const slots: TurnoSlot[] = [];

  for (const rango of turnosDisponibles) {
    if (!rango.inicio || !rango.fin) continue;

    const rangoIni = horaAMinutos(rango.inicio);
    const rangoFin = horaAMinutos(rango.fin);

    let actual = rangoIni;
    while (actual + duracionMinutos <= rangoFin) {
      const iniStr = minutosAHora(actual);
      const finStr = minutosAHora(actual + duracionMinutos);
      const precio = calcularPrecioTurno(cancha, fecha, iniStr, finStr);

      let esHoraPico = false;
      if (cancha.tipoTarifa === 'HORA_PICO' && cancha.inicioPico && cancha.finPico) {
        const pIni = horaAMinutos(cancha.inicioPico);
        const pFin = horaAMinutos(cancha.finPico);
        if (actual >= pIni && actual < pFin) {
          esHoraPico = true;
        }
      }

      const esPromocion = cancha.tipoTarifa === 'PROMOCIONAL';

      slots.push({
        inicio: iniStr,
        fin: finStr,
        precio,
        esHoraPico,
        esPromocion,
      });

      actual += duracionMinutos;
    }
  }

  return slots;
};
