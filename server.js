'use strict'

const express = require('express');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { Recipe, Author, Comments } = require('./models');
const { PORT, DATABASE_URL } = require('./config');

const app = express();
app.use(express.static('public'));

//app.use(morgan('common'));
app.use(express.json());

// General get request: retrieves all recipes in the database
app.get('/recipes', (req, res) => {
  Recipe.find()
  .then(recipes => {
    res.json(recipes.map(recipe => {
      return recipe.serialize();
    }));
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

// Get search results: retrieves specific recipes based on a user query
app.get('/recipes/search', (req, res) => {
  const searchTerm = req.query.searchQuery;
  // Fix find part once you figure out how to query database correctly
  Recipe.find(searchTerm)
  .then(recipes => {
    res.json(recipes.map(recipe => {
      return recipe.serialize();
    }));
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

// Get an individual recipe by its id
app.get('/recipes/:id', (req, res) => {
  const recipeId = req.params.id;
  Recipe.findById(recipeId)
  .then(recipe => {
    res.json(recipe.serialize());
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

// Post: creates a new recipe
app.post('/recipes/myrecipes', (req, res) => {

  // Making sure that request body has the required fields
  const requiredFields = ["name", "ingredients", "content", "author_id"];
  for (let i = 0; i < 3; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Recipe.create({
    name: req.body.name,
    author: req.body.author_id,
    ingredients: req.body.ingredients,
    content: req.body.content
  })
  .then(recipe => res.status(201).json(recipe.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });  
});


let server;

function runServer(databaseUrl, port = PORT) {
  
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };