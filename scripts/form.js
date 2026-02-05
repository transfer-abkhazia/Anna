// Фильтрация ошибок консоли - игнорируем ошибки, не связанные с формой
const originalError = console.error;
console.error = function(...args) {
    const message = args.join(' ');
    // Игнорируем ошибки от блокировщиков рекламы и расширений браузера
    if (!message.includes('play.google.com') && 
        !message.includes('ERR_BLOCKED_BY_CLIENT') &&
        !message.includes('chrome-extension://invalid')) {
        originalError.apply(console, args);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const priceDisplay = document.getElementById('priceDisplay');

    // Таблица цен для трансферов в Абхазию (2026 год)
    // Цены одинаковые для всех трех точек отправления: а/п Сочи, ж/д Адлер, ж/д Имеретинский курорт
    // Структура: [4х местный седан, минивэн до 6 мест, минивэн 7 мест]
    const prices = {
        'tsandrypsh': [3500, 4000, 4500],
        'gagra': [4000, 4000, 4500],
        'alakhadzy': [4500, 5000, 5500],
        'pitsunda': [5000, 5500, 6000],
        'lidzava': [5500, 6000, 6500],
        'gudauta': [5500, 6000, 6500],
        'new_afon': [6000, 6500, 7000],
        'sukhum': [6500, 7000, 7500],
        'kyndyg': [7500, 8000, 9500],
        'ochamchira': [9000, 9500, 10000]
    };

    function calculatePrice() {
        const from = fromSelect.value;
        const to = toSelect.value;
        const carType = document.querySelector('input[name="carType"]:checked').value;
        const returnTransfer = document.getElementById('returnTransfer').checked;

        if (!from || !to || from === to) {
            priceDisplay.classList.remove('show');
            return;
        }

        // Индексы для типов автомобилей
        const carTypeIndex = {
            'sedan4': 0,        // 4х местный седан
            'minivan6': 1,     // минивэн до 6 мест
            'minivan7': 2      // минивэн 7 мест
        };

        let finalPrice = 0;
        
        // Получаем цену из таблицы
        if (prices[to] && carTypeIndex[carType] !== undefined) {
            finalPrice = prices[to][carTypeIndex[carType]];
            
            // Если обратный трансфер включен, умножаем на 2
            if (returnTransfer) {
                finalPrice = finalPrice * 2;
            }
        } else {
            // Если маршрут не найден, не показываем цену
            priceDisplay.classList.remove('show');
            return;
        }
        
        const priceText = returnTransfer ? `Стоимость (туда и обратно): ${finalPrice} ₽` : `Стоимость: ${finalPrice} ₽`;
        priceDisplay.textContent = priceText;
        priceDisplay.classList.add('show');
    }

    fromSelect.addEventListener('change', calculatePrice);
    toSelect.addEventListener('change', calculatePrice);
    
    document.querySelectorAll('input[name="carType"]').forEach(radio => {
        radio.addEventListener('change', calculatePrice);
    });
    
    // Обработчик для чекбокса обратного трансфера
    document.getElementById('returnTransfer').addEventListener('change', calculatePrice);

    // Маска для телефона
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('8')) {
            value = '7' + value.slice(1);
        }
        if (value.startsWith('7')) {
            value = value.slice(0, 11);
            let formatted = '+7';
            if (value.length > 1) {
                formatted += ' (' + value.slice(1, 4);
            }
            if (value.length >= 4) {
                formatted += ') ' + value.slice(4, 7);
            }
            if (value.length >= 7) {
                formatted += '-' + value.slice(7, 9);
            }
            if (value.length >= 9) {
                formatted += '-' + value.slice(9, 11);
            }
            e.target.value = formatted;
        }
    });

    // Установка минимальной даты (сегодня)
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // URL вашего Google Apps Script веб-приложения
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXwoVxCUSlYWINDquj3vvKFmW7Tp6x6yZDa6ZdwcJP7PSo4k6OoR5PfhVF__Nuwj7dtg/exec';

    // Функция для получения читаемых названий
    function getReadableName(value, type) {
        if (type === 'carType') {
            const names = {
                'sedan4': '4х местный седан',
                'minivan6': 'Минивэн до 6 мест (мах 3 багажа)',
                'minivan7': 'Минивэн 7 мест'
            };
            return names[value] || value;
        }
        if (type === 'from' || type === 'to') {
            const select = type === 'from' ? fromSelect : toSelect;
            const option = select.querySelector(`option[value="${value}"]`);
            return option ? option.textContent : value;
        }
        return value;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const agreeCheckbox = document.getElementById('agree');
        if (!agreeCheckbox.checked) {
            alert('Необходимо согласие с политикой обработки персональных данных');
            return;
        }

        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Блокируем кнопку и показываем загрузку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            carType: getReadableName(document.querySelector('input[name="carType"]:checked').value, 'carType'),
            from: getReadableName(fromSelect.value, 'from'),
            to: getReadableName(toSelect.value, 'to'),
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            phone: document.getElementById('phone').value,
            returnTransfer: document.getElementById('returnTransfer').checked ? 'Да' : 'Нет',
            comment: document.getElementById('comment').value || '(нет комментария)'
        };

        try {
            // Отправка данных в Google Sheets
            if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
                console.log('✅ Начало отправки данных формы');
                console.log('📤 Данные для отправки:', formData);
                console.log('🔗 URL Google Apps Script:', GOOGLE_SCRIPT_URL);
                console.log('📝 Имя:', formData.firstName);
                console.log('📝 Фамилия:', formData.lastName);
                
                // Отправляем данные как JSON
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                // При no-cors мы не получим ответ, но запрос отправится
                console.log('✅ Запрос успешно отправлен в Google Sheets');
                
                // Небольшая задержка для обработки на сервере
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log('✅ Обработка завершена');
            } else {
                console.warn('⚠️ Google Script URL не настроен. Данные:', formData);
            }

            console.log('✅ Форма успешно отправлена!');
            alert('Заказ принят! Мы свяжемся с вами в ближайшее время.');
            form.reset();
            priceDisplay.classList.remove('show');
            
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            console.error('Детали ошибки:', {
                message: error.message,
                stack: error.stack,
                formData: formData
            });
            alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.\n\nОшибка: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
