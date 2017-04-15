var chai = require('chai'),
    chaiHttp = require('chai-http'),
    service = require('../../app')
auth = require('./auth');

chai.use(chaiHttp);
var expect = chai.expect;

describe('Auth', () => {

    beforeEach(function () {

    })

    it('should register a new user', function (done) {
        chai.request(service)
            .post('/signin')
            .send({
                name: 'Jan',
                lastname: 'Kowalski',
                login: 'jk',
                password: 'jk'
            })
            .end(function (err, res) {
                expect(err).to.be.an('null');
                expect(res).to.have.status(200);
                expect(res.body).to.have.deep.property('isLibrarian', false);
                done();
            })
    });


    it('should faild to register new user with the wrong librarian code', function (done) {
        chai.request(service)
            .post('/signin')
            .send({
                name: 'Jan',
                lastname: 'Kowalski',
                login: 'jk',
                password: 'jk',
                librarianCode: 'wrong code'
            })
            .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.deep.property('isLibrarian', false);
                done();
            })
    });


    it('should faild to register new user with the login that already exist');

    it('should register a new librarian', function (done) {
        chai.request(service)
            .post('/signin')
            .send({
                name: 'Jan',
                lastname: 'Kowalski',
                login: 'jk',
                password: 'jk',
                librarianCode: 'i love books'
            })
            .end(function (err, res) {
                expect(err).to.be.an('null');
                expect(res).to.have.status(200);
                expect(res.body).to.have.deep.property('isLibrarian', true);
                done();
            })
    });

    it('should determited that the librarian code is supplied', function () {
        expect(auth.isLibrarianCodeSupplied({
            librarianCode: 'some code'
        })).to.be.true;
    })


    it('should determited that the librarian code is not supplied', function () {
        expect(auth.isLibrarianCodeSupplied({

        })).to.be.false;
    })
})