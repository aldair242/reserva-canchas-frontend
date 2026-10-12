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
      });
      expect(slots[1]).toEqual({
        inicio: '09:00:00',
        fin: '10:00:00',
        precio: 60,
        esHoraPico: false,
        esPromocion: false,
      });
      expect(slots[2]).toEqual({
        inicio: '15:00:00',
        fin: '16:00:00',
        precio: 60,
        esHoraPico: false,
        esPromocion: false,
      });
    });

    it('retorna array vacío si no hay turnos disponibles', () => {
      const cancha: CanchaResponse = { tipoTarifa: 'ESTANDAR', precioHora: 50 };
      expect(generarTurnosHorarios([], cancha, '2026-10-15')).toEqual([]);
    });
  });
});
