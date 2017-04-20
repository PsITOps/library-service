var chai = require('chai'),
    chaiHttp = require('chai-http'),
    service = require('../../app'),
    User = require('../user/user-model'),
    jwt = require('jsonwebtoken'),
    config = require('config');
auth = require('./auth');

chai.use(chaiHttp);
var expect = chai.expect;

describe('/signin', () => {

    beforeEach((done) => {
        User.remove({})
            .then(() => {
                done();
            })
    })

    after((done) => {
        User.remove({})
            .then(() => {
                done();
            })
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
            .end((err, res) => {
                expect(err).to.be.an('null');
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('isLibrarian', false);
                done();
            })
    });


    it('should faild to register new user with the wrong librarian code', (done) => {
        chai.request(service)
            .post('/signin')
            .send({
                name: 'Jan',
                lastname: 'Kowalski',
                login: 'jk',
                password: 'jk',
                librarianCode: 'wrong code'
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('valid', false);
                done();
            })
    });


    it('should faild to register new user with the login that already exist', (done) => {
        chai.request(service)
            .post('/signin')
            .send({
                login: 'jk'
            }).end((err, res) => {
                chai.request(service)
                    .post('/signin')
                    .send({
                        login: 'jk'
                    }).end((err, res) => {
                        expect(res).to.have.status(409)
                        expect(res.body).to.have.property('valid', false);
                        done();
                    })
            })
    });

    it('should register a new librarian', (done) => {
        chai.request(service)
            .post('/signin')
            .send({
                name: 'Jan',
                lastname: 'Kowalski',
                login: 'jk',
                password: 'jk',
                librarianCode: 'i love books'
            })
            .end((err, res) => {
                expect(err).to.be.an('null');
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('isLibrarian', true);
                done();
            })
    });
})


describe('/login', () => {
    beforeEach((done) => {
        User.remove({})
            .then(() => {
                return User.create({
                    name: 'Jan',
                    lastname: 'Kowalski',
                    login: 'jk',
                    password: 'jk'
                }, {
                    name: 'Dawid',
                    lastname: 'Dyrcz',
                    login: 'dd',
                    password: 'dd',
                    isLibrarian: true
                })
            })
            .then((user) => {
                done();
            })
    })

    after((done) => {
        User.remove({})
            .then(() => {
                done();
            })
    })


    it('should login to the service as a reader', (done) => {
        chai.request(service)
            .post('/login')
            .send({
                login: 'jk',
                password: 'jk'
            })
            .end((err, res) => {
                expect(res.body).to.have.property('token');
                expect(res.body).to.have.property('valid', true);
                expect(res.body).to.have.property('isLibrarian', false)
                expect(res).to.has.status(200);
                done();
            })
    })

    it('should login to the service as a librarian', (done) => {
        chai.request(service)
            .post('/login')
            .send({
                login: 'dd',
                password: 'dd'
            })
            .end((err, res) => {
                expect(res.body).to.have.property('token');
                expect(res.body).to.have.property('valid', true);
                expect(res.body).to.have.property('isLibrarian', true)
                expect(res).to.has.status(200);
                done();
            })
    })

    it('should vaild to login with invalid credentials', (done) => {
        chai.request(service)
            .post('/login')
            .send({
                login: 'mm',
                password: 'mm'
            })
            .end((err, res) => {
                expect(res.body).to.have.property('valid', false);
                expect(res.body).to.have.property('message')
                expect(res).to.has.status(401);
                done();
            })
    })
})