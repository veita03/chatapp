const fs = require('fs');
const path = require('path');
const localesDir = path.join(process.cwd(), 'src', 'app', 'i18n', 'locales');

const patches = {
  es: {
    'Welcome back! Please enter your details.': '¡Bienvenido de nuevo! Por favor, introduzca sus datos.',
    'Password Recovery': 'Recuperación de contraseña',
    'Create an account and join the community.': 'Cree una cuenta y únase a la comunidad.',
    'Enter your email address to receive a 6-digit password reset code.': 'Ingrese su correo para recibir un código de 6 dígitos.',
    'Enter the email code and choose a new password.': 'Ingrese el código y elija una nueva contraseña.',
    'New password': 'Nueva contraseña',
    'Confirm new password': 'Confirmar nueva contraseña',
    '6-digit email confirmation code': 'Código de confirmación de 6 dígitos',
    'Forgot password?': '¿Olvidó su contraseña?',
    'Back to login': 'Volver al inicio de sesión',
    'Send code to email': 'Enviar código al correo',
    'Change password and login': 'Cambiar contraseña e iniciar sesión',
    'This email is already registered. Please try logging in.': 'Este correo ya está registrado.',
    'Password reset failed. Check the code or email.': 'Error al restablecer la contraseña.',
    'Login failed. Check your data.': 'Error al iniciar sesión.',
    'Invalid email or password.': 'Correo o contraseña no válidos.',
    'Registration error.': 'Error de registro.',
    'Unknown registration error (email might exist).': 'Error de registro desconocido.'
  },
  fr: {
    'Welcome back! Please enter your details.': 'Bon retour ! Veuillez saisir vos coordonnées.',
    'Password Recovery': 'Récupération de mot de passe',
    'Create an account and join the community.': 'Créez un compte et rejoignez la communauté.',
    'Enter your email address to receive a 6-digit password reset code.': 'Entrez votre e-mail pour recevoir un code de réinitialisation.',
    'Enter the email code and choose a new password.': 'Entrez le code e-mail et choisissez un nouveau mot de passe.',
    'New password': 'Nouveau mot de passe',
    'Confirm new password': 'Confirmer le nouveau mot de passe',
    '6-digit email confirmation code': 'Code de confirmation à 6 chiffres',
    'Forgot password?': 'Mot de passe oublié ?',
    'Back to login': 'Retour à la connexion',
    'Send code to email': 'Envoyer le code à l\'e-mail',
    'Change password and login': 'Changer le mot de passe et se connecter',
    'This email is already registered. Please try logging in.': 'Cet e-mail est déjà enregistré.',
    'Password reset failed. Check the code or email.': 'Échec de la réinitialisation du mot de passe.',
    'Login failed. Check your data.': 'Échec de la connexion.',
    'Invalid email or password.': 'E-mail ou mot de passe invalide.',
    'Registration error.': 'Erreur d\'inscription.',
    'Unknown registration error (email might exist).': 'Erreur d\'inscription inconnue.'
  },
  it: {
    'Welcome back! Please enter your details.': 'Bentornato! Inserisci i tuoi dettagli.',
    'Password Recovery': 'Recupero della password',
    'Create an account and join the community.': 'Crea un account e unisciti alla community.',
    'Enter your email address to receive a 6-digit password reset code.': 'Inserisci la tua email per ricevere un codice a 6 cifre.',
    'Enter the email code and choose a new password.': 'Inserisci il codice e scegli una nuova password.',
    'New password': 'Nuova password',
    'Confirm new password': 'Conferma nuova password',
    '6-digit email confirmation code': 'Codice di conferma a 6 cifre',
    'Forgot password?': 'Password dimenticata?',
    'Back to login': 'Torna al login',
    'Send code to email': 'Invia il codice',
    'Change password and login': 'Cambia password e accedi',
    'This email is already registered. Please try logging in.': 'Questa email è già registrata.',
    'Password reset failed. Check the code or email.': 'Reimpostazione della password non riuscita.',
    'Login failed. Check your data.': 'Accesso non riuscito.',
    'Invalid email or password.': 'Email o password non valide.',
    'Registration error.': 'Errore di registrazione.',
    'Unknown registration error (email might exist).': 'Errore di registrazione sconosciuto.'
  },
  nl: {
    'Welcome back! Please enter your details.': 'Welkom terug! Vul uw gegevens in.',
    'Password Recovery': 'Wachtwoordherstel',
    'Create an account and join the community.': 'Maak een account aan en word lid.',
    'Enter your email address to receive a 6-digit password reset code.': 'Vul uw e-mailadres in om een 6-cijferige code te ontvangen.',
    'Enter the email code and choose a new password.': 'Vul de code in en kies een nieuw wachtwoord.',
    'New password': 'Nieuw wachtwoord',
    'Confirm new password': 'Bevestig nieuw wachtwoord',
    '6-digit email confirmation code': '6-cijferige bevestigingscode',
    'Forgot password?': 'Wachtwoord vergeten?',
    'Back to login': 'Terug naar inloggen',
    'Send code to email': 'Stuur code naar e-mail',
    'Change password and login': 'Wijzig wachtwoord en log in',
    'This email is already registered. Please try logging in.': 'Dit e-mailadres is al geregistreerd.',
    'Password reset failed. Check the code or email.': 'Wachtwoordherstel mislukt.',
    'Login failed. Check your data.': 'Inloggen mislukt.',
    'Invalid email or password.': 'Ongeldig e-mailadres of wachtwoord.',
    'Registration error.': 'Registratiefout.',
    'Unknown registration error (email might exist).': 'Onbekende registratiefout.'
  },
  tr: {
    'Welcome back! Please enter your details.': 'Tekrar hoş geldiniz! Lütfen bilgilerinizi girin.',
    'Password Recovery': 'Şifre Kurtarma',
    'Create an account and join the community.': 'Bir hesap oluşturun ve topluluğa katılın.',
    'Enter your email address to receive a 6-digit password reset code.': '6 haneli kodu almak için e-posta adresinizi girin.',
    'Enter the email code and choose a new password.': 'Kodu girin ve yeni bir şifre seçin.',
    'New password': 'Yeni şifre',
    'Confirm new password': 'Yeni şifreyi onayla',
    '6-digit email confirmation code': '6 haneli onay kodu',
    'Forgot password?': 'Şifrenizi mi unuttunuz?',
    'Back to login': 'Giriş sayfasına dön',
    'Send code to email': 'Kodu e-postaya gönder',
    'Change password and login': 'Şifreyi değiştir ve giriş yap',
    'This email is already registered. Please try logging in.': 'Bu e-posta zaten kayıtlı.',
    'Password reset failed. Check the code or email.': 'Şifre sıfırlama başarısız oldu.',
    'Login failed. Check your data.': 'Giriş başarısız oldu.',
    'Invalid email or password.': 'Geçersiz e-posta veya şifre.',
    'Registration error.': 'Kayıt hatası.',
    'Unknown registration error (email might exist).': 'Bilinmeyen kayıt hatası.'
  }
}

patches.mx = patches.es;
patches.ar = patches.es;

for (const [lang, translations] of Object.entries(patches)) {
  const filePath = path.join(localesDir, lang + '.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [eng, loc] of Object.entries(translations)) {
      content = content.replace(new RegExp('"' + eng.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '"', 'g'), '"' + loc + '"');
    }
    fs.writeFileSync(filePath, content);
  }
}
console.log("Secondary Translations patched");
