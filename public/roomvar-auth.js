export const MIN_PASSWORD_LENGTH = 6;
export const passwordValid = value => typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH;
export const emailValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function installPasswordAuth({ doc, sb, onUser }) {
  const $ = id => doc.getElementById(id);
  let busy = false;
  const msg = (text, error = false) => {
    $('authMsg').textContent = text;
    $('authMsg').className = 'note ' + (error ? 'err' : 'ok');
  };
  const reset = () => {
    busy = false;
    $('email').readOnly = false;
    $('email').value = ''; $('password').value = '';
    if ($('displayName')) $('displayName').value = '';
    $('authBtn').disabled = false;
    setMode('signup');
  };
  let mode = 'signup';
  const setMode = m => {
    mode = m;
    $('tabSignin')?.classList.toggle('on', m === 'signin');
    $('tabSignup')?.classList.toggle('on', m === 'signup');
    $('authTitle').innerHTML = m === 'signup' ? 'Создайте пространство своей <em>мечты</em>' : 'С возвращением в <em>Roomvar</em>';
    if ($('authSub')) $('authSub').textContent = m === 'signup' ? 'Зарегистрируйтесь и начните создавать уникальные интерьеры с помощью AI.' : 'Войдите, чтобы продолжить работу над своими интерьерами.';
    if ($('nameRow')) $('nameRow').style.display = m === 'signup' ? '' : 'none';
    $('authBtn').textContent = m === 'signup' ? 'Зарегистрироваться' : 'Войти';
    $('password').autocomplete = m === 'signup' ? 'new-password' : 'current-password';
    msg('');
  };
  if ($('pwToggle')) $('pwToggle').onclick = () => { const p = $('password'); p.type = p.type === 'password' ? 'text' : 'password'; };
  if ($('tabSignin')) $('tabSignin').onclick = () => setMode('signin');
  if ($('tabSignup')) $('tabSignup').onclick = () => setMode('signup');
  const errorText = error => {
    if (error?.status === 429) return 'Слишком много запросов. Подождите и попробуйте снова.';
    if (/invalid login credentials/i.test(error?.message || '')) return 'Неверный email или пароль.';
    if (/already registered|user already exists/i.test(error?.message || '')) return 'Этот email уже зарегистрирован. Нажмите «Войти».';
    return error?.message || 'Не удалось выполнить запрос. Попробуйте снова.';
  };
  $('email').maxLength = 255;
  if ($('googleBtn')) $('googleBtn').onclick = async () => {
    const signIn = doc.defaultView.parent?.roomvarGoogleSignIn;
    if (!signIn) { msg('Вход через Google сейчас недоступен.', true); return; }
    $('googleBtn').disabled = true; msg('');
    try {
      const { error } = await signIn();
      if (error) msg('Не удалось войти через Google. Попробуйте снова.', true);
    } catch { msg('Не удалось войти через Google. Попробуйте снова.', true); }
    finally { $('googleBtn').disabled = false; }
  };
  $('authForm').onsubmit = async event => {
    event.preventDefault();
    if (busy) return;
    const email = $('email').value.trim();
    const password = $('password').value;
    if (!emailValid(email)) { msg('Введите корректный email.', true); return; }
    if (!passwordValid(password)) { msg(`Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов.`, true); return; }
    busy = true; $('authBtn').disabled = true; msg('');
    try {
      if (mode === 'signin') {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          if (/email not confirmed/i.test(error.message || '')) throw new Error('Подтвердите email по письму, затем войдите.');
          throw error;
        }
      } else {
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: doc.defaultView.location.origin, data: { display_name: ($('displayName')?.value || '').trim().slice(0, 100) } } });
        if (error) throw error;
        if (!data.session) {
          setMode('signin');
          msg('Проверьте почту: подтвердите email по письму, затем войдите.');
          return;
        }
      }
      const { data, error: userError } = await sb.auth.getUser();
      if (userError) throw userError;
      if (!data.user) throw new Error('Не удалось выполнить вход.');
      await onUser(data.user);
    } catch (error) { msg(errorText(error), true); }
    finally { busy = false; $('authBtn').disabled = false; }
  };
  $('logout').onclick = async () => {
    const { error } = await sb.auth.signOut();
    if (error) { msg(errorText(error), true); return; }
    reset(); await onUser(null);
  };
  reset();
  const { data: listener } = sb.auth.onAuthStateChange((event, session) => {
    if (!['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)) return;
    if (!session) { reset(); void onUser(null); return; }
    setTimeout(async () => {
      const { data, error } = await sb.auth.getUser();
      if (!error) await onUser(data.user);
    }, 0);
  });
  sb.auth.getUser().then(({ data, error }) => onUser(error ? null : data.user));
  doc.defaultView.addEventListener('pagehide', () => { listener.subscription.unsubscribe(); }, { once: true });
}
