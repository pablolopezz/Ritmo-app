// Aggregate the exact grams first; round only for display, never per meal.
export function shoppingList(menu,foods) {
  if(!menu) return [];
  const sums=new Map();
  for(const day of menu.days) for(const meal of day.meals) for(const item of meal.ingredients) {
    if(!Number.isFinite(item.grams)||item.grams<=0) throw new Error('Cantidad inválida en el menú.');
    const food=foods.find(f=>f.id===item.foodId);
    if(!food) throw new Error('El menú contiene un alimento que falta en la base.');
    const row=sums.get(food.id)||{foodId:food.id,name:food.name,section:food.section,grams:0};
    row.grams+=item.grams;sums.set(food.id,row);
  }
  return [...sums.values()].sort((a,b)=>a.section.localeCompare(b.section,'es')||a.name.localeCompare(b.name,'es'));
}
