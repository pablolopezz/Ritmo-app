import { esc } from '../utils.js';
import { heading,button } from './helpers.js';
import { avatarMarkup } from '../profile/view.js';
import { newIdentity } from '../profile/model.js';
export function settingsView(profile,appearance,offlineStatus='Preparando uso sin conexión…',native=false,identity=null) {
  const personal=identity||newIdentity(profile?.displayName||'');
  return heading('','Ajustes','Tu perfil, apariencia y copias de seguridad.')+
    `<section class="panel settings-profile"><span class="profile-avatar settings-personal-avatar">${avatarMarkup(personal,{decorative:true})}</span><div><h2>${esc(personal.displayName.trim()||'Mi perfil')}</h2><p>Foto, nombre y biografía.</p></div>${button('edit-identity','Editar perfil')}</section>
    <section class="panel settings-personalize"><h2>Personalización</h2><p class="help">Fondo, botones, texto y efecto cristal.</p>${button('personalize','Cambiar apariencia','','primary')}</section>
    <section class="panel"><h2>Alimentación y objetivos</h2><p class="help">Peso, actividad, objetivo, dieta y alergias.</p>${button('edit-profile','Editar datos y preferencias')}</section>
    <details class="panel settings-group"><summary>Copias de seguridad</summary><p class="help">Tus registros se guardan en este dispositivo. Exporta una copia antes de cambiar de navegador o desinstalar.</p><div class="settings-stack">${button('backup','Guardar copia')}<label class="file-label">Restaurar una copia<input type="file" id="restore-backup" accept="application/json,.json" aria-label="Seleccionar copia JSON para restaurar"></label></div><p class="help">La copia contiene datos personales sin cifrar. Restaurarla reemplaza los registros actuales y pide confirmación.</p></details>
    <details class="panel settings-group"><summary>Instalación y actualizaciones</summary><p class="help" id="settings-offline-status">${esc(offlineStatus)}</p>${native?'<p class="help">Actualiza instalando la nueva versión de la app.</p>':`<div class="settings-stack">${button('install','Instalar Ritmo')}${button('check-update','Buscar actualización')}</div><p class="help">En iPhone: Safari → Compartir → Añadir a pantalla de inicio.</p>${button('request-persistence','Conservar datos en este navegador')}`}</details>
    <p class="settings-footer">Ritmo 1.14 · <a href="privacy.html" target="_blank" rel="noopener">Privacidad</a></p>`;
}
