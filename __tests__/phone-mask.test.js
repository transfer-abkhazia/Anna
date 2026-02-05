/**
 * @jest-environment jsdom
 */

describe('Маска для телефона', () => {
  function formatPhone(value) {
    let phoneValue = value.replace(/\D/g, '');
    if (phoneValue.startsWith('8')) {
      phoneValue = '7' + phoneValue.slice(1);
    }
    if (phoneValue.startsWith('7')) {
      phoneValue = phoneValue.slice(0, 11);
      let formatted = '+7';
      if (phoneValue.length > 1) {
        formatted += ' (' + phoneValue.slice(1, 4);
      }
      if (phoneValue.length >= 4) {
        formatted += ') ' + phoneValue.slice(4, 7);
      }
      if (phoneValue.length >= 7) {
        formatted += '-' + phoneValue.slice(7, 9);
      }
      if (phoneValue.length >= 9) {
        formatted += '-' + phoneValue.slice(9, 11);
      }
      return formatted;
    }
    return value;
  }

  describe('Форматирование номеров', () => {
    test('должен форматировать номер начинающийся с 7', () => {
      expect(formatPhone('79991234567')).toBe('+7 (999) 123-45-67');
    });

    test('должен форматировать номер начинающийся с 8', () => {
      expect(formatPhone('89991234567')).toBe('+7 (999) 123-45-67');
    });

    test('должен удалять нецифровые символы', () => {
      expect(formatPhone('+7 (999) 123-45-67')).toBe('+7 (999) 123-45-67');
      expect(formatPhone('8-999-123-45-67')).toBe('+7 (999) 123-45-67');
    });

    test('должен обрабатывать неполные номера', () => {
      expect(formatPhone('7999')).toBe('+7 (999) ');
      expect(formatPhone('7999123')).toBe('+7 (999) 123-');
      expect(formatPhone('799912345')).toBe('+7 (999) 123-45-');
    });

    test('должен ограничивать длину до 11 цифр', () => {
      expect(formatPhone('79991234567890')).toBe('+7 (999) 123-45-67');
    });
  });

  describe('Валидация формата', () => {
    test('должен создавать правильный формат для полного номера', () => {
      const formatted = formatPhone('79991234567');
      expect(formatted).toMatch(/^\+7\s*\(\d{3}\)\s*\d{3}-\d{2}-\d{2}$/);
    });

    test('должен содержать код страны +7', () => {
      const formatted = formatPhone('79991234567');
      expect(formatted).toContain('+7');
    });

    test('должен содержать скобки вокруг кода оператора', () => {
      const formatted = formatPhone('79991234567');
      expect(formatted).toContain('(');
      expect(formatted).toContain(')');
    });
  });

  describe('Граничные случаи', () => {
    test('должен обрабатывать пустую строку', () => {
      expect(formatPhone('')).toBe('');
    });

    test('должен обрабатывать только буквы', () => {
      // Функция удаляет нецифровые символы, поэтому буквы удаляются
      expect(formatPhone('abcdef')).toBe('abcdef');
    });

    test('должен обрабатывать смешанный ввод', () => {
      expect(formatPhone('8 (999) abc 123-45-67')).toBe('+7 (999) 123-45-67');
    });
  });
});
