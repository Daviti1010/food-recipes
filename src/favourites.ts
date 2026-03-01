
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
      // const id_1 = dataDB[0].meal_id
      // console.log(id_1);

      dataDB.forEach((row: any) => {
        // console.log(row.meal_id);
        getMealById(row.meal_id);
      });

      // getMealById(id_1)
      

    } catch (err) {
      console.log(err)
    }
}


// from api link
async function getMealById(mealId?: number) {
    try {
      const response = await fetch(`/api-info/lookup/${mealId}`);
      const data = await response.json();

      const meal = data.meals[0];
      // getMealById(meal)
      displayFoodCards(meal);


    } catch (err) {
      console.log(err)
    }
}


function displayFoodCards(meal: any) {
  console.log(meal);

    const card1 = document.createElement("div");
    const card2 = document.createElement("div");
    const unifiedDiv = document.createElement("div");
    const foodName = document.createElement("h1");
    const foodOrigins = document.createElement("p");
    const foodIngredients = document.createElement("p");
    const seeFoodInstructions = document.createElement("a");
    const foodInstructions = document.createElement("p");
    const removeBtn = document.createElement("button");
    const removeX = '<i class="fa-solid fa-xmark"></i>'

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
    // seeFoodInstructions.href = "#";
    seeFoodInstructions.appendChild(foodInstructions);

    card1.className = `card1 card`;
    card1.appendChild(img1);

    removeBtn.className = 'remove-btn'
    removeBtn.innerHTML = removeX;

    unifiedDiv.className = "unified-div";

    unifiedDiv.appendChild(card1);
    unifiedDiv.appendChild(card2);
    unifiedDiv.appendChild(removeBtn);

    card2.appendChild(foodName);
    card2.appendChild(foodOrigins);
    card2.appendChild(foodIngredients);
    card2.appendChild(seeFoodInstructions);
    card2.className = `card2 card`;

    card1.className = `card1 card`;
    card1.appendChild(img1);

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
          console.log("Failed to delete meal")
        }

      } catch (err) {
        console.log(err)
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


