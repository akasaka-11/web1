(function () {
  'use strict';
  const button = document.getElementById('loadRecipe');
  const result = document.getElementById('recipeResult');
  if (!button || !result) return;
  button.addEventListener('click', async function () {
    if (button.disabled) return;
    button.disabled = true;
    result.setAttribute('aria-busy', 'true');
    result.textContent = 'Finding a recipe for your kitchen…';
    // A timeout always restores the control, even if the service never responds.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php', { signal: controller.signal });
      if (!response.ok) throw new Error('Recipe request failed');
      const data = await response.json();
      const meal = data.meals?.[0];
      if (!meal || typeof meal.strMeal !== 'string') throw new Error('Recipe unavailable');
      const card = document.createElement('article');
      card.className = 'recipe-card';
      if (typeof meal.strMealThumb === 'string' && meal.strMealThumb.startsWith('https://')) {
        const image = document.createElement('img');
        image.src = meal.strMealThumb;
        image.alt = meal.strMeal;
        image.loading = 'lazy';
        image.className = 'img-fluid rounded';
        image.addEventListener('error', () => image.remove(), { once: true });
        card.append(image);
      }
      const copy = document.createElement('div');
      const title = document.createElement('h3');
      title.className = 'h4';
      title.textContent = meal.strMeal;
      const category = document.createElement('p');
      category.className = 'small text-muted';
      category.textContent = (meal.strCategory || 'Meal') + ' · ' + (meal.strArea || 'International') + ' · TheMealDB';
      copy.append(title, category);
      // API strings are rendered as text; untrusted HTML is never inserted.
      if (meal.strInstructions) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Read cooking instructions';
        const instructions = document.createElement('p');
        instructions.className = 'recipe-instructions mt-3';
        instructions.textContent = meal.strInstructions;
        details.append(summary, instructions);
        copy.append(details);
      }
      if (typeof meal.strSource === 'string' && /^https:\/\//.test(meal.strSource)) {
        const source = document.createElement('a');
        source.href = meal.strSource;
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.className = 'd-inline-block mt-3';
        source.textContent = 'Original recipe ↗';
        copy.append(source);
      }
      card.append(copy);
      result.replaceChildren(card);
    } catch {
      result.textContent = 'The recipe service is unavailable right now. Check your connection and select Discover a Recipe to try again.';
    } finally {
      clearTimeout(timeout);
      result.setAttribute('aria-busy', 'false');
      button.disabled = false;
    }
  });
})();
