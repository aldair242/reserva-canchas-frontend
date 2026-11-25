import { describe, it, expect } from 'vitest';
import {
  formatearHora,
  formatearPrecio,
  calcularPrecioTurno,
  generarTurnosHorarios,
} from './tarifa';
import type { CanchaResponse } from '@/api/model/canchaResponse';

describe('tarifa utils', () => {
  it('formatea horas correctamente', () => {
    expect(formatearHora('08:00:00')).toBe('08:00');
    expect(formatearHora('19:30:00')).toBe('19:30');
    expect(formatearHora('')).toBe('--:--');
  });

  it('formatea precios correctamente en soles', () => {
    expect(formatearPrecio(80)).toBe('S/ 80.00');
    expect(formatearPrecio(45.5)).toBe('S/ 45.50');
    expect(formatearPrecio(null)).toBe('S/ 0.00');
  });

  describe('calcularPrecioTurno', () => {
    it('calcula tarifa ESTANDAR correctamente para 1 hora y 2 horas', () => {
      const cancha: CanchaResponse = {
        tipoTarifa: 'ESTANDAR',
        precioHora: 80,
      };

      const precio1h = calcularPrecioTurno(cancha, '2026-10-15', '10:00:00', '11:00:00');
      expect(precio1h).toBe(80);

      const precio2h = calcularPrecioTurno(cancha, '2026-10-15', '10:00:00', '12:00:00');
      expect(precio2h).toBe(160);

      const precioMediaHora = calcularPrecioTurno(cancha, '2026-10-15', '10:00:00', '10:30:00');
      expect(precioMediaHora).toBe(40);
    });

    it('calcula tarifa HORA_PICO fuera de pico y dentro de pico', () => {
      const cancha: CanchaResponse = {
        tipoTarifa: 'HORA_PICO',
        precioNormal: 50,
        precioPico: 80,
        inicioPico: '18:00:00',
        finPico: '22:00:00',
      };

      // Fuera de pico (10:00 a 11:00) -> 50
      const fueraPico = calcularPrecioTurno(cancha, '2026-10-15', '10:00:00', '11:00:00');
      expect(fueraPico).toBe(50);

      // Dentro de pico (19:00 a 20:00) -> 80
      const dentroPico = calcularPrecioTurno(cancha, '2026-10-15', '19:00:00', '20:00:00');
      expect(dentroPico).toBe(80);

      // Tramo mixto (17:00 a 19:00) -> 1h normal (50) + 1h pico (80) = 130
      const mixto = calcularPrecioTurno(cancha, '2026-10-15', '17:00:00', '19:00:00');
      expect(mixto).toBe(130);
    });

    it('calcula tarifa PROMOCIONAL con descuento aplicado en vigencia', () => {
      const cancha: CanchaResponse = {
        tipoTarifa: 'PROMOCIONAL',
        precioHora: 100,
        porcentajeDescuento: 20,
        vigenteDesde: '2026-01-01',
        vigenteHasta: '2026-12-31',
      };

      // Dentro de vigencia: 100 - 20% = 80
      const conDescuento = calcularPrecioTurno(cancha, '2026-06-15', '10:00:00', '11:00:00');
      expect(conDescuento).toBe(80);

      // Fuera de vigencia: precio base 100
      const fueraVigencia = calcularPrecioTurno(cancha, '2027-01-15', '10:00:00', '11:00:00');
      expect(fueraVigencia).toBe(100);
    });
  });

  describe('generarTurnosHorarios', () => {
    it('divide rangos disponibles en slots horarios de 60 minutos', () => {
      const cancha: CanchaResponse = {
        tipoTarifa: 'ESTANDAR',
        precioHora: 60,
      };

      const turnos = [
        { inicio: '08:00:00', fin: '10:00:00' },
        { inicio: '15:00:00', fin: '16:00:00' },
      ];

      const slots = generarTurnosHorarios(turnos, cancha, '2026-10-15', 60);
      expect(slots).toHaveLength(3);
      expect(slots[0]).toEqual({
        inicio: '08:00:00',
        fin: '09:00:00',
        precio: 60,
        esHoraPico: false,
        esPromocion: false,
        estado: 'DISPONIBLE',
      });
      expect(slots[1]).toEqual({
        inicio: '09:00:00',
        fin: '10:00:00',
        precio: 60,
        esHoraPico: false,
        esPromocion: false,
        estado: 'DISPONIBLE',
      });
      expect(slots[2]).toEqual({
        inicio: '15:00:00',
        fin: '16:00:00',
        precio: 60,
        esHoraPico: false,
        esPromocion: false,
        estado: 'DISPONIBLE',
      });
    });

    it('omite turnos que ya pasaron si la fecha es hoy en fallback sin apertura/cierre', () => {
      const cancha: CanchaResponse = { tipoTarifa: 'ESTANDAR', precioHora: 50 };
      const turnos = [{ inicio: '08:00:00', fin: '12:00:00' }];
      // Simular que hoy es 2026-10-12 a las 10:15
      const ahoraMock = new Date('2026-10-12T10:15:00');

      const slots = generarTurnosHorarios(turnos, cancha, '2026-10-12', 60, ahoraMock);
      // 08:00 y 09:00 ya pasaron o empezaron, solo debe quedar 11:00 (10:00 empezó a las 10:00 <= 10:15)
      expect(slots).toHaveLength(1);
      expect(slots[0].inicio).toBe('11:00:00');
      expect(slots[0].estado).toBe('DISPONIBLE');
    });

    it('genera grilla completa del día marcando turnos OCUPADO, DISPONIBLE, PASADO y BLOQUEADO', () => {
      const cancha: CanchaResponse = { tipoTarifa: 'ESTANDAR', precioHora: 80 };
      // Jornada de 08:00 a 12:00 (4 turnos)
      // Turno 08:00 a 09:00: mantenimiento
      // Turno 09:00 a 10:00: libre en turnosDisponibles
      // Turno 10:00 a 11:00: ocupado (no en turnosDisponibles)
      // Turno 11:00 a 12:00: libre en turnosDisponibles
      const turnosDisponibles = [
        { inicio: '09:00:00', fin: '10:00:00' },
        { inicio: '11:00:00', fin: '12:00:00' },
      ];
      const bloqueos = [
        {
          inicio: '2026-10-20T08:00:00',
          fin: '2026-10-20T09:00:00',
          motivo: 'Pintura y mantenimiento',
        },
      ];

      const slots = generarTurnosHorarios(
        turnosDisponibles,
        cancha,
        '2026-10-20',
        60,
        new Date('2026-10-10T10:00:00'), // fecha futura (no hoy)
        '08:00:00',
        '12:00:00',
        bloqueos
      );

      expect(slots).toHaveLength(4);
      expect(slots[0].inicio).toBe('08:00:00');
      expect(slots[0].estado).toBe('BLOQUEADO');
      expect(slots[0].motivoBloqueo).toBe('Pintura y mantenimiento');

      expect(slots[1].inicio).toBe('09:00:00');
      expect(slots[1].estado).toBe('DISPONIBLE');

      expect(slots[2].inicio).toBe('10:00:00');
      expect(slots[2].estado).toBe('OCUPADO');

      expect(slots[3].inicio).toBe('11:00:00');
      expect(slots[3].estado).toBe('DISPONIBLE');
    });

    it('marca horarios pasados como PASADO cuando la fecha consultada es hoy', () => {
      const cancha: CanchaResponse = { tipoTarifa: 'ESTANDAR', precioHora: 70 };
      const turnosDisponibles = [
        { inicio: '08:00:00', fin: '12:00:00' },
      ];
      // Simular que hoy es 2026-10-12 a las 09:30
      const ahoraMock = new Date('2026-10-12T09:30:00');

      const slots = generarTurnosHorarios(
        turnosDisponibles,
        cancha,
        '2026-10-12',
        60,
        ahoraMock,
        '08:00:00',
        '12:00:00',
        []
      );

      expect(slots).toHaveLength(4);
      // 08:00-09:00 (pasó a las 08:00 <= 09:30) -> PASADO
      expect(slots[0].estado).toBe('PASADO');
      // 09:00-10:00 (empezó a las 09:00 <= 09:30) -> PASADO
      expect(slots[1].estado).toBe('PASADO');
      // 10:00-11:00 (comienza después de 09:30) -> DISPONIBLE
      expect(slots[2].estado).toBe('DISPONIBLE');
      // 11:00-12:00 -> DISPONIBLE
      expect(slots[3].estado).toBe('DISPONIBLE');
    });

    it('retorna array vacío si no hay turnos disponibles y no se indica apertura/cierre', () => {
      const cancha: CanchaResponse = { tipoTarifa: 'ESTANDAR', precioHora: 50 };
      expect(generarTurnosHorarios([], cancha, '2026-10-15')).toEqual([]);
    });
  });
});
