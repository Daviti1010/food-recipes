// function createMealCard() {
    const cards = document.querySelector(".cards");

    let picDiv = document.createElement("div");
    let rightDiv = document.createElement("div");
    let upperDiv = document.createElement("div");
    let lowerDiv = document.createElement("div");
    const unifiedDiv = document.createElement("div");

    let nameInput = document.createElement("input");
    nameInput.id = 'name-input';
    nameInput.placeholder = 'Name: '

    let originInput = document.createElement("input");
    originInput.id = 'origin-input';
    originInput.placeholder = 'Origin: '

    let ingredientsInput = document.createElement("textarea");
    ingredientsInput.id = 'ingredients-input';
    ingredientsInput.placeholder = 'Ingredients: '

    let ytLinkInput = document.createElement("input");
    ytLinkInput.id = 'video-input';
    ytLinkInput.placeholder = 'Youtube Link:';


    let instructionsInput = document.createElement("textarea");
    instructionsInput.id = 'instructions-input';
    instructionsInput.placeholder = 'Instructions: ';

    let inputDiv = document.createElement("div");
    inputDiv.className = 'input-div';

    let browseOrDragText = document.createElement("p"); 
    browseOrDragText.innerHTML = 'Drag & drop images here or <span class="browse">Browse</span>'

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
// }

// createMealCard();




function addImage(input: any, inputDiv: any) {
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