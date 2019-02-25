'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const { Recipe } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function generateAuthorData() {
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userName: faker.random.word()
    };
}

function seedRecipeData() {
    console.info('Seeding recipe data');
    let seedData = [];
    for (let i = 0; i < 10; i++) {
        seedData.push(generateRecipeData());
    }
    return Recipe.insertMany(seedData);
}

function generateRecipeData() {

    return {
        name: faker.random.word(),
        ingredients: generateIngredients(),
        content: faker.lorem.paragraph(),
        comments: generateComments(),
        author: generateAuthorData() 
    };
}

function generateIngredients() {
    let ingArr = [];
    for (let i = 0; i < 10; i++) {
        ingArr.push(faker.random.word());
    }
    return ingArr;
}

function generateComments() {
    let commArr = [];
    for (let i = 0; i < 5; i++) {
        let commObj = {
            content: faker.lorem.sentence(),
            author: generateAuthorData()
        };
        commArr.push(commObj);
    }
    return commArr;
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('html pages and endpoints', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedRecipeData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('index.html', function() {
        it('should have HTML and status 200', function() {
            let res;
            return chai.request(app)
            .get('/index.html')
            .then(function(_res) {
                res = _res;
                expect(res).to.have.status(200);
            });
        });
    });

    describe('GET all recipes endpoint', function() {
        
        it('should return all recipes in the database', function() {
            let res;
            return chai.request(app)
            .get('/recipes')
            .then(function(_res) {
                res = _res;
                expect(res).to.have.status(200);
                expect(res.body).to.have.lengthOf.at.least(1);
                return Recipe.countDocuments();
            })
            .then(function(count) {
                expect(res.body).to.have.lengthOf(count);
            });
        });

        it('should return recipes with the correct fields', function() {
            let resRecipe;
            return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                expect(res).to.have.status(200);
                res.body.forEach(function(recipe) {
                    expect(recipe).to.be.a('object');
                    expect(recipe).to.include.keys('id', 'name', 'author', 'ingredients', 'content', 'comments');
                });
                resRecipe = res.body[0];
                return Recipe.findById(resRecipe.id);
            })
            .then(function(recipe) {
                //console.log(recipe);
                expect(resRecipe.id).to.equal(recipe.id);
                expect(resRecipe.name).to.equal(recipe.name);
                expect(resRecipe.author.firstName).to.equal(recipe.author.firstName);
                expect(resRecipe.ingredients[0]).to.equal(recipe.ingredients[0]);
                expect(resRecipe.content).to.equal(recipe.content);
                expect(resRecipe.comments[0].content).to.equal(recipe.comments[0].content);
            });
        });
    });

    describe('GET recipe by id endpoint', function() {

        it('should return the recipe corresponding to the given id', function() {
            let resRecipe;
            return Recipe.find()
            .then(function(recipes) {
                const theId = recipes[0].id;
                return chai.request(app)
                .get(`/recipes/${theId}`);
            })
            .then(function(res) {
                resRecipe = res.body;
                expect(res).to.have.status(200);
                expect(res).to.be.a('object');
                expect(resRecipe).to.include.keys('id', 'name', 'author', 'ingredients', 'content', 'comments');
                return Recipe.findById(resRecipe.id);
            })
            .then(function(recipe) {
                expect(resRecipe.id).to.equal(recipe.id);
                expect(resRecipe.name).to.equal(recipe.name);
                expect(resRecipe.author.firstName).to.equal(recipe.author.firstName);
                expect(resRecipe.ingredients[0]).to.equal(recipe.ingredients[0]);
                expect(resRecipe.content).to.equal(recipe.content);
                expect(resRecipe.comments[0].content).to.equal(recipe.comments[0].content);
            });
        });
    });

    describe('POST a new recipe endpoint', function() {

        it('should create a new recipe', function() {
            let resRecipe;
            let newRecipe = generateRecipeData();
            
            return chai.request(app)
            .post('/recipes/myrecipes')
            .send(newRecipe)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('id', 'name', 'author', 'ingredients', 'content', 'comments');
                expect(res.body.name).to.equal(newRecipe.name);
                expect(res.body.id).to.not.be.null;
                expect(res.body.author.firstName).to.equal(newRecipe.author.firstName);
                expect(res.body.ingredients[0]).to.equal(newRecipe.ingredients[0]);
                expect(res.body.content).to.equal(newRecipe.content);
            });
        });
    });

    describe('PUT endpoint for editing an existing recipe', function() {

        it('should update fields that you send over for a specific recipe', function() {
            const updateData = {
                content: "jfefjioewfjeoiwjf",
                name: "newName"
            };

            return Recipe.findOne()
            .then(function(recipe) {
                updateData.id = recipe.id;
                return chai.request(app)
                .put(`/recipes/myrecipes/${recipe.id}`)
                .send(updateData);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                return Recipe.findById(updateData.id);
            })
            .then(function(recipe) {
                expect(recipe.name).to.equal(updateData.name);
                expect(recipe.content).to.equal(updateData.content);
            });
        });
    });

    describe('DELETE endpoint for deleting a recipe', function() {

        it('should delete a recipe', function() {
            let recipe;
            
            return Recipe.findOne()
            .then(function(_recipe) {
                recipe = _recipe;
                return chai.request(app)
                .delete(`/recipes/myrecipes/${recipe.id}`);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                return Recipe.findById(recipe.id);
            })
            .then(function(_recipe) {
                expect(_recipe).to.be.null;
            });
        });
    });
    
});

