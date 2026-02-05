// Функция копирования номера телефона в буфер обмена
document.addEventListener('DOMContentLoaded', function() {
    const phoneCopyBtn = document.getElementById('phoneCopyBtn');
    if (!phoneCopyBtn) return;
    
    const copyIndicator = document.getElementById('copyIndicator');
    const phoneNumber = '8 940 772 65 90';

    phoneCopyBtn.addEventListener('click', async function() {
        try {
            // Копируем номер в буфер обмена
            await navigator.clipboard.writeText(phoneNumber.replace(/\s/g, ''));
            
            // Показываем индикатор успешного копирования
            copyIndicator.classList.add('show');
            
            // Скрываем индикатор через 2 секунды
            setTimeout(() => {
                copyIndicator.classList.remove('show');
            }, 2000);
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = phoneNumber.replace(/\s/g, '');
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                copyIndicator.classList.add('show');
                setTimeout(() => {
                    copyIndicator.classList.remove('show');
                }, 2000);
            } catch (err) {
                alert('Не удалось скопировать номер. Номер: ' + phoneNumber);
            }
            document.body.removeChild(textArea);
        }
    });
});
