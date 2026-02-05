/**
 * @jest-environment jsdom
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Загружаем HTML файл
let html = fs.readFileSync(path.join(__dirname, '../form.html'), 'utf8');
// Удаляем ссылки на внешние скрипты и стили для тестов
html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/g, '');
html = html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');

describe('Форма заказа трансфера', () => {
  let document;
  let window;
  let dom;

  beforeEach(() => {
    // Создаем DOM из HTML (отключаем загрузку внешних ресурсов)
    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost',
      pretendToBeVisual: true,
      beforeParse(window) {
        // Мокируем загрузку внешних файлов
        window.fetch = jest.fn(() => Promise.resolve({}));
      }
    });
    
    document = dom.window.document;
    window = dom.window;

    // Мокируем глобальные объекты
    global.document = document;
    global.window = window;
    window.alert = jest.fn();
    global.alert = window.alert;
    global.fetch = jest.fn(() => Promise.resolve({}));
    
    // Загружаем скрипт формы вручную
    const formScript = fs.readFileSync(path.join(__dirname, '../scripts/form.js'), 'utf8');
    const scriptElement = document.createElement('script');
    scriptElement.textContent = formScript;
    document.body.appendChild(scriptElement);
    
    // Ждем выполнения скрипта
    return new Promise(resolve => setTimeout(resolve, 200));
  });

  describe('Элементы формы', () => {
    test('должны существовать все обязательные поля', () => {
      expect(document.getElementById('firstName')).toBeTruthy();
      expect(document.getElementById('lastName')).toBeTruthy();
      expect(document.getElementById('phone')).toBeTruthy();
      expect(document.getElementById('date')).toBeTruthy();
      expect(document.getElementById('time')).toBeTruthy();
      expect(document.getElementById('from')).toBeTruthy();
      expect(document.getElementById('to')).toBeTruthy();
      expect(document.getElementById('agree')).toBeTruthy();
    });

    test('обязательные поля должны иметь атрибут required', () => {
      expect(document.getElementById('firstName').hasAttribute('required')).toBe(true);
      expect(document.getElementById('lastName').hasAttribute('required')).toBe(true);
      expect(document.getElementById('phone').hasAttribute('required')).toBe(true);
      expect(document.getElementById('date').hasAttribute('required')).toBe(true);
      expect(document.getElementById('time').hasAttribute('required')).toBe(true);
    });

    test('должны существовать все типы автомобилей', () => {
      const carTypes = document.querySelectorAll('input[name="carType"]');
      expect(carTypes.length).toBe(3);
      
      const expectedTypes = ['sedan4', 'minivan6', 'minivan7'];
      carTypes.forEach(radio => {
        expect(expectedTypes).toContain(radio.value);
      });
    });
  });

  describe('Валидация формы', () => {
    test('форма не должна отправляться без согласия', async () => {
      const form = document.getElementById('orderForm');
      const agreeCheckbox = document.getElementById('agree');
      
      agreeCheckbox.checked = false;
      
      // Ждем, пока скрипты загрузятся
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const submitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
      
      // Ждем выполнения обработчика
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(window.alert).toHaveBeenCalledWith('Необходимо согласие с политикой обработки персональных данных');
    });
  });

  describe('Маска телефона', () => {
    test('должна форматировать номер телефона', async () => {
      const phoneInput = document.getElementById('phone');
      
      // Ждем загрузки скрипта
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Симулируем ввод номера
      phoneInput.value = '79991234567';
      const inputEvent = new window.Event('input', { bubbles: true });
      phoneInput.dispatchEvent(inputEvent);
      
      // Проверяем, что номер отформатирован
      expect(phoneInput.value).toMatch(/\+7\s*\(\d{3}\)\s*\d{3}-\d{2}-\d{2}/);
    });

    test('должна обрабатывать номер начинающийся с 8', async () => {
      const phoneInput = document.getElementById('phone');
      
      // Ждем загрузки скрипта
      await new Promise(resolve => setTimeout(resolve, 200));
      
      phoneInput.value = '89991234567';
      const inputEvent = new window.Event('input', { bubbles: true });
      phoneInput.dispatchEvent(inputEvent);
      
      expect(phoneInput.value).toContain('+7');
    });
  });

  describe('Валидация даты', () => {
    test('минимальная дата должна быть сегодня', async () => {
      const dateInput = document.getElementById('date');
      const today = new Date().toISOString().split('T')[0];
      
      // Ждем загрузки скрипта, который устанавливает min
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(dateInput.getAttribute('min')).toBe(today);
    });
  });
});
