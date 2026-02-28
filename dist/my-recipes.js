async function getMyRecipes() {
    try {
        const response = await fetch('/my-recipes-send');
        const recipes = await response.json();
        console.log(recipes);
        return recipes;
    }
    catch (err) {
        console.error('Error:', err);
        return null;
    }
}
getMyRecipes();
export {};
//# sourceMappingURL=my-recipes.js.map