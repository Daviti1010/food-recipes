// import {profileDropdown} from "index.ts";
import {profileDropdown} from "./profile-dropdown.js";

document.addEventListener('DOMContentLoaded', () => {
    profileDropdown();
});

const cardsContainer = document.querySelector('.cards') as HTMLDivElement;

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

async function gettingIdFromDB() {
    try {
        const response = await fetch("/favourites-send");
        const dataDB = await response.json();

        const ratingsResponse = await fetch('/display-ratings');
        const ratings = await ratingsResponse.json();

        dataDB.forEach((row: any) => {
            getMealById(row.meal_id, ratings);
        });

    } catch (err) {
        console.log(err);
    }
}

async function getMealById(mealId?: number, ratings?: any[]) {
    try {
        const response = await fetch(`/api-info/lookup/${mealId}`);
        const data = await response.json();

        const meal = data.meals[0];
        displayFoodCards(meal, ratings);

    } catch (err) {
        console.log(err);
    }
}

function displayFoodCards(meal: any, ratings?: any[]) {
    console.log(meal);

    const card1 = document.createElement("div");
    const card2 = document.createElement("div");
    const unifiedDiv = document.createElement("div");
    const foodPlusRating = document.createElement("div");
    const foodName = document.createElement("h1");
    const foodRating = document.createElement("p"); // ← added
    const foodOrigins = document.createElement("p");
    const foodIngredients = document.createElement("p");
    const seeFoodInstructions = document.createElement("a");
    const foodInstructions = document.createElement("p");
    const removeBtn = document.createElement("button");
    const removeX = '<i class="fa-solid fa-xmark"></i>';
    const cardFooter = document.createElement("div");
    cardFooter.className = "card-footer";
    cardFooter.appendChild(seeFoodInstructions);

    const img1 = document.createElement('img');
    img1.src = meal.strMealThumb;

    foodName.textContent = `${meal.strMeal}`;
    foodName.className = "food-name";

    foodOrigins.textContent = `Origin: ${meal.strArea}`;
    foodOrigins.className = "food-origins";

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        if (ingredient && ingredient !== "") {
            ingredients.push(ingredient);
        }
    }

    if (ingredients.length === 0) {
        foodIngredients.textContent = 'No ingredients listed';
    } else {
        foodIngredients.textContent = 'Ingredients: ' + ingredients.join(', ');
    }
    foodIngredients.className = 'food-ingredients';

    foodInstructions.textContent = "See instructions";
    foodInstructions.className = "food-instructions";
    seeFoodInstructions.appendChild(foodInstructions);

    foodRating.className = "food-rating";
    foodRating.textContent = 'No ratings yet';

    if (ratings) {
        const mealRatings = ratings.filter((r: any) => r.meal_id === Number(meal.idMeal));

        if (mealRatings.length > 0) {
            const total = mealRatings.reduce((sum: number, r: any) => sum + r.meal_rating, 0);
            const average = (total / mealRatings.length).toFixed(1);
            foodRating.textContent = `⭐ ${average} (${mealRatings.length} reviews)`;
        }
    }

    card1.className = `card1 card`;
    card1.appendChild(img1);

    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = removeX;

    foodPlusRating.className = "foodplusrating";
    foodPlusRating.appendChild(foodName);
    foodPlusRating.appendChild(foodRating);

    unifiedDiv.className = "unified-div";
    unifiedDiv.appendChild(card1);
    unifiedDiv.appendChild(card2);
    unifiedDiv.appendChild(removeBtn);

    card2.appendChild(foodPlusRating);
    card2.appendChild(foodOrigins);
    card2.appendChild(foodIngredients);
    card2.appendChild(seeFoodInstructions);
    card2.appendChild(cardFooter);
    card2.className = `card2 card`;

    moveToPage(seeFoodInstructions, meal);

    cardsContainer?.appendChild(unifiedDiv);

    removeBtn.addEventListener("click", async function() {
        try {
            const response = await fetch(`/remove-food/${meal.idMeal}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                unifiedDiv.remove();
            } else {
                console.log("Failed to delete meal");
            }
        } catch (err) {
            console.log(err);
        }
    });
}

function moveToPage(seeFoodInstructions: HTMLAnchorElement, meal: any) { 
      seeFoodInstructions.addEventListener("click", function(e) {

      e.preventDefault();
      window.location.href = `/instructions/${meal.strMeal.replace(/\s+/g, '-').toLowerCase()}
      ?from=favourites&id=${meal.idMeal}&name=${meal.strMeal}`;

      // console.log(foodName.textContent);
  })
}

gettingIdFromDB();

