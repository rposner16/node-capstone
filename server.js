'use strict'

// General setup
const express = require('express');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { Recipe, Author, Comments } = require('./models');
const { PORT, DATABASE_URL } = require('./config');

const app = express();
app.use(express.static('public'));

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
  
  // Creating a regex based on request query, using that to find matching
  // recipes in the database
  const searchTerm = req.query.searchQuery;
  let rgx = new RegExp(searchTerm);
  Recipe.find( { name: { $regex: rgx, $options: 'i' } } )
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

// Get all recipes by a specific user/author
app.get('/recipes/user', (req, res) => {

  // Regex from request query, search for author with matching username
  const searchTerm = req.query.userQuery;
  let rgx = new RegExp(searchTerm);
  Recipe.find( { "author.userName": { $regex: rgx } } )
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

/*app.get('/authors', (req, res) => {
  Author.find()
  .then(athrs => {
    res.json(athrs);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});*/

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
  const requiredFields = ["name", "ingredients", "content", "author"];
  for (let i = 0; i < 4; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  // Create the recipe in the database
  Recipe.create({
    name: req.body.name,
    author: req.body.author,
    ingredients: req.body.ingredients,
    content: req.body.content
  })
  .then(recipe => res.status(201).json(recipe.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });  
});

// Edit an existing recipe
app.put('/recipes/myrecipes/:id', (req, res) => {

  // Make sure request contains correct id in body and params
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`;
    console.error(message);
    return res.status(400).json({message: message});
  }

  // Determine which fields will be updated
  const toBeUpdated = {};
  const updateableFields = ["name", "ingredients", "content", "comments"];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toBeUpdated[field] = req.body[field];
    }
  });

  // Update the recipe in the database
  Recipe.findByIdAndUpdate(req.params.id, { $set: toBeUpdated })
  .then(recipe => res.status(204).json(recipe.serialize()))
  .catch(err => {
    res.status(500).json({ message: "Internal server error" });
  });
});

// Delete a recipe
app.delete('/recipes/myrecipes/:id', (req, res) => {
  Recipe.findByIdAndRemove(req.params.id)
  .then(recipe => {
    res.status(204).end();
  })
  .catch(err => {
    res.status(500).json({ message: "Internal server error" });
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