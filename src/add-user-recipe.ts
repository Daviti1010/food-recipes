// function createMealCard() {
// }
// createMealCard();

const cards = document.querySelector(".cards");

let picDiv = document.createElement("div") as HTMLDivElement;
let rightDiv = document.createElement("div") as HTMLDivElement;
let upperDiv = document.createElement("div") as HTMLDivElement;
let lowerDiv = document.createElement("div") as HTMLDivElement;
const unifiedDiv = document.createElement("div") as HTMLDivElement;

let nameInput = document.createElement("input") as HTMLInputElement;
nameInput.id = 'name-input';
nameInput.placeholder = 'Name: '

let originInput = document.createElement("input") as HTMLInputElement;
originInput.id = 'origin-input';
originInput.placeholder = 'Origin: '

let ingredientsInput = document.createElement("textarea") as HTMLTextAreaElement;
ingredientsInput.id = 'ingredients-input';
ingredientsInput.placeholder = 'Ingredients: '

let ytLinkInput = document.createElement("input") as HTMLInputElement;
ytLinkInput.id = 'video-input';
ytLinkInput.placeholder = 'Youtube Link:';


let instructionsInput = document.createElement("textarea") as HTMLTextAreaElement;
instructionsInput.id = 'instructions-input';
instructionsInput.placeholder = 'Instructions: ';

let inputDiv = document.createElement("div") as HTMLDivElement;
inputDiv.className = 'input-div';

let browseOrDragText = document.createElement("p") as HTMLParagraphElement; 
browseOrDragText.innerHTML = 'Drag & drop images here or <span class="browse">Browse</span>'

let input = document.createElement("input") as HTMLInputElement;
input.type = "file";
input.className = "file";
input.accept = "image/png, image/jpeg, image/jpg, image/webp";

inputDiv.appendChild(browseOrDragText);
inputDiv.appendChild(input);


addImage(input, inputDiv);


picDiv.className = 'pic-div';
picDiv.appendChild(inputDiv);

rightDiv.className = 'right-div';
rightDiv.appendChild(nameInput);
rightDiv.appendChild(originInput);
rightDiv.appendChild(ingredientsInput);
rightDiv.appendChild(ytLinkInput);

upperDiv.className = 'upper-div';

lowerDiv.className = 'lower-div';
lowerDiv.appendChild(instructionsInput);

unifiedDiv.className = 'unified-div';

upperDiv.appendChild(picDiv);
upperDiv.appendChild(rightDiv);

unifiedDiv.appendChild(upperDiv);
unifiedDiv.appendChild(lowerDiv);


cards?.appendChild(unifiedDiv);



const save_btn = document.getElementById("save-btn");

save_btn?.addEventListener("click", async () => {
    const file = input.files?.[0]; 
    console.log(file);

    if (!file) {
        alert('Please select an image');
        return;
    }

    const formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('origin', originInput.value);
    formData.append('ingredients', ingredientsInput.value);
    formData.append('video', ytLinkInput.value);
    formData.append('instructions', instructionsInput.value);
    formData.append('image', file);


    try {
        const response = await fetch('/user-recipe/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('Success:', data);
        
    } catch (err) {
        console.error('Error:', err);
    }
});



function addImage(input: any, inputDiv: any) {
    inputDiv.addEventListener('click', (e: any) => {
        input.click();
        e.stopPropagation(); 
    });

    input.addEventListener('change', () => {
        const file = input.files?.[0];
        console.log(file);
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // console.log(e);
                const img = document.createElement('img');
                img.src = e.target?.result as string;
                img.style.width = '300px';
                img.style.height = '300px';
                
                inputDiv.innerHTML = '';
                inputDiv.appendChild(img);
            };
            
            reader.readAsDataURL(file);
        }
    });

    // For drag and drop
    inputDiv.addEventListener('drop', (e: any) => {
        e.preventDefault();
        
        const file = e.dataTransfer?.files?.[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target?.result as string;
                img.style.width = '300px';
                img.style.height = '300px';
                
                inputDiv.innerHTML = '';
                inputDiv.appendChild(img);
            };
            
            reader.readAsDataURL(file);
        }
    });

    inputDiv.addEventListener('dragover', (e: any) => {
        e.preventDefault();
    });
}