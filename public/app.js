'use strict'

function renderRecipeEditForm(recipeObj, editForm, recNameShort, authorObj) {
    
    $(editForm).empty();
    let ingStr = recipeObj.ingredients[0];
    let ingLen = recipeObj.ingredients.length;
    if (ingLen > 1) {
        for (let i = 1; i < ingLen; i++) {
            ingStr += "," + recipeObj.ingredients[i];
        }
    }
    
    $(editForm).append(
        `<h2>Edit your recipe: </h2>
        <div class="form-input row">
            <label for="name">Name:</label>
            <input type="text" name="name" id="eName" value="${recipeObj.name}">
        </div>
        <div class="form-input row">
            <label for="ingredients">Ingredients:</label>
            <textarea name="ingredients" id="eIngredients">${ingStr}</textarea>
        </div>
        <div class="form-input row">
            <label for="content">Instructions:</label>
            <textarea name="content" id="eContent">${recipeObj.content}</textarea>
            <button type="submit" id="${recNameShort}-edit-submit">Submit changes</button>
        </div>`);
    $(`#${recNameShort}-edit-submit`).on('click', function(event) {
        event.preventDefault();
        let editObj = {
            id: recipeObj.id,
            name: $('#eName').val(),
            ingredients: $('#eIngredients').val().split(','),
            content: $('#eContent').val()
        };
        const queryString = `/recipes/myrecipes/${recipeObj.id}`;
        let init = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(editObj)
        };
        fetch(`/recipes/myrecipes/${recipeObj.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(editObj)
        })
        .then(response => {
            if (response.ok) {
                getUserRecipes(authorObj);
            }
            throw new Error(response.statusText);
        })
        .catch(err => {
            console.log(`Something went wrong: ${err.message}`);
        });
    });
}

function deleteRecipe(recipeObj, authorObj) {
    let queryString = `/recipes/myrecipes/${recipeObj.id}`;
    let init = {
        method: 'DELETE'
    };
    fetch(queryString, init)
    .then(response => {
        if (response.ok) {
            getUserRecipes(authorObj);
        }
        throw new Error(response.statusText);
    })
    .catch(err => {
        console.log(`Something went wrong: ${err.message}`);
    });
}

function addComment(recipeObj, commentSection, newComment) {
    let queryString = `/recipes/myrecipes/${recipeObj.id}`;
    recipeObj.comments.push({
        content: newComment, 
        author: {
            firstName: "Rachel",
            lastName: "Green",
            userName: "rGreen"
        }
    });
    let editObj = {
        comments: recipeObj.comments,
        id: recipeObj.id
    };
    let init = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(editObj) 
    };
    fetch(queryString, init)
    .then(response => {
        if (response.ok) {
            $(commentSection).append(
                `<div class="comment">
                    <p>rGreen: ${newComment}</p>
                </div>`
            );
        }
        throw new Error(response.statusText);
    })
    .catch(err => {
        console.log(`Something went wrong: ${err.message}`);
    });
}

// Displays a single recipe; editable is a boolean so we know whether
// we can add an edit button to the recipe or not
function renderSingleRecipe(recipeObj, recipeContainer, editable) {
    $('.search-results-container').empty();
    let authorObj;
    let recName = recipeObj.name;
    let recNameShort = recName.replace(/\s+/g, '');

    // Set up structure of page
    $(recipeContainer).append(
        `<div id="${recNameShort}" class="recipe-div">
            <h1>${recipeObj.name}</h1>
            <h2>By ${recipeObj.author.firstName} ${recipeObj.author.lastName}</h2>
        </div>`);
    let singleRecipeContainer = $(`#${recNameShort}`);
    if (editable) {
        authorObj = recipeObj.author;
        $(singleRecipeContainer).append(
            `<form id="${recNameShort}-edit-form">
                <button type="button" id="${recNameShort}-edit-button">Edit</button>
            </form>
            <button class="delete-recipe" id="${recNameShort}-delete-button">Delete recipe</button>`);
    }

    $(singleRecipeContainer).append(
        `<h3>Ingredients:</h3>
        <ul id="${recNameShort}-ingredients"></ul>
        <p>${recipeObj.content}</p>`);

    // Add ingredient list
    const ingLen = recipeObj.ingredients.length;
    let recIng = $(`#${recNameShort}-ingredients`);
    for (let i = 0; i < ingLen; i++) {
        $(recIng).append(`<li>${recipeObj.ingredients[i]}</li>`);
    }

    // Add comments
    if (!editable) {
        $(singleRecipeContainer).append(
            `<h3>Comments</h3>
            <form class="comment-submit-form">
                <label for="new-comment">Submit a comment:</label>
                <input type="text" name="new-comment" id="${recNameShort}-new-comment">
                <button type="submit" class="${recNameShort}-submit-comment">Submit</button>
            </form>
            <div id="${recNameShort}-comments"></div>`);
        const commLen = recipeObj.comments.length;
        let recComm = $(`#${recNameShort}-comments`);
        for (let j = 0; j < commLen; j++) {
            const commentObj = recipeObj.comments[j];
            $(recComm).append(
                `<div class="comment">
                    <p>${commentObj.author.userName}: ${commentObj.content}</p>
                </div>`);
        }

        $(`.${recNameShort}-submit-comment`).on('click', function(event) {
            event.preventDefault();
            let commentSection = $(`#${recNameShort}-comments`);
            let newComment = $(`#${recNameShort}-new-comment`).val();
            addComment(recipeObj, commentSection, newComment);
        });
    }
    
    $(`#${recNameShort}-edit-button`).on('click', function(event) {
        event.preventDefault();
        let editForm = $(`#${recNameShort}-edit-form`);
        renderRecipeEditForm(recipeObj, editForm, recNameShort, authorObj);
    });

    $(`#${recNameShort}-delete-button`).on('click', function(event) {
        event.preventDefault();
        deleteRecipe(recipeObj, authorObj);
    });
    
    returnToHomePage();
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
        renderSingleRecipe(responseJson, '.single-recipe-container');
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
            `<div class="js-recipe-result col-6" id="${recipeId}">
                <h2>${recipeResult.name}</h2>
                <p>Author: ${recipeResult.author.firstName} ${recipeResult.author.lastName}</p>
            </div>`);
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
    .then(responseJson => {
        console.log(responseJson);
        renderSearchResults(responseJson);
    })
    .catch(err => {
        console.log(`Something went wrong: ${err.message}`);
    });
}

function renderPostRecipeForm(authorObj) {
    $('.js-create-recipe-form').empty();
    $('.js-create-recipe-form').append(
        `<h2>Create a new recipe:</h2>
        <div class="form-input row">
            <label for="name">Name of the recipe:</label>
            <input type="text" name="name" id="rName" required>
        </div>
        <div class="form-input row">
            <label for="ingredients">Please enter your ingredients separated by commas:</label>
            <textarea name="ingredients" id="rIngredients" required></textarea>
        </div>
        <div class="form-input row">
            <label for="content">Please enter instructions for the recipe here:</label>
            <textarea name="content" id="rContent" required></textarea>
        </div>
        <button type="submit" class="js-new-recipe-submit">Submit your new recipe</button>`
    );
    let createForm = $('.js-create-recipe-form')[0];
    createForm.style.display = "block";

    $('.js-new-recipe-submit').on('click', function(event) {
        event.preventDefault();
        createForm.style.display = "none";
        let ings = $('#rIngredients').val().split(',');
        let trimmedIngs = ings.map(function(ing) {
           return ing.trim(); 
        })
        let newRecipe = {
            name: $('#rName').val(),
            ingredients: trimmedIngs,
            content: $('#rContent').val(),
            author: authorObj
        };
        const queryString = "/recipes/myrecipes";
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: newRecipe
        };
        console.log(init);
        fetch("/recipes/myrecipes", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(newRecipe)
        })
        .then(response => {
            console.log(response);
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log(responseJson);
            getUserRecipes(authorObj);
        })
        .catch(err => {
            console.log(`Something went wrong: ${err.message}`);
        });
    });
}

