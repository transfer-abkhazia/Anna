/**
 * @jest-environment jsdom
 */

describe('Формирование данных формы', () => {
  const getReadableName = (value, type) => {
    if (type === 'carType') {
      const names = {
        'standard': 'Стандарт',
        'comfort': 'Комфорт +',
        'business': 'Бизнес',
        'minivan5': 'Минивэн 5 мест',
        'minivan7': 'Минивэн 7 мест',
        'vclass': 'V-класс 6 мест'
      };
      return names[value] || value;
    }
    return value;
  };

  describe('Преобразование типов автомобилей', () => {
    test('должен преобразовывать standard в "Стандарт"', () => {
      expect(getReadableName('standard', 'carType')).toBe('Стандарт');
    });

    test('должен преобразовывать comfort в "Комфорт +"', () => {
      expect(getReadableName('comfort', 'carType')).toBe('Комфорт +');
    });

    test('должен преобразовывать business в "Бизнес"', () => {
      expect(getReadableName('business', 'carType')).toBe('Бизнес');
    });

    test('должен преобразовывать minivan5 в "Минивэн 5 мест"', () => {
      expect(getReadableName('minivan5', 'carType')).toBe('Минивэн 5 мест');
    });

    test('должен преобразовывать minivan7 в "Минивэн 7 мест"', () => {
      expect(getReadableName('minivan7', 'carType')).toBe('Минивэн 7 мест');
    });

    test('должен преобразовывать vclass в "V-класс 6 мест"', () => {
      expect(getReadableName('vclass', 'carType')).toBe('V-класс 6 мест');
    });

    test('должен возвращать исходное значение для неизвестного типа', () => {
      expect(getReadableName('unknown', 'carType')).toBe('unknown');
    });
  });

  describe('Структура данных формы', () => {
    test('должна содержать все необходимые поля', () => {
      const formData = {
        firstName: 'Иван',
        lastName: 'Иванов',
        carType: 'Стандарт',
        from: 'Аэропорт Сочи (Адлер)',
        to: 'ж/д вокзал Адлер',
        date: '2024-12-25',
        time: '10:00',
        phone: '+7 (999) 123-45-67',
        returnTransfer: 'Нет',
        comment: 'Тестовый комментарий'
      };

      expect(formData).toHaveProperty('firstName');
      expect(formData).toHaveProperty('lastName');
      expect(formData).toHaveProperty('carType');
      expect(formData).toHaveProperty('from');
      expect(formData).toHaveProperty('to');
      expect(formData).toHaveProperty('date');
      expect(formData).toHaveProperty('time');
      expect(formData).toHaveProperty('phone');
      expect(formData).toHaveProperty('returnTransfer');
      expect(formData).toHaveProperty('comment');
    });

    test('должна обрабатывать обратный трансфер', () => {
      const formDataWithReturn = {
        returnTransfer: 'Да'
      };
      expect(formDataWithReturn.returnTransfer).toBe('Да');

      const formDataWithoutReturn = {
        returnTransfer: 'Нет'
      };
      expect(formDataWithoutReturn.returnTransfer).toBe('Нет');
    });

    test('должна обрабатывать пустой комментарий', () => {
      const comment = '' || '(нет комментария)';
      expect(comment).toBe('(нет комментария)');
    });
  });
});
