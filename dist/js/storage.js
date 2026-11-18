const DB_NAME = 'dieta-gym';

// Persist only the profile. Derived results are always recalculated from validated inputs.
async function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('settings');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Cierra otras pestañas de la app e inténtalo de nuevo.'));
  });
}

async function transact(mode, operation) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('settings', mode);
      const request = operation(tx.objectStore('settings'));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('No se pudo guardar.'));
    });
  } finally { db.close(); }
}

export const loadProfile = () => transact('readonly', store => store.get('profile'));
export async function saveProfile(profile) {
  await transact('readwrite', store => store.put({ version: 1, data: profile }, 'profile'));
  window.dispatchEvent(new CustomEvent('profile-saved', {detail:profile}));
}
export const loadState = () => transact('readonly', store => store.get('app-state'));
export const saveState = state => transact('readwrite', store => store.put(state, 'app-state'));
// Restore profile and all registers in one transaction: never leave half a backup.
export async function restoreBackup(backup) {
  const db = await database();
  try {
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('settings','readwrite'),store=tx.objectStore('settings');
      store.put(backup.state,'app-state');
      if(backup.profile) store.put(backup.profile,'profile'); else store.delete('profile');
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
  } finally {db.close();}
}
