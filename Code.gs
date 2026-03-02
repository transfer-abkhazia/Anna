// Функция для безопасной записи значения (предотвращает интерпретацию как формулу)
function safeValue(value) {
  if (!value || value === '') return '';
  const str = String(value);
  // Если значение начинается с символов, которые Sheets может интерпретировать как формулу,
  // добавляем апостроф в начале
  const formulaStarters = ['=', '+', '-', '@'];
  if (formulaStarters.some(starter => str.trim().startsWith(starter))) {
    return "'" + str; // Апостроф заставляет Sheets воспринимать значение как текст
  }
  return str;
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    let data = {};
    
    // Пытаемся получить данные из разных источников
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('Данные не получены');
    }
    
    const row = [
      safeValue(data.firstName || ''),
      safeValue(data.lastName || ''),
      safeValue(data.carType || ''),
      safeValue(data.from || ''),
      safeValue(data.to || ''),
      safeValue(data.phone || ''),
      safeValue(data.contactMethod || ''),
      safeValue(data.date || ''),
      safeValue(data.time || ''),
      safeValue(data.returnTransfer || 'Нет'),
      safeValue(data.comment || '')
    ];
    
    // Находим следующую пустую строку
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    
    // Добавляем строку
    sheet.appendRow(row);
    
    // Убеждаемся, что имя и фамилия записались правильно
    const firstNameCell = sheet.getRange(newRow, 1);
    const lastNameCell = sheet.getRange(newRow, 2);
    firstNameCell.setValue(safeValue(data.firstName || ''));
    lastNameCell.setValue(safeValue(data.lastName || ''));
    firstNameCell.setNumberFormat('@'); // Формат текста
    lastNameCell.setNumberFormat('@'); // Формат текста
    
    // Специальная обработка телефона (колонка F, индекс 6)
    const phoneCell = sheet.getRange(newRow, 6);
    phoneCell.setNumberFormat('@'); // Формат текста
    phoneCell.setValue(safeValue(data.phone || ''));
    
    // contactMethod (колонка G, индекс 7)
    const contactMethodCell = sheet.getRange(newRow, 7);
    contactMethodCell.setNumberFormat('@');
    contactMethodCell.setValue(safeValue(data.contactMethod || ''));
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Функция для обработки GET-запросов (когда кто-то открывает URL напрямую)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success',
    'message': 'Сервис работает. Используйте POST-запрос для отправки данных формы.'
  })).setMimeType(ContentService.MimeType.JSON);
}
