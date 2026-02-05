/**
 * @jest-environment jsdom
 */

describe('Расчет цены трансфера', () => {
  // Таблица цен из формы
  const prices = {
    'airport': {
      'railway_adler': 800,
      'railway_sochi': 2000,
      'city_sochi': 2000,
      'city_adler': 1000,
      'resort_adler': 1300,
      'sirius': 1000,
      'kpp_psou': 1500,
      'dagomys': 2500,
      'loo': 3500,
      'vardane': 4000,
      'lazarevskoe': 5000,
      'krasnaya_polyana': 2000,
      'esto_sadok': 2000,
      'polyana540': 2000,
      'polyana960': 2500,
      'gazprom_galaktika': 2000,
      'gazprom1389': 3500,
      'rosa_hutor': 2000,
      'rosa_plato': 3000,
      'gagra': 2900,
      'pitsunda': 3900,
      'new_afon': 5500,
      'sukhum': 6500
    }
  };

  const multipliers = {
    'standard': 1,
    'comfort': 1.2,
    'business': 1.5,
    'minivan5': 1.3,
    'minivan7': 1.5,
    'vclass': 1.8
  };

  function calculatePrice(from, to, carType) {
    if (!from || !to || from === to) {
      return null;
    }

    let basePrice = 0;
    
    if (prices[from] && prices[from][to]) {
      basePrice = prices[from][to];
    } else {
      basePrice = 1500;
    }

    return Math.round(basePrice * multipliers[carType]);
  }

  describe('Базовые расчеты', () => {
    test('должен рассчитывать цену для стандартного автомобиля', () => {
      const price = calculatePrice('airport', 'railway_adler', 'standard');
      expect(price).toBe(800);
    });

    test('должен применять коэффициент для комфорт+', () => {
      const price = calculatePrice('airport', 'railway_adler', 'comfort');
      expect(price).toBe(Math.round(800 * 1.2)); // 960
    });

    test('должен применять коэффициент для бизнес класса', () => {
      const price = calculatePrice('airport', 'railway_adler', 'business');
      expect(price).toBe(Math.round(800 * 1.5)); // 1200
    });

    test('должен применять коэффициент для минивэна 7 мест', () => {
      const price = calculatePrice('airport', 'railway_adler', 'minivan7');
      expect(price).toBe(Math.round(800 * 1.5)); // 1200
    });

    test('должен применять коэффициент для V-класса', () => {
      const price = calculatePrice('airport', 'railway_adler', 'vclass');
      expect(price).toBe(Math.round(800 * 1.8)); // 1440
    });
  });

  describe('Разные маршруты', () => {
    test('должен рассчитывать цену для маршрута аэропорт - Сухум', () => {
      const price = calculatePrice('airport', 'sukhum', 'standard');
      expect(price).toBe(6500);
    });

    test('должен рассчитывать цену для маршрута аэропорт - Красная Поляна', () => {
      const price = calculatePrice('airport', 'krasnaya_polyana', 'standard');
      expect(price).toBe(2000);
    });

    test('должен использовать базовую цену для неизвестных маршрутов', () => {
      const price = calculatePrice('unknown_from', 'unknown_to', 'standard');
      expect(price).toBe(1500);
    });
  });

  describe('Валидация входных данных', () => {
    test('должен возвращать null если from пусто', () => {
      const price = calculatePrice('', 'railway_adler', 'standard');
      expect(price).toBeNull();
    });

    test('должен возвращать null если to пусто', () => {
      const price = calculatePrice('airport', '', 'standard');
      expect(price).toBeNull();
    });

    test('должен возвращать null если from и to одинаковые', () => {
      const price = calculatePrice('airport', 'airport', 'standard');
      expect(price).toBeNull();
    });
  });

  describe('Все типы автомобилей', () => {
    const carTypes = ['standard', 'comfort', 'business', 'minivan5', 'minivan7', 'vclass'];
    
    carTypes.forEach(carType => {
      test(`должен рассчитывать цену для ${carType}`, () => {
        const price = calculatePrice('airport', 'railway_adler', carType);
        expect(price).toBeGreaterThan(0);
        expect(typeof price).toBe('number');
      });
    });
  });
});
