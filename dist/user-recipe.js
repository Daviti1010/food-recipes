// function createMealCard() {
const cards = document.querySelector(".cards");
let picDiv = document.createElement("div");
let rightDiv = document.createElement("div");
let upperDiv = document.createElement("div");
let lowerDiv = document.createElement("div");
const unifiedDiv = document.createElement("div");
let inputDiv = document.createElement("div");
inputDiv.className = 'input-div';
let browseOrDragText = document.createElement("p");
browseOrDragText.innerHTML = 'Drag & drop images here or <span class="browse">Browse</span>';
let input = document.createElement("input");
input.type = "file";
input.className = "file";
input.accept = "image/png, image/jpeg, image/jpg, image/webp";
inputDiv.appendChild(browseOrDragText);
inputDiv.appendChild(input);
addImage(input, inputDiv);
picDiv.className = 'pic-div';
picDiv.appendChild(inputDiv);
rightDiv.className = 'right-div';
upperDiv.className = 'upper-div';
lowerDiv.className = 'lower-div';
unifiedDiv.className = 'unified-div';
upperDiv.appendChild(picDiv);
upperDiv.appendChild(rightDiv);
unifiedDiv.appendChild(upperDiv);
unifiedDiv.appendChild(lowerDiv);
cards?.appendChild(unifiedDiv);
// }
// createMealCard();
function addImage(input, inputDiv) {
    inputDiv.addEventListener('click', () => {
        input.click();
    });
    input.addEventListener('change', () => {
        const file = input.files?.[0];
        console.log(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(e);
                const img = document.createElement('img');
                img.src = e.target?.result;
                img.style.width = '300px';
                img.style.height = '300px';
                inputDiv.innerHTML = '';
                inputDiv.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
    // For drag and drop
    inputDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target?.result;
                img.style.width = '300px';
                img.style.height = '300px';
                inputDiv.innerHTML = '';
                inputDiv.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
    inputDiv.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
}
export {};
//# sourceMappingURL=user-recipe.js.map