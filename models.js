'use strict'

const mongoose = require('mongoose');

/*const authorSchema = mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    userName: {type: String, required: true /*unique: true}
});*/

const commentSchema = mongoose.Schema({
    content: {type: String, required: true}
});

const recipeSchema = mongoose.Schema({
    name: {type: String, required: true},
    ingredients: {type: Array, required: true},
    content: {type: String, required: true},
    comments: [commentSchema],
    author: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        userName: {type: String, required: true}
    }
});

// Pre hooks
/*recipeSchema.pre("find", function(next) {
    this.populate("author");
    next();
});

recipeSchema.pre("findOne", function(next) {
    this.populate("author");
    next();
});

// Virtual
/*recipeSchema.virtual("authorName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});*/

// Instance methods
recipeSchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.name,
        ingredients: this.ingredients, 
        content: this.content,
        author: this.author,
        comments: this.comments
    }
}

/*authorSchema.methods.authorSerialize = function() {
    return {
        id: this._id,
        name: this.authorName,
        userName: this.userName
    };
};*/

//const Author = mongoose.model("Author", authorSchema);
const Recipe = mongoose.model("Recipe", recipeSchema);
const Comments = mongoose.model("Comments", commentSchema);

module.exports = { Recipe, Comments };