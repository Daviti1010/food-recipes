


const params = new URLSearchParams(window.location.search);
const mealName = params.get('name');


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


function displayMealInstructions(data: any) {

    const foodName = document.createElement('h1');
        foodName.textContent = data.meals[0].strMeal;
        foodName.className = 'food-name';

    const foodOrigin = document.createElement('p');
        foodOrigin.textContent = `Origin: ${data.meals[0].strArea}`;
        foodOrigin.className = 'food-origin';

    const foodIngredients = document.createElement('p');
    const meal = data.meals[0];
    const ingredients = [];

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

        foodIngredients.className = 'food-ingredients'; 

        
    const videoYT_A = document.createElement("a");
    videoYT_A.href = meal.strYoutube;

    const videoYT_P = document.createElement("p");
    videoYT_P.textContent = 'Click To See Youtube Video'
    videoYT_P.className = 'video-yt'

    videoYT_A.appendChild(videoYT_P);


    const img = document.createElement('img');
        img.src = data.meals[0].strMealThumb;

    const pic_div = document.createElement('div');
        pic_div.appendChild(img);
        pic_div.className = 'pic-div';

    const right_div = document.createElement('div');
        right_div.className = 'right-div';
        right_div.appendChild(foodName);
        right_div.appendChild(foodOrigin);
        right_div.appendChild(foodIngredients);
        right_div.appendChild(videoYT_A);

    const upper_div = document.createElement('div');
        upper_div.className = 'upper-div';

    const lower_div = document.createElement('div');
        lower_div.className = 'lower-div';
        const instructionsHeader = document.createElement('h2');
        instructionsHeader.textContent = 'Instructions:';
        instructionsHeader.className = 'instructions-header';
        lower_div.appendChild(instructionsHeader);


    const instructions = document.createElement('p');
        instructions.textContent = data.meals[0].strInstructions;
        instructions.className = 'instructions';
        instructions.innerHTML = data.meals[0].strInstructions.replace(/\n/g, '<br>');
        lower_div.appendChild(instructions);
    

    const unified_div = document.createElement('div');
        unified_div.className = 'unified-div';



    upper_div.appendChild(pic_div);
    upper_div.appendChild(right_div);

    unified_div.appendChild(upper_div);
    unified_div.appendChild(lower_div);

    document.body.appendChild(unified_div);
}

fetchMealInstructions(mealName);