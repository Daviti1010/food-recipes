
const params = new URLSearchParams(window.location.search);
const mealName = params.get('name');
const fromPage = params.get('from');
// console.log(fromPage);

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
}


if (fromPage === 'favourites' && mealName) {
    fetchMealInstructions(mealName);
} else {
    getUserRecipeInstructions();
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

    if (fromPage === 'favourites') {
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

    } else {
        const userData = data as UserRecipe;
        // console.log(fromPage);
        // console.log(data);
        foodName.textContent = userData.name;
        foodOrigin.textContent = `Origin: ${userData.origin}`;
        foodIngredients.textContent = `Ingredients: ${userData.ingredients}`;
        videoYT_A.href = userData.video;
        img.src = userData.image_url;
        instructions.textContent = userData.instructions;
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