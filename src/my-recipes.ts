import {profileDropdown} from "./profile-dropdown.js";

document.addEventListener('DOMContentLoaded', () => {
    profileDropdown();
    loadRecipes();
});

interface recipe {
    image_url: string;
    ingredients: string;
    instructions: string;
    meal_id: number;
    name: string;
    origin: string;
    user_id: number;
    video: string
}

const searchInput = document.querySelector(".search-input") as HTMLInputElement;


searchInput.addEventListener("input", () => {

  const query = searchInput.value.toLocaleLowerCase().trim();

  const cards = document.querySelectorAll('.unified-div');

   cards.forEach(card => {
        // Get the recipe name from the card
        const recipeName = card.querySelector('.food-name')?.textContent?.toLowerCase() || '';
        
        // Show or hide based on match
        if (recipeName.includes(query)) {
            (card as HTMLElement).style.display = 'flex';
        } else {
            (card as HTMLElement).style.display = 'none';
        }
    });

});

const cards = document.querySelector(".cards") as HTMLDivElement;

async function loadRecipes() {
    try {
        const response = await fetch('/my-recipes-send');
        const recipes = await response.json();

        recipes.forEach((recipe: recipe) => {
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


function createRecipeCards(recipe: recipe) {
    const card1 = document.createElement("div") as HTMLDivElement;
    const card2 = document.createElement("div") as HTMLDivElement;
    const foodName = document.createElement("h1") as HTMLHeadingElement;
    const foodOrigins = document.createElement("p") as HTMLParagraphElement;
    const foodIngredients = document.createElement("p") as HTMLParagraphElement;
    const seeFoodInstructions = document.createElement("a") as HTMLAnchorElement;
    const foodInstructions = document.createElement("p") as HTMLParagraphElement;

    const removeBtn = document.createElement("button");
    const removeX = '<i class="fa-solid fa-xmark"></i>'

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

    removeBtn.className = 'remove-btn'
    removeBtn.innerHTML = removeX;

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
    unifiedDiv.appendChild(removeBtn);

    cards.appendChild(unifiedDiv);

    moveToPage(seeFoodInstructions, recipe)

    removeBtn.addEventListener("click", async function() {
      try {
        const response = await fetch(`/remove-my-recipe/${recipe.meal_id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          unifiedDiv.remove();
        } else {
          console.log("Failed to delete meal")
        }

      } catch (err) {
        console.log(err)
      }
    });
}

function moveToPage(seeFoodInstructions: HTMLAnchorElement, recipe: recipe) { 
      seeFoodInstructions.addEventListener("click", function(e) {

      e.preventDefault();
      localStorage.setItem('currentRecipe', JSON.stringify(recipe));
      window.location.href = `/instructions/${recipe.name.replace(/\s+/g, '-').toLowerCase()}
      ?meal_id=${recipe.meal_id}&from=my_recipes&name=${recipe.name}`;

  })
}