// Renders recipes for a single user
function renderUserRecipes(userRecipes, authorObj) {
    $('.user-recipes-container').empty();
    $('.user-recipes-container').append(
        `<h1 class="white-text">My Recipes</h1>
        <button type="button" class="js-create-recipe-button">Create a new recipe</button>
        <form class="js-create-recipe-form">
        </form>`);
    const len = userRecipes.length;
    for (let i = 0; i < len; i++) {
        renderSingleRecipe(userRecipes[i], '.user-recipes-container', true);
    }
    
    $('.js-create-recipe-button').on('click', function(event) {
        event.preventDefault();
        renderPostRecipeForm(authorObj);
    });
    returnToHomePage();
}

// Retrieves recipes for a given user from database
function getUserRecipes(userObj) {
    const queryString = `/recipes/user/?userQuery=${userObj.userName}`;
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
        console.log(responseJson);
        renderUserRecipes(responseJson, userObj);
    })
    .catch(err => {
        console.log(`Something went wrong: ${err.message}`);
    });
}

function returnToHomePage() {
    $('.homepage-button').on('click', function(event) {
        event.preventDefault();
        $('.single-recipe-container').empty();
        $('.user-recipes-container').empty();
        $('.search-container').empty();
        $('.search-results-container').empty();
        $('.search-container').append(`
            <div class="col-12">
                <h2>Find new recipes and share your own.</h2>
                <form class="see-all">
                    <button type="button" class="js-all-recipes">See all recipes</button>
                </form>
                <form class="recipe-search-form">
                    <label for="search-bar">Search for recipes: </label>
                    <input type="text" name="search-bar" id="js-search-bar" required>
                    <button type="submit" class="js-search-submit">Submit</button>
                </form>
            </div>
        `);
        watchRecipeSearch();
    });
}

// Watches for a query to be submitted on the main search page 
function watchRecipeSearch() {
    
    $('.js-search-submit').on('click', function(event) {
        event.preventDefault();
        $('.search-results-container').empty();
        const searchQuery = $('#js-search-bar').val();
        getSearchResults(searchQuery);
    });

    // .js-all-recipes is a class for a button that lets you get all the 
    // recipes in the database
    $('.js-all-recipes').on('click', function(event) {
        event.preventDefault();
        $('.search-results-container').empty();
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

    $('.user-recipes-button').on('click', function(event) {
        event.preventDefault();
        $('.search-container').empty();
        $('.search-results-container').empty();
        $('.single-recipe-container').empty();
        let userObj = {
            firstName: "Rachel",
            lastName: "Green",
            userName: "rGreen"
        };
        getUserRecipes(userObj);
    });
}

watchRecipeSearch();
