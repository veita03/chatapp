const fs = require('fs');
const path = require('path');

const localesDir = path.join(process.cwd(), 'src', 'app', 'i18n', 'locales');

const masterDict = {
  sl: {
    emailTakenError: "Ta e-poštni naslov je že registriran. Poskusite se prijaviti.",
    resetError: "Napaka pri obnovi gesla. Preverite kodo ali e-pošto.",
    loginError: "Prijava ni uspela. Preverite podatke.",
    loginInvalidError: "Napačna e-pošta ali geslo.",
    registerError: "Napaka pri registraciji.",
    registerUnknownError: "Neznana napaka pri registraciji (morda e-pošta že obstaja).",
    forgotPasswordTitle: "Obnova gesla",
    loginDesc: "Pozdravljeni nazaj! Prosimo, vpišite svoje podatke.",
    registerDesc: "Ustvarite račun in se pridružite skupnosti.",
    forgotDescEmail: "Vnesite vaš e-poštni naslov za prejem 6-mestne kode za obnovo gesla.",
    forgotDescCode: "Vnesite kodo z e-pošte in izberite novo geslo.",
    newPassword: "Novo geslo",
    confirmNewPassword: "Potrdi novo geslo",
    resetCodeLabel: "6-mestna potrditvena koda z e-pošte",
    forgotPasswordLabel: "Pozabljeno geslo?",
    backToLoginLabel: "Nazaj na prijavo",
    sendCodeBtn: "Pošlji kodo na e-pošto",
    resetPassBtn: "Spremeni geslo in se prijavi"
  },
  en: {
    emailTakenError: "This email is already registered. Please try logging in.",
    resetError: "Password reset failed. Check the code or email.",
    loginError: "Login failed. Check your data.",
    loginInvalidError: "Invalid email or password.",
    registerError: "Registration error.",
    registerUnknownError: "Unknown registration error (email might exist).",
    forgotPasswordTitle: "Password Recovery",
    loginDesc: "Welcome back! Please enter your details.",
    registerDesc: "Create an account and join the community.",
    forgotDescEmail: "Enter your email address to receive a 6-digit password reset code.",
    forgotDescCode: "Enter the email code and choose a new password.",
    newPassword: "New password",
    confirmNewPassword: "Confirm new password",
    resetCodeLabel: "6-digit email confirmation code",
    forgotPasswordLabel: "Forgot password?",
    backToLoginLabel: "Back to login",
    sendCodeBtn: "Send code to email",
    resetPassBtn: "Change password and login"
  },
  de: {
    emailTakenError: "Diese E-Mail ist bereits registriert. Bitte melden Sie sich an.",
    resetError: "Passwort-Wiederherstellung fehlgeschlagen.",
    loginError: "Anmeldung fehlgeschlagen. Überprüfen Sie Ihre Daten.",
    loginInvalidError: "Falsche E-Mail oder Passwort.",
    registerError: "Registrierungsfehler.",
    registerUnknownError: "Unbekannter Registrierungsfehler.",
    forgotPasswordTitle: "Passwort wiederherstellen",
    loginDesc: "Willkommen zurück! Bitte geben Sie Ihre Daten ein.",
    registerDesc: "Erstellen Sie ein Konto und treten Sie der Community bei.",
    forgotDescEmail: "Geben Sie Ihre E-Mail-Adresse ein, um einen 6-stelligen Code zu erhalten.",
    forgotDescCode: "Geben Sie den Code ein und wählen Sie ein neues Passwort.",
    newPassword: "Neues Passwort",
    confirmNewPassword: "Neues Passwort bestätigen",
    resetCodeLabel: "6-stelliger Bestätigungscode",
    forgotPasswordLabel: "Passwort vergessen?",
    backToLoginLabel: "Zurück zur Anmeldung",
    sendCodeBtn: "Code per E-Mail senden",
    resetPassBtn: "Passwort ändern und anmelden"
  },
  hr: {
    emailTakenError: "Ova e-mail adresa je već registrirana. Pokušajte se prijaviti.",
    resetError: "Greška pri obnovi lozinke. Provjerite kod ili e-mail.",
    loginError: "Prijava nije uspjela. Provjerite podatke.",
    loginInvalidError: "Pogrešna e-mail adresa ili lozinka.",
    registerError: "Greška pri registraciji.",
    registerUnknownError: "Nepoznata greška pri registraciji.",
    forgotPasswordTitle: "Obnova lozinke",
    loginDesc: "Dobrodošli natrag! Molimo unesite svoje podatke.",
    registerDesc: "Stvorite račun i pridružite se zajednici.",
    forgotDescEmail: "Unesite svoju e-mail adresu za primanje 6-znamenkastog koda.",
    forgotDescCode: "Unesite kod iz e-maila i odaberite novu lozinku.",
    newPassword: "Nova lozinka",
    confirmNewPassword: "Potvrdi novu lozinku",
    resetCodeLabel: "6-znamenkasti kod za potvrdu",
    forgotPasswordLabel: "Zaboravljena lozinka?",
    backToLoginLabel: "Natrag na prijavu",
    sendCodeBtn: "Pošalji kod na e-mail",
    resetPassBtn: "Promijeni lozinku i prijavi se"
  },
  el: {
    emailTakenError: "Αυτό το email είναι ήδη εγγεγραμμένο.",
    resetError: "Αποτυχία επαναφοράς κωδικού.",
    loginError: "Η σύνδεση απέτυχε.",
    loginInvalidError: "Λάθος email ή κωδικός πρόσβασης.",
    registerError: "Σφάλμα εγγραφής.",
    registerUnknownError: "Άγνωστο σφάλμα.",
    forgotPasswordTitle: "Ανάκτηση κωδικού",
    loginDesc: "Καλώς ήρθατε! Παρακαλώ εισάγετε τα στοιχεία σας.",
    registerDesc: "Δημιουργήστε έναν λογαριασμό.",
    forgotDescEmail: "Εισάγετε το email σας για να λάβετε τον 6ψήφιο κωδικό.",
    forgotDescCode: "Εισάγετε τον κωδικό και επιλέξτε νέο κωδικό πρόσβασης.",
    newPassword: "Νέος κωδικός",
    confirmNewPassword: "Επιβεβαίωση νέου κωδικού",
    resetCodeLabel: "6ψήφιος κωδικός επιβεβαίωσης",
    forgotPasswordLabel: "Ξεχάσατε τον κωδικό;",
    backToLoginLabel: "Επιστροφή στη σύνδεση",
    sendCodeBtn: "Αποστολή κωδικού στο email",
    resetPassBtn: "Αλλαγή κωδικού και σύνδεση"
  }
};

masterDict.sr = masterDict.hr;
masterDict.us = masterDict.en;
masterDict.at = masterDict.de;

const allFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'));

allFiles.forEach(file => {
   const langCode = file.replace('.ts', '');
   const dictToApply = masterDict[langCode] || masterDict.en; // fallback to English
   
   if(dictToApply) {
      let content = fs.readFileSync(path.join(localesDir, file), 'utf8');
      
      let insertion = '';
      for (const [k, v] of Object.entries(dictToApply)) {
         if(!content.includes(`${k}:`)) {
            insertion += `\n    ${k}: "${v.replace(/"/g, '\\"')}",`;
         }
      }
      
      if(insertion !== '') {
          content = content.replace(/([\s\n]*)(};[\s\n]*export\s+default)/, `,$1${insertion}\n$2`);
          fs.writeFileSync(path.join(localesDir, file), content);
      }
   }
});
console.log("Auth Locales successfully mass-patched!");
