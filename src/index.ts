const cards = document.querySelector(".cards") as HTMLBodyElement;
const part1 = document.querySelector(".part1") as HTMLBodyElement;

const search_btn = document.getElementById("search-btn") as HTMLButtonElement;
const add_btn = document.getElementById("add-btn") as HTMLButtonElement;

const searchInput = document.querySelector('.search-input') as HTMLInputElement;
const searchBtn = document.querySelector('.search-btn') as HTMLButtonElement;

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        getData(query)
        console.log(query)
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            getData(query)
        console.log(query)
        }
    }
});



// const food_instructions = document.querySelector(".food-instructions") as HTMLBodyElement;


interface Food {
    strMeal: string;
}

async function getData(food: string) {
    try {
        const response = await fetch(`/api-info/search/${food}`);
        const data = await response.json();

        if (data.meals && data.meals.length > 1) { 
            data.meals.forEach((meal: any) => {
                // console.log(meal);
                createFoodCard(meal);
            });
        } else if (data.meals && data.meals.length === 1) {
            createFoodCard(data.meals[0]);
        }

        // console.log(data.meals);
        return data;

    } catch (err) {
        console.log(err);
        return null;
    }
}

// getData("pizza");

function createFoodCard(meal: any) {

    const card1 = document.createElement("div");
    const card2 = document.createElement("div");
    const unifiedDiv = document.createElement("div");
    const foodName = document.createElement("h1");
    const foodOrigins = document.createElement("p");
    const foodIngredients = document.createElement("p");
    const seeFoodInstructions = document.createElement("a");
    const foodInstructions = document.createElement("p");

    const addBtn = document.createElement("button");
    const addPlus = '<i class="fa-solid fa-plus"></i>'

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

    addBtn.className = 'add-btn'
    addBtn.innerHTML = addPlus;

    unifiedDiv.className = "unified-div";

    unifiedDiv.appendChild(card1);
    unifiedDiv.appendChild(card2);
    unifiedDiv.appendChild(addBtn);

    card2.appendChild(foodName);
    card2.appendChild(foodOrigins);
    card2.appendChild(foodIngredients);
    card2.appendChild(seeFoodInstructions);
    card2.className = `card2 card`;

    part1.appendChild(unifiedDiv);

    moveToPage(seeFoodInstructions, meal, foodName);


    addBtn.addEventListener("click", async function() {
        await fetch('/favourites-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal_id: meal.idMeal })
        });
    });

}

export function moveToPage(seeFoodInstructions: HTMLAnchorElement, meal: any, foodName: HTMLElement) { 
        seeFoodInstructions.addEventListener("click", function(e) {

        e.preventDefault();
        window.location.href = `/instructions/${meal.strMeal.replace(/\s+/g, '-').toLowerCase()}
        ?id=${meal.idMeal}&name=${meal.strMeal}`;

        // console.log(foodName.textContent);
    })
}





add_btn.addEventListener("click", function() {
  console.log("works");
})
