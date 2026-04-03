import {profileDropdown} from "./profile-dropdown.js";

let userID: number | null = null;

const part1 = document.querySelector(".part1") as HTMLBodyElement;

const searchInput = document.querySelector('.search-input') as HTMLInputElement;
const searchBtn = document.querySelector('.search-btn') as HTMLButtonElement;

document.addEventListener('DOMContentLoaded', async () => {
    profileDropdown();
    await getUserId();
});

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        part1.innerHTML = '';
        getData(query)
        console.log(query)
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            part1.innerHTML = '';
            getData(query)
            console.log(query)
        }
    }
});

async function getUserId() {
    try {
        const response = await fetch('/api/current-user', {
            credentials: 'include'
        });

        const data = await response.json();
        userID = data.userId;

    } catch (err) {
        console.log(err);
    }

}


interface Food {
    strMeal: string;
    idMeal: string;
    [key: string]: string;
    strMealThumb: string;
    strInstructions: string;
    strYoutube: string;
}

async function getData(food: string) {
    try {
        const response = await fetch(`/api-info/search/${food}`);
        const data = await response.json();

        if (data.meals && data.meals.length > 1) { 
            data.meals.forEach((meal: Food) => {
                // console.log(meal);
                createFoodCard(meal);
            });
        } else if (data.meals && data.meals.length === 1) {
            createFoodCard(data.meals[0]);
        }
                
        const dataMeals = data.meals;

        const ratings = await getAllRatings();
        console.log(ratings);

        ratings.forEach((rating: any) => {
            dataMeals.forEach((meal: Food) => {
                if (rating.meal_id === Number(meal.idMeal)) {
                    const card = document.querySelector(`[data-meal-id="${meal.idMeal}"]`);

                    if (card) {
                        let total = Number(card.getAttribute('data-total')) || 0;
                        let count = Number(card.getAttribute('data-count')) || 0;

                        total += rating.meal_rating;
                        count += 1;

                        const average = (total / count).toFixed(1);

                        card.setAttribute('data-total', String(total));
                        card.setAttribute('data-count', String(count));

                        const ratingDisplay = card.querySelector('.food-rating');
                        if (ratingDisplay) {
                            ratingDisplay.textContent = `⭐ ${average} (${count} reviews)`;
                        }
                    }
                }
            });
        });
        
        console.log(dataMeals)
        return data;

    } catch (err) {
        console.log(err);
        return null;
    }
}

async function getAllRatings() {
    const response1 = await fetch(`/display-ratings`);
    const ratings = await response1.json();
    return ratings;
};

// getData("pizza");

async function createFoodCard(meal: Food) {

    const card1 = document.createElement("div");
    const card2 = document.createElement("div");
    const unifiedDiv = document.createElement("div");
    const foodPlusRating = document.createElement("div");
    const foodName = document.createElement("h1");
    const foodRating = document.createElement("p");
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

    if (userID === null) {
        addBtn.style.display = 'none';
    }

    unifiedDiv.setAttribute('data-meal-id', meal.idMeal);
    unifiedDiv.setAttribute('data-total', '0');
    unifiedDiv.setAttribute('data-count', '0');

    foodRating.className = "food-rating";
    foodRating.textContent = '(No ratings yet)';

    foodPlusRating.className = "foodplusrating";

    foodPlusRating.appendChild(foodName);
    foodPlusRating.appendChild(foodRating);

    unifiedDiv.className = "unified-div";

    unifiedDiv.appendChild(card1);
    unifiedDiv.appendChild(card2);
    unifiedDiv.appendChild(addBtn);

    card2.appendChild(foodPlusRating);
    card2.appendChild(foodOrigins);
    card2.appendChild(foodIngredients);
    card2.appendChild(seeFoodInstructions);
    card2.className = `card2 card`;

    part1.appendChild(unifiedDiv);

    moveToPage(seeFoodInstructions, meal);


    addBtn.addEventListener("click", async function() {
        await fetch('/favourites-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal_id: meal.idMeal })
        });
    });

}

export function moveToPage(seeFoodInstructions: HTMLAnchorElement, meal: Food) { 
        seeFoodInstructions.addEventListener("click", function(e) {

        e.preventDefault();
        window.location.href = `/instructions/${meal.strMeal.replace(/\s+/g, '-').toLowerCase()}
        ?id=${meal.idMeal}&name=${meal.strMeal}`;

        // console.log(foodName.textContent);
    })
}


