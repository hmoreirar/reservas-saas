import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../utils/emailService.js';

describe('Escape de HTML en correos', () => {
  it('escapa etiquetas HTML inyectadas por el cliente', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;'
    );
  });

  it('escapa comillas y ampersand', () => {
    expect(escapeHtml(`a & "b" 'c'`)).toBe('a &amp; &quot;b&quot; &#39;c&#39;');
  });

  it('no rompe texto normal', () => {
    expect(escapeHtml('Cliente Perez')).toBe('Cliente Perez');
  });

  it('maneja valores nulos o indefinidos', () => {
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(0)).toBe('0');
  });
});
