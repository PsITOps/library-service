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


    it('should login to the service', (done) => {
        chai.request(service)
            .post('/signin')
            .send({
                login: 'jk',
                password: 'jk'
            })
            .end((err, res) => {
                expect(res).to.have.property('token');
                expect(res).to.have.property('isLibrarian', false);
                expect(res).to.have.property('valid', true);


                jwt.verify(res.body.token, config.get('secredKey'), (err, payload) => {
                    expect(err).to.be('null');
                    done()
                })


            })
    })
})