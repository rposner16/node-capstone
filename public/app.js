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

// Displays a single recipe
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
                <p>${commentObj.author}: ${commentObj.content}</p>
            </div>`
        );
    }
    
}

// Sends a get request for a single recipe by id, then calls renderSingleRecipe
function getSingleRecipe(recipeId) {
    const queryString = `/recipes/${recipeId}`;
    const init = {
        method: 'GET'
    }
    fetch(queryString, init)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        renderSingleRecipe(responseJson);
    })
    .catch(err => {
        console.log(`Something went wrong: ${err.message}`);
    });
}

// Displays search results
function renderSearchResults(searchResults) {
    
    // Iterate through recipes and render them
    const recLen = searchResults.length;
    for (let i = 0; i < recLen; i++) {
        const recipeResult = searchResults[i];
        const recipeId = recipeResult.id;
        $('.search-results-container').append(
            `<div class="js-recipe-result" id="${recipeId}">
                <p>${recipeResult.name}</p>
                <p>Author: ${recipeResult.author}</p>
            </div>`
        );
    }

    $('.js-recipe-result').on('click', function(event) {
        event.preventDefault();
        // Clear out page so that recipe can be visible
        $('.search-container').empty();

        // Get recipe's id and pass it into getSingleRecipe 
        let a = $(event.currentTarget);
        let recipeId = a.attr('id');
        getSingleRecipe(recipeId);
    })
}

// Makes a get request to the database
// using searchQuery and then passes the results to renderSearchResults.
function getSearchResults(searchQuery) {
    const queryString = `/recipes/search/?searchQuery=${searchQuery}`;
    const init = {
        method: 'GET'
    };
    fetch(queryString, init)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    then(responseJson => {
        renderSearchResults(responseJson);
    })
    .catch(err => {
        console.log(`Something went wrong: ${err.message}`);
    });
}

// Watches for a query to be submitted on the main search page 
function watchRecipeSearch() {
    
    $('.js-search-submit').on('click', function(event) {
        console.log("here");
        event.preventDefault();
        const searchQuery = $('#js-search-bar').val();
        getSearchResults(searchQuery);
    });

    // .js-all-recipes is a class for a button that lets you get all the 
    // recipes in the database
    $('.js-all-recipes').on('click', function(event) {
        event.preventDefault();
        const queryString = '/recipes';
        const init = {
            method: 'GET'
        };
        fetch(queryString, init)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            renderSearchResults(responseJson);
        })
        .catch(err => {
            console.log(`Something went wrong: ${err.message}`);
        });
    });
}

watchRecipeSearch();

