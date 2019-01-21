'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
const { app, runServer, closeServer } = require('../server');
//const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

describe('html pages', function() {

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    })

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
    
});