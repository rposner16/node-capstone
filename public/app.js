'use strict'

const MOCK_RECIPES = {
    "recipes": [
        {
            "id": "111",
            "name": "Chocolate chip cookies",
            "ingredients": ["flour", "eggs", "baking powder", "sugar", "chocolate chips", "vanilla", "salt", "butter"],
            "content": "djfioaew;goewhgijeiowejfijwe;fjwe;ofjweoijfa;",
            "author": "Bob Dylan",
            "comments": [
                {
                    "text": "sjdl;fajkfjl",
                    "author": "Paul McCartney"
                },
                {
                    "text": "jfksdlfjei",
                    "author": "Patti Smith"
                }
            ]
        },
        {
            "id": "112",
            "name": "Bread",
            "ingredients": ["flour", "salt", "yeast", "water", "oil"],
            "content": "djfioaew;goewhgagwegwgwgijeiowejfijwe;fjwe;ofjweoijfa;",
            "author": "David Bowie",
            "comments": [
                {
                    "text": "sjdl;fajdsfasfjl",
                    "author": "Paul McCartney"
                },
                {
                    "text": "jfaedlfjei",
                    "author": "Kate Bush"
                }
            ]
        },
        {
            "id": "113",
            "name": "Pesto",
            "ingredients": ["basil", "garlic", "parmesan", "olive oil", "pine nuts"],
            "content": "djfioaew;goewhgijeiowejfijewafwe;fjwe;ofjweoijfa;",
            "author": "Kate Bush",
            "comments": [
                {
                    "text": "sjdl;fajewael",
                    "author": "Bob Dylan"
                },
                {
                    "text": "jfagewgfjei",
                    "author": "David Bowie"
                }
            ]
        }
    ]
};

const MOCK_USERS = {
    "users": [
        {
            "firstName": "Bob",
            "lastName": "Dylan",
            "userName": "iweifjw"
        },
        {
            "firstName": "Kate",
            "lastName": "Bush",
            "userName": "iwwefwafwew"
        },
        {
            "firstName": "David",
            "lastName": "Bowie",
            "userName": "iweiasfeafjw"
        }
    ]
};

function renderSingleRecipe(recipeObj) {

    // Set up structure of page
    $('.recipe-container').append(
        `<h1>${recipeObj.name}</h1>
        <h2>By ${recipeObj.author}</h2>
        <ul class="ingredients"></ul>
        <p>${recipeObj.content}</p>
        <h3>Comments</h3>
        <form class="comment-submit-form">
            <label for="new-comment">Submit a comment:</label>
            <input type="text" name="new-comment">
        </form>
        <div class="commentSection"></div>`
    );

    // Add ingredient list
    const ingLen = recipeObj.ingredients.length;
    for (let i = 0; i < ingLen; i++) {
        $('.ingredients').append(`<li>${recipeObj.ingredients[i]}</li>`);
    }

    // Add comments
    const commLen = recipeObj.comments.length;
    for (let j = 0; j < commLen; j++) {
        const commentObj = recipeObj.comments[j];
        $('.commentSection').append(
            `<div class="comment">
                <p>${commentObj.author}: ${commentObj.text}</p>
            </div>`
        );
    }
    
}

// For now, searchResults will just be the mock data.
// Later, it'll be data returned from a get request.
function renderSearchResults(searchResults) {
    
    // Initializing empty object for storing recipe objects by id
    let recipesById = {};

    // Iterate through recipes and render them
    const recLen = searchResults.recipes.length;
    for (let i = 0; i < recLen; i++) {
        const recipeResult = searchResults.recipes[i];
        const recipeId = recipeResult.id;
        $('.search-results-container').append(
            `<div class="js-recipe-result" id="${recipeId}">
                <p>${recipeResult.name}</p>
                <p>Author: ${recipeResult.author}</p>
            </div>`
        );
        // Associating recipe object with its id in the object
        recipesById[recipeId] = recipeResult; 
    }
    $('.js-recipe-result').on('click', function(event) {
        event.preventDefault();
        // Clear out page so that recipe can be visible
        $('.search-container').empty();

        // Get recipe's id and pass its object into renderSingleRecipe 
        let a = $(event.currentTarget);
        let recipeId = a.attr('id');
        debugger;
        let recipeObj = recipesById[recipeId];
        renderSingleRecipe(recipeObj);
    })
}

// Retrieves search results from mock data for now (API later).
// When API functionality is added, you'll make a get request to the database
// using searchQuery and then pass the results to renderSearchResults.
function getSearchResults(callBack, searchQuery) {
    setTimeout(function() {
        callBack(MOCK_RECIPES);
    }, 1);
}

// Watches for a query to be submitted on the main search page 
function watchRecipeSearch() {
    
    $('.js-search-submit').on('click', function(event) {
        console.log("here");
        event.preventDefault();
        const searchQuery = $('#js-search-bar').val();
        getSearchResults(renderSearchResults, searchQuery);
    });
}

watchRecipeSearch();