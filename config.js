'use strict'
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongo ds049864.mlab.com:49864/recipedb -u newUser -p firstPass1';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-recipedb';
exports.PORT = process.env.PORT || 8080;