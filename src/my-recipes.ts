const cards = document.querySelector(".cards") as HTMLDivElement;


async function loadRecipes() {
    try {
        const response = await fetch('/my-recipes-send');
        const recipes = await response.json();

        recipes.forEach((recipe: any) => {
            createRecipeCards(recipe);
            console.log(recipe);
        })
        
        // console.log(recipes);
        return recipes;
        
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}

loadRecipes();


function createRecipeCards(recipe: any) {
    const card1 = document.createElement("div") as HTMLDivElement;
    const card2 = document.createElement("div") as HTMLDivElement;
    const foodName = document.createElement("h1") as HTMLHeadingElement;
    const foodOrigins = document.createElement("p") as HTMLParagraphElement;
    const foodIngredients = document.createElement("p") as HTMLParagraphElement;
    const seeFoodInstructions = document.createElement("a") as HTMLAnchorElement;
    const foodInstructions = document.createElement("p") as HTMLParagraphElement;

    foodName.textContent = recipe.name;
    foodName.className = 'food-name';

    foodOrigins.textContent = `Origin: ${recipe.origin}`;
    foodOrigins.className = 'food-origins';

    foodIngredients.textContent = `Ingredients: ${recipe.ingredients}`;
    foodIngredients.className = 'food-ingredients';

    const img = document.createElement("img") as HTMLImageElement;
    img.src = recipe.image_url;

    foodInstructions.textContent = 'See instructions';
    foodInstructions.className = 'food-instructions';
    seeFoodInstructions.appendChild(foodInstructions);

    const unifiedDiv = document.createElement("div") as HTMLDivElement;

    card1.className = 'card1 card';
    card1.appendChild(img);

    card2.className = 'card2 card';
    card2.appendChild(foodName);
    card2.appendChild(foodOrigins);
    card2.appendChild(foodIngredients);
    card2.appendChild(seeFoodInstructions);

    unifiedDiv.className = 'unified-div'

    unifiedDiv.appendChild(card1);
    unifiedDiv.appendChild(card2);

    cards.appendChild(unifiedDiv);

    moveToPage(seeFoodInstructions, recipe)

}

function moveToPage(seeFoodInstructions: HTMLAnchorElement, recipe: any) { 
      seeFoodInstructions.addEventListener("click", function(e) {

      e.preventDefault();
      localStorage.setItem('currentRecipe', JSON.stringify(recipe));
      window.location.href = `/instructions/${recipe.name.replace(/\s+/g, '-').toLowerCase()}
      ?from=my_recipes&name=${recipe.name}`;

  })
}