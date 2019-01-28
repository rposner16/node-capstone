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

function seedRecipeData() {
    console.info('Seeding recipe data');
    const seedData = [];
    for (let i = 0; i < 10; i++) {
        seedData.push(generateRecipeData());
    }
    return Recipe.insertMany(seedData);
}

function generateRecipeData() {
  return {
    name: faker.random.word(),
    author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userName: faker.random.word()
    },
    ingredients: generateIngredients(),
    content: faker.lorem.paragraph(),
    comments: generateComments()
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
            author: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                userName: faker.random.word()
            }
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

    describe('recipePage.html', function() {
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

    describe('userPage.html', function() {
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
            })
        });
    });

    /*describe('POST a new recipe endpoint', function() {

    });*/
    
});

