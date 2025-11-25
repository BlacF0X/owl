import { calculateDuration, formatDateTime } from '../formatters';

describe('Formatters Utils', () => {
  describe('formatDateTime', () => {
    it('should return N/A for null date', () => {
      expect(formatDateTime(null)).toBe('N/A');
    });

    it('should format valid date correctly', () => {
      // On fixe une date pour éviter les problèmes de timezone dans les tests
      // Note: Le résultat dépend de la locale du système qui lance le test (souvent UTC en CI)
      // Pour être robuste, on peut mocker la locale ou vérifier le format approximatif
      const date = '2025-11-20T10:30:00Z';
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/); // Vérifie au moins le format date
    });
  });

  describe('calculateDuration', () => {
    // Date de référence fixe pour les tests : 20 Nov 2025 à 12:00:00
    const refDate = new Date('2025-11-20T12:00:00Z');

    it('should return empty string for null input', () => {
      expect(calculateDuration(null)).toBe('');
    });

    it('should calculate exact hours', () => {
      // 2 heures avant (10:00)
      const past = '2025-11-20T10:00:00Z';
      expect(calculateDuration(past, refDate)).toBe('2h');
    });

    it('should calculate hours and minutes', () => {
      // 1h 30min avant (10:30)
      const past = '2025-11-20T10:30:00Z';
      expect(calculateDuration(past, refDate)).toBe('1h 30min');
    });

    it('should calculate minutes only', () => {
      // 45min avant (11:15)
      const past = '2025-11-20T11:15:00Z';
      expect(calculateDuration(past, refDate)).toBe('45min');
    });

    it('should handle 0 minutes difference', () => {
      const past = '2025-11-20T12:00:00Z';
      expect(calculateDuration(past, refDate)).toBe('0min');
    });

    it('should handle future dates gracefully (return 0min)', () => {
      // 10min dans le futur (impossible théoriquement mais on teste la robustesse)
      const future = '2025-11-20T12:10:00Z';
      expect(calculateDuration(future, refDate)).toBe('0min');
    });
  });
});
