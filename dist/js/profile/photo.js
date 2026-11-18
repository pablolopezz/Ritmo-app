// Local-only crop and compression. The original file is never uploaded.
export async function prepareAvatar(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Elige una foto JPG, PNG o WebP.');
  if(file.size>8*1024*1024)throw new Error('La foto debe ocupar como máximo 8 MB.');
  let image,url;
  try {
    if(typeof createImageBitmap==='function') image=await createImageBitmap(file);
    else {
      url=URL.createObjectURL(file);
      image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('No se pudo leer la foto.'));img.src=url;});
    }
    if(!image.width||!image.height||image.width*image.height>40000000)throw new Error('La foto es demasiado grande o no se puede leer.');
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;
    const context=canvas.getContext('2d');if(!context)throw new Error('Este navegador no permite preparar la foto.');
    const side=Math.min(image.width,image.height);
    context.fillStyle='#e2ece7';context.fillRect(0,0,320,320);
    context.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,320,320);
    const result=canvas.toDataURL('image/jpeg',.85);
    if(result.length>200000)throw new Error('No se ha podido reducir la foto. Elige otra imagen.');
    return result;
  } catch(error) {
    if(error instanceof Error && !['InvalidStateError','EncodingError'].includes(error.name))throw error;
    throw new Error('No se pudo leer la foto. Prueba con otra imagen JPG, PNG o WebP.');
  } finally {image?.close?.();if(url)URL.revokeObjectURL(url);}
}
