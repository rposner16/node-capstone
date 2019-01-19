'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
const { app, runServer, closeServer } = require('../server');
//const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

describe('Hello world page', function() {

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    })

    it('should have HTML and status 200', function() {
        
        let res;

        return chai.request(app)
        .get('/')
        .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);
        });
    });
});