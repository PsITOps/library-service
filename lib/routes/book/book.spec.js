var chai = require('chai'),
    chaiHttp = require('chai-http'),
    service = require('../../../app'),
    Book = require('../../models/book'),
    User = require('../../models/user');

chai.use(chaiHttp);
var expect = chai.expect;



describe('GET /books', () => {
    beforeEach((done) => {
        Book.remove({})
            .then(() => {
                return User.remove({})
            })
            .then(() => {
                done();
            })
    })

    it('should failed to get books without token provided', (done) => {
        chai.request(service)
            .get('/api/books')
            .end((err, res) => {
                expect(res).to.has.status(401);
                expect(res.body).to.has.property('valid', false);
                expect(res.body).to.has.property('message');
                done();
            })
    });

    describe('Authorized requests', () => {

        let token;

        beforeEach(done => {
            User.create({
                login: 'dd',
                password: 'dd'
            }).then(user => {
                chai.request(service)
                    .post('/signin')
                    .send({
                        login: 'dd',
                        password: 'dd'
                    }).end((err, res) => {
                        token = res.body.token;
                        done();
                    })
            })
        })

        it('should get zero books', (done) => {
            chai.request(service)
                .get('/api/books')
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(res).to.has.status(200);
                    expect(res.body).to.be.an('Array');
                    expect(res.body).to.have.lengthOf(0);
                    done();
                })
        });

        it('should get two books', (done) => {
            Book.create([{
                    title: 'Zielona mila'
                }, {
                    title: 'Lsnienie'
                }])
                .then(books => {
                    chai.request(service)
                        .get('/api/books')
                        .send({
                            token: token
                        })
                        .end((err, res) => {
                            expect(res).to.has.status(200);
                            expect(res.body).to.be.an('Array');
                            expect(res.body).to.have.lengthOf(2);
                            expect(res.body[0]).to.have.property('title')
                            expect(res.body[0]).to.have.property('_id')
                            expect(res.body[1]).to.have.property('title')
                            expect(res.body[1]).to.have.property('_id')
                            done();
                        })
                })
        });
    })
})

describe('POST /books/:id/rent', () => {

    let book;

    beforeEach(done => {
        Book.remove({})
            .then(() => {
                return User.remove({})
            })
            .then(() => {
                return Book.create({
                    title: 'Zielona mila',
                    isAvailable: true
                })
            })
            .then(newBook => {
                book = newBook;
                done();
            })
    })

    after(done => {
        Book.remove({})
            .then(() => {
                return User.remove({})
            })
            .then(() => {
                done();
            })
    })

    it('should failed to rent a book without token provided', done => {

        chai.request(service)
            .post(`/api/books/${book._id}/rent`)
            .end((err, res) => {
                expect(res).to.has.status(401);
                expect(res.body).to.has.property('valid', false);
                expect(res.body).to.has.property('message');
                done();
            })
    })

    describe('Authorized requests', () => {

        let token, user;

        beforeEach(done => {
            User.create({
                login: 'dd',
                password: 'dd'
            }).then(newUser => {
                user = newUser;
                chai.request(service)
                    .post('/signin')
                    .send({
                        login: 'dd',
                        password: 'dd'
                    }).end((err, res) => {
                        token = res.body.token;
                        done();
                    })
            })
        })

        it('should successfully rent a book', done => {

            chai.request(service)
                .post(`/api/books/${book._id}/rent`)
                .send({
                    token: token
                }).end((err, res) => {
                    expect(res).to.have.status(200)
                    expect(res.body).to.have.property('valid', true)
                    expect(res.body).to.have.property('borrowedBook')
                    expect(res.body).to.have.property('returnDate')
                    expect(res.body.borrowedBook).to.have.property('_id')
                    expect(res.body.borrowedBook).to.have.property('title', book.title)

                    User.findById(user._id)
                        .then(foundUser => {
                            expect(foundUser).to.have.property('books')
                            expect(foundUser.books).to.be.an('Array')
                            expect(foundUser.books).to.have.lengthOf(1)
                            expect(foundUser.books[0]).to.have.property('_id')
                            expect(foundUser.books[0]).to.have.property('title', book.title)

                            return Book.findById(book._id)
                        })
                        .then(foundBook => {
                            expect(foundBook).to.have.property('isAvailable', false);
                            done();
                        })
                })
        })

        it('should failed to rent not available book', done => {
            chai.request(service)
                .post(`/api/books/${book._id}/rent`)
                .send({
                    token: token
                }).end((err, res) => {
                    chai.request(service)
                        .post(`/api/books/${book._id}/rent`)
                        .send({
                            token: token
                        }).end((err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.have.property('valid', false);
                            expect(res.body).to.have.property('message');
                            done();
                        })
                })
        })

        it('should failed to rent a book that not exists', done => {
            Book.remove({})
                .then(() => {
                    chai.request(service)
                        .post(`/api/books/${book._id}/rent`)
                        .send({
                            token: token
                        }).end((err, res) => {
                            expect(res).to.have.status(404)
                            expect(res.body).to.have.property('valid', false)
                            expect(res.body).to.have.property('message')
                            done();
                        })
                })

        })

    })

})