import {profileDropdown} from "./profile-dropdown.js";

const params = new URLSearchParams(window.location.search);
const mealName = params.get('name');
const fromPage = params.get('from');
// console.log(fromPage);

document.addEventListener('DOMContentLoaded', () => {
    profileDropdown();
});

interface ApiMeal {
    meals: Array<{
        strMeal: string;
        strArea: string;
        strYoutube: string;
        strMealThumb: string;
        strInstructions: string;
        [key: string]: any;
    }>;
}

interface UserRecipe {
    name: string;
    origin: string;
    ingredients: string;
    video: string;
    image_url: string;
    instructions: string;
    meal_id: number
}


if (fromPage === 'my_recipes') {
    getUserRecipeInstructions();
} else {
    fetchMealInstructions(mealName);
}


function getUserRecipeInstructions() {
    const recipeString = localStorage.getItem('currentRecipe');
    const recipe = JSON.parse(recipeString || '{}');

    console.log(recipe); 

    displayMealInstructions(recipe);
};

async function fetchMealInstructions(mealName: string | null) { 
    try {
        const response = await fetch(`/api-info/search/${mealName}`);
        const data = await response.json();
        console.log(data);
        
        displayMealInstructions(data);

    } catch (err) {
        console.log(err);
    }
}


function displayMealInstructions(data: ApiMeal | UserRecipe) {

    const foodName = document.createElement('h1');
    const foodOrigin = document.createElement('p');
    const foodIngredients = document.createElement('p');
    const videoYT_A = document.createElement("a");
    const img = document.createElement('img');
    const videoYT_P = document.createElement("p");
    const pic_div = document.createElement('div');
    const right_div = document.createElement('div');
    const upper_div = document.createElement('div');
    const lower_div = document.createElement('div');
    const instructionsHeader = document.createElement('h2');
    const instructions = document.createElement('p');
    const unified_div = document.createElement('div');
    const editRecipe = document.createElement("button");
    const ratingSystem = document.createElement("div");

    if (fromPage === 'my_recipes') {
        const userData = data as UserRecipe;
        // console.log(fromPage);
        // console.log(data);
        foodName.textContent = userData.name;
        foodOrigin.textContent = `Origin: ${userData.origin}`;
        foodIngredients.textContent = `Ingredients: ${userData.ingredients}`;
        videoYT_A.href = userData.video;
        img.src = userData.image_url;
        instructions.textContent = userData.instructions;

        const penIcon = document.createElement("i");
        const text = document.createTextNode(" Edit");

        editRecipe.className = 'edit-recipe';
        penIcon.classList.add("fa-solid", "fa-pen");

        editRecipe.appendChild(penIcon);
        editRecipe.appendChild(text);

        editRecipe.addEventListener("click", () => {
            window.location.href = `/edit-recipe?meal_id=${userData.meal_id}`
            // console.log(userData)
        })

    } else {
        const apiData = data as ApiMeal;
        const meal = apiData.meals[0]!;
        // console.log(meal)
        foodName.textContent = meal.strMeal;
        foodOrigin.textContent = `Origin: ${meal.strArea}`;

        const ingredients = [];
        videoYT_A.href = meal.strYoutube;
        img.src = meal.strMealThumb;
        instructions.textContent = meal.strInstructions;
        instructions.innerHTML = meal.strInstructions.replace(/\n/g, '<br>');

        editRecipe.style.display = 'none';

        ratingSystem.id = 'rating-system';

        const star1 = document.createElement("span");
        const star2 = document.createElement("span");
        const star3 = document.createElement("span");
        const star4 = document.createElement("span");
        const star5 = document.createElement("span");
        const ratingButton = document.createElement("button");

        star1.innerHTML = '<i class="fa-solid fa-star star1"></i>'
        star2.innerHTML = '<i class="fa-solid fa-star star2"></i>'
        star3.innerHTML = '<i class="fa-solid fa-star star3"></i>'
        star4.innerHTML = '<i class="fa-solid fa-star star4"></i>'
        star5.innerHTML = '<i class="fa-solid fa-star star5"></i>'
        ratingButton.id = 'rating-button';
        ratingButton.textContent = 'Submit';
        
        ratingSystem.appendChild(star1);
        ratingSystem.appendChild(star2);
        ratingSystem.appendChild(star3);
        ratingSystem.appendChild(star4);
        ratingSystem.appendChild(star5);
        ratingSystem.appendChild(ratingButton);

        const stars = [star1, star2, star3, star4, star5];

        let selectedRating = 0;

        stars.forEach((star, index) => {

            star.addEventListener("mouseenter", () => {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.style.color = "orange";
                    } else {
                        s.style.color = "black";
                    }
                });
            });

            star.addEventListener("mouseleave", () => {
                stars.forEach((s, i) => {
                    if (i < selectedRating) {
                        s.style.color = "orange";
                    } else {
                        s.style.color = "black";
                    }
                });
            });

            star.addEventListener("click", () => {
                selectedRating = index + 1;
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.style.color = "orange";
                    } else {
                        s.style.color = "black";
                    }
                });
            });

        });


        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measurements = meal[`strMeasure${i}`];
            if (ingredient && ingredient !== "") {
                ingredients.push(measurements + " " + ingredient);
            }
        }

        if (ingredients.length === 0) {
            foodIngredients.textContent = 'No ingredients listed';
        } else {
            foodIngredients.textContent = 'Ingredients: ' + ingredients.join(', ');
        }
    }


    foodName.className = 'food-name';

    foodOrigin.className = 'food-origin';

    foodIngredients.className = 'food-ingredients'; 

    videoYT_P.textContent = 'Click To See Youtube Video'
    videoYT_P.className = 'video-yt'

    videoYT_A.appendChild(videoYT_P);

    pic_div.appendChild(img);
    pic_div.className = 'pic-div';

    right_div.className = 'right-div';
    right_div.appendChild(foodName);
    right_div.appendChild(foodOrigin);
    right_div.appendChild(foodIngredients);
    right_div.appendChild(videoYT_A);
    right_div.appendChild(ratingSystem);
    right_div.appendChild(editRecipe);

    upper_div.className = 'upper-div';

    lower_div.className = 'lower-div';
    instructionsHeader.textContent = 'Instructions:';
    instructionsHeader.className = 'instructions-header';
    lower_div.appendChild(instructionsHeader);


    instructions.className = 'instructions';
    lower_div.appendChild(instructions);

    unified_div.className = 'unified-div';


    upper_div.appendChild(pic_div);
    upper_div.appendChild(right_div);

    unified_div.appendChild(upper_div);
    unified_div.appendChild(lower_div);

    document.body.appendChild(unified_div);
}


// fetchMealInstructions(mealName);
// getUserRecipeInstructions();