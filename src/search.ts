import {profileDropdown} from "./profile-dropdown.js";

document.addEventListener('DOMContentLoaded', async () => {
    profileDropdown();
    await getUserId();
});

let userID: number | null = null;

// const openBtn = document.getElementById('openModal')! as HTMLButtonElement;
const closeBtn = document.getElementById('closeModal')! as HTMLButtonElement;
const modal = document.getElementById('modal')! as HTMLDivElement;
const errorMsg = document.getElementById('error-msg')! as HTMLHeadingElement;

const part1 = document.querySelector(".part1") as HTMLBodyElement;

const searchInput = document.querySelector('.search-input') as HTMLInputElement;
const searchBtn = document.querySelector('.search-btn') as HTMLButtonElement;

const filterBar = document.querySelector('.filter-bar') as HTMLDivElement;
const ratingFilter = document.getElementById('rating-filter') as HTMLSelectElement;

interface Food {
    strMeal: string;
    idMeal: string;
    [key: string]: string;
    strMealThumb: string;
    strInstructions: string;
    strYoutube: string;
}

let currentMeals: Food[] = [];
let currentRatings: any[] = [];

// openBtn.addEventListener('click', () => {
//     modal.classList.add("open");
// });

closeBtn.addEventListener('click', () => {
    modal.classList.remove("open");
});

ratingFilter.addEventListener("change", () => {
    if (currentMeals.length > 0) {
        renderCards(currentMeals, currentRatings);
    }
});

document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const query = tag.textContent!.trim();
        searchInput.value = query;
        part1.innerHTML = '';
        document.getElementById('results-label')!.style.display = 'block';
        getData(query);
        filterBar.style.display = 'flex';
    });
});


searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        part1.innerHTML = '';
        document.getElementById('results-label')!.style.display = 'block';
        getData(query);
        filterBar.style.display = 'flex';
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            part1.innerHTML = '';
            getData(query)
            console.log(query)
            filterBar.style.display = 'flex';
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

async function getData(food: string) {
    try {
        const response = await fetch(`/api-info/search/${food}`);
        const data = await response.json();

        if (!data.meals) return null;

        currentMeals = data.meals;
        currentRatings = await getAllRatings();

        renderCards(currentMeals, currentRatings);

        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function renderCards(meals: Food[], ratings: any[]) {
    part1.innerHTML = '';

    const sort = ratingFilter.value;
    const sorted = [...meals].sort((a, b) => {
        const ratingA = getAverageRating(a, ratings);
        const ratingB = getAverageRating(b, ratings);
        if (sort === "low") return ratingA - ratingB;
        if (sort === "high") return ratingB - ratingA;
        return 0;
    });

    sorted.forEach(meal => {
        const avg = getAverageRating(meal, ratings);
        const count = ratings.filter(r => r.meal_id === Number(meal.idMeal)).length;
        createFoodCard(meal, avg, count);
    });
}

function getAverageRating(meal: Food, ratings: any[]): number {
    const mealRatings = ratings.filter(r => r.meal_id === Number(meal.idMeal));
    if (mealRatings.length === 0) return 0;
    const total = mealRatings.reduce((sum: number, r: any) => sum + r.meal_rating, 0);
    return total / mealRatings.length;
}


async function getAllRatings() {
    const response1 = await fetch(`/display-ratings`);
    const ratings = await response1.json();
    return ratings;
};

// getData("pizza");

async function createFoodCard(meal: Food, avgRating: number = 0, ratingCount: number = 0) {

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
    const cardFooter = document.createElement("div");


    const addBtn = document.createElement("button");
    const addPlus = '<i class="fa-solid fa-plus"></i>'
    addBtn.id = 'openModal';

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

    cardFooter.className = "card-footer";
    cardFooter.appendChild(seeFoodInstructions);
    cardFooter.appendChild(addBtn);

    unifiedDiv.setAttribute('data-meal-id', meal.idMeal);
    unifiedDiv.setAttribute('data-total', '0');
    unifiedDiv.setAttribute('data-count', '0');

    foodRating.className = "food-rating";
    foodRating.textContent = ratingCount > 0
        ? `⭐ ${avgRating.toFixed(1)} (${ratingCount} reviews)`
        : '(No ratings yet)';

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
    card2.appendChild(cardFooter);
    card2.className = `card2 card`;

    part1.appendChild(unifiedDiv);

    moveToPage(seeFoodInstructions, meal);


    addBtn.addEventListener("click", async function() {
        try {
            const response = await fetch('/favourites-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meal_id: meal.idMeal })
                });

            if (!response.ok) {
                throw new Error("Failed request");
            }

            const data = await response.json();

            if (data.success) {
                modal.classList.add("open");
            } else {
                modal.classList.add("open");
                errorMsg.textContent = "Failed to add recipe to favorites. Please try again.";
                errorMsg.style.color = "red";
            }
        }   
        catch (err) {
            console.log(err);
        }
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


