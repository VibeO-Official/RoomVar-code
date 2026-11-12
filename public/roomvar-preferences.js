export const defaults = { language: 'ru', replyStyle: 'balanced', textSize: 'normal', motion: true };
const languages = { ru: 'Russian', uz: 'Uzbek (Latin script)', en: 'English' };
export function replyInstruction(settings) {
  const styles = { balanced: 'Give a clear, balanced answer.', concise: 'Keep answers brief and direct.', detailed: 'Give detailed explanations and useful examples.' };
  return `Answer entirely in the language of the latest user message, without mixing languages. If the message has no identifiable language, the fallback language is ${languages[settings.language] || languages.ru}. ${styles[settings.replyStyle] || styles.balanced}`;
}
const copy = {
  ru: { greetings: ['С чего начнём?', 'Привет! Что придумаем сегодня?', 'Какие идеи воплотим?', 'Рад вас видеть!'], settings: 'Настройки', language: 'Язык', style: 'Стиль ответов', size: 'Размер текста', motion: 'Плавная анимация', balanced: 'Обычный', concise: 'Кратко', detailed: 'Подробно', normal: 'Обычный', large: 'Крупный', chat: 'ИИ-чат', history: 'История чатов', newChat: 'Новый чат', search: 'Поиск чатов', input: 'Спросить Roomvar', imageInput: 'Опишите комнату, которую хотите увидеть…', image: 'Создать изображение', gallery: 'Моя галерея', gallerySub: 'Все созданные изображения, сохранённые в вашем аккаунте.', disclaimer: 'Roomvar может ошибаться. Проверяйте размеры перед покупкой.', account: 'Ваш аккаунт', logout: 'Выйти', close: 'Закрыть', send: 'Отправить', stop: 'Остановить', signin: 'Войти', signup: 'Создать аккаунт', welcomeBack: 'С возвращением', createAccount: 'Создайте аккаунт', email: 'Электронная почта', password: 'Пароль', newUser: 'Впервые в Roomvar?', existingUser: 'Уже есть аккаунт?' },
  uz: { greetings: ['Nimadan boshlaymiz?', 'Salom! Bugun nima yaratamiz?', 'Qanday g‘oyalaringiz bor?', 'Sizni ko‘rganimdan xursandman!'], settings: 'Sozlamalar', language: 'Til', style: 'Javob uslubi', size: 'Matn o‘lchami', motion: 'Silliq animatsiya', balanced: 'Odatiy', concise: 'Qisqa', detailed: 'Batafsil', normal: 'Odatiy', large: 'Katta', chat: 'AI suhbat', history: 'Suhbatlar tarixi', newChat: 'Yangi suhbat', search: 'Suhbatlarni qidirish', input: 'Roomvar’dan so‘rang', imageInput: 'Ko‘rmoqchi bo‘lgan xonangizni tasvirlang…', image: 'Rasm yaratish', gallery: 'Mening galereyam', gallerySub: 'Hisobingizda saqlangan barcha yaratilgan rasmlar.', disclaimer: 'Roomvar xato qilishi mumkin. Xariddan oldin o‘lchamlarni tekshiring.', account: 'Hisobingiz', logout: 'Chiqish', close: 'Yopish', send: 'Yuborish', stop: 'To‘xtatish', signin: 'Kirish', signup: 'Hisob yaratish', welcomeBack: 'Xush kelibsiz', createAccount: 'Hisob yarating', email: 'Elektron pochta', password: 'Parol', newUser: 'Roomvar’da yangimisiz?', existingUser: 'Hisobingiz bormi?' },
  en: { greetings: ['Where shall we start?', 'Hello! What will we create today?', 'What ideas are on your mind?', 'Good to see you!'], settings: 'Settings', language: 'Language', style: 'Response style', size: 'Text size', motion: 'Smooth animation', balanced: 'Balanced', concise: 'Concise', detailed: 'Detailed', normal: 'Normal', large: 'Large', chat: 'AI Chat', history: 'Chat history', newChat: 'New chat', search: 'Search chats', input: 'Ask Roomvar', imageInput: 'Describe the room you want to see…', image: 'Create image', gallery: 'My gallery', gallerySub: 'Every image you’ve generated, saved to your account.', disclaimer: 'Roomvar can make mistakes. Check measurements before you buy.', account: 'Your account', logout: 'Sign out', close: 'Close', send: 'Send', stop: 'Stop', signin: 'Sign in', signup: 'Create account', welcomeBack: 'Welcome back', createAccount: 'Create your account', email: 'Email address', password: 'Password', newUser: 'New to Roomvar?', existingUser: 'Already have an account?' }
};
const navigationCopy = {
  ru: { room: 'Моя комната', photo: 'Фото комнаты', today: 'Сегодня', yesterday: 'Вчера', week: 'Предыдущие 7 дней', month: 'Предыдущие 30 дней', older: 'Ранее', noMatch: 'Чаты не найдены', noChats: 'Пока нет чатов', showMenu: 'Открыть меню', hideMenu: 'Скрыть меню' },
  uz: { room: 'Mening xonam', photo: 'Xona rasmi', today: 'Bugun', yesterday: 'Kecha', week: 'Oldingi 7 kun', month: 'Oldingi 30 kun', older: 'Avvalroq', noMatch: 'Suhbat topilmadi', noChats: 'Hozircha suhbat yo‘q', showMenu: 'Menyuni ochish', hideMenu: 'Menyuni yopish' },
  en: { room: 'My room', photo: 'Room photo', today: 'Today', yesterday: 'Yesterday', week: 'Previous 7 days', month: 'Previous 30 days', older: 'Older', noMatch: 'No matching chats', noChats: 'No chats yet', showMenu: 'Show menu', hideMenu: 'Hide menu' }
};
for (const language of Object.keys(copy)) Object.assign(copy[language], navigationCopy[language]);
const threadCopy = {
  ru: { renameChat: 'Переименовать чат', deleteChat: 'Удалить чат' },
  uz: { renameChat: 'Suhbat nomini o‘zgartirish', deleteChat: 'Suhbatni o‘chirish' },
  en: { renameChat: 'Rename chat', deleteChat: 'Delete chat' }
};
for (const language of Object.keys(copy)) Object.assign(copy[language], threadCopy[language]);
const imageCopy = {
  ru: { deleteImage: 'Удалить изображение', confirmDeleteImage: 'Удалить изображение из галереи?', emptyGallery: 'Пока нет изображений.', copy: 'Копировать изображение', download: 'Скачать изображение', redo: 'Другой вариант', copied: 'Изображение скопировано', copyFailed: 'Не удалось скопировать изображение. Проверьте разрешение браузера на буфер обмена.', downloadFailed: 'Не удалось скачать изображение.', invalidImage: 'Выберите изображение.', readImageFailed: 'Не удалось прочитать изображение.' },
  uz: { deleteImage: 'Rasmni o‘chirish', confirmDeleteImage: 'Rasm galereyadan o‘chirilsinmi?', emptyGallery: 'Hozircha rasmlar yo‘q.', copy: 'Rasmni nusxalash', download: 'Rasmni yuklab olish', redo: 'Boshqa variant', copied: 'Rasm nusxalandi', copyFailed: 'Rasm nusxalanmadi. Brauzerning bufer ruxsatini tekshiring.', downloadFailed: 'Rasmni yuklab bo‘lmadi.', invalidImage: 'Rasm tanlang.', readImageFailed: 'Rasmni o‘qib bo‘lmadi.' },
  en: { deleteImage: 'Delete image', confirmDeleteImage: 'Delete this image from your gallery?', emptyGallery: 'No images yet.', copy: 'Copy image', download: 'Download image', redo: 'Another version', copied: 'Image copied', copyFailed: 'Could not copy the image. Check your browser clipboard permission.', downloadFailed: 'Could not download the image.', invalidImage: 'Choose an image.', readImageFailed: 'Could not read that image.' }
};
for (const language of Object.keys(copy)) Object.assign(copy[language], imageCopy[language]);
export function installPreferences(doc) {
  let saved = {};
  try { saved = JSON.parse(doc.defaultView.localStorage.getItem('roomvar-preferences') || '{}'); } catch {}
  const settings = { ...defaults, ...saved };
  if (!languages[settings.language]) settings.language = defaults.language;
  const $ = id => doc.getElementById(id);
  const t = key => copy[settings.language][key] || copy.en[key] || key;
  let lastGreeting = '';
  const greet = () => {
    const choices = copy[settings.language].greetings.filter(value => value !== lastGreeting);
    lastGreeting = choices[Math.floor(Math.random() * choices.length)];
    $('greeting').textContent = lastGreeting;
  };
  const text = (selector, value) => {
    const el = doc.querySelector(selector);
    if (!el) return;
    const label = el.querySelector('.nav-label');
    if (label) { label.textContent = value; return; }
    // Replace all old text nodes, including split browser-translated text.
    for (const node of [...el.childNodes]) if (node.nodeType !== 1) node.remove();
    for (const child of [...el.children]) if (child.tagName.toLowerCase() !== 'svg') child.remove();
    el.appendChild(doc.createTextNode(value));
  };
  const apply = () => {
    doc.documentElement.lang = settings.language;
    for (const button of doc.querySelectorAll('[data-image-action]')) { button.title=t(button.dataset.imageAction); button.setAttribute('aria-label', button.title); }
    doc.body.classList.toggle('large-text', settings.textSize === 'large');
    doc.body.classList.toggle('no-motion', !settings.motion);
    doc.defaultView.parent.roomvarSetMotion?.(settings.motion);
    for (const el of doc.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const [selector, key] of Object.entries({ '.history-heading':'history', '#newChat':'newChat', '#imgMode .lbl':'image', '#attach .lbl':'photo', '#gallery h2':'gallery', '#gallery .sub':'gallerySub', '.foot-note':'disclaimer', '#accountDialog h2':'account', '#accountLogout':'logout', 'label[for=email]':'email', 'label[for=password]':'password' })) text(selector, t(key));
    $('search').placeholder = t('search'); $('input').placeholder = t($('box').classList.contains('img-mode') ? 'imageInput' : 'input');
    $('railSettings').title = t('settings'); $('openSettings').title = t('settings');
    $('closeSettings').title = t('close');
    for (const [id, key] of Object.entries({ railChat: 'chat', railRoom: 'room', railImage: 'image', railGallery: 'gallery', railAccount: 'account', logout: 'logout', attach: 'photo', imgMode: 'image' })) $(id).title = t(key);
    for (const id of ['leftToggle', 'rightToggle']) $(id).setAttribute('aria-label', t($(id).getAttribute('aria-expanded') === 'false' ? 'showMenu' : 'hideMenu'));
    $('rightClose').title = t('hideMenu');
    if ($('topTitle').textContent === 'AI Chat' || Object.values(copy).some(c => c.chat === $('topTitle').textContent)) $('topTitle').textContent = t('chat');
    greet();
    doc.dispatchEvent(new Event('roomvar:preferences'));
  };
  for (const key of ['language', 'replyStyle', 'textSize', 'motion']) {
    const el = $(key + 'Setting');
    if (key === 'motion') el.checked = settings[key]; else el.value = settings[key];
    el.addEventListener('change', () => {
      settings[key] = key === 'motion' ? el.checked : el.value;
      try { doc.defaultView.localStorage.setItem('roomvar-preferences', JSON.stringify(settings)); } catch {}
      apply();
    });
  }
  const open = () => $('settingsDialog').showModal();
  $('railSettings').onclick = open; $('openSettings').onclick = open;
  $('closeSettings').onclick = () => $('settingsDialog').close();
  $('settingsDialog').addEventListener('click', e => { if(e.target === $('settingsDialog')) { const r=e.target.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) e.target.close(); } });
  apply();
  return { settings, t, greet, restore: (values) => {
    for (const key of ['language','replyStyle','textSize','motion']) {
      if (key === 'motion' ? typeof values[key] === 'boolean' : ({language:['ru','uz','en'],replyStyle:['balanced','concise','detailed'],textSize:['normal','large']}[key].includes(values[key]))) settings[key]=values[key];
      const el=$(key+'Setting'); if(key==='motion') el.checked=settings[key]; else el.value=settings[key];
    }
    apply();
  } };
}