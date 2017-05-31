var chai = require('chai'),
    chaiHttp = require('chai-http'),
    service = require('../../../app'),
    Book = require('../../models/book'),
    User = require('../../models/user');

chai.use(chaiHttp);
var expect = chai.expect;

describe('book.js', () => {

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
                        expect(res.body).to.be.a('Object');
                        expect(res.body).to.have.property('books')
                        expect(res.body.books).to.be.an('Array')
                        expect(res.body.books).to.have.lengthOf(0);
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
                                expect(res.body).to.be.an('Object');
                                expect(res.body).to.have.property('books')
                                expect(res.body.books).to.be.an('Array')
                                expect(res.body.books).to.have.lengthOf(2);
                                expect(res.body.books[0]).to.have.property('title')
                                expect(res.body.books[0]).to.have.property('_id')
                                expect(res.body.books[1]).to.have.property('title')
                                expect(res.body.books[1]).to.have.property('_id')
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

    describe('POST /books', () => {
        beforeEach((done) => {
            Book.remove({})
                .then(() => {
                    return User.remove({})
                })
                .then(() => {
                    done();
                })
        })

        it('should failed to create book without token provided', (done) => {
            chai.request(service)
                .post('/api/books')
                .end((err, res) => {
                    expect(res).to.has.status(401);
                    expect(res.body).to.has.property('valid', false);
                    expect(res.body).to.has.property('message');
                    done();
                })
        });


        describe('Authorized requests - none librarian user', () => {

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

            it('should failed to create book by none librarian user', (done) => {
                chai.request(service)
                    .post('/api/books')
                    .send({
                        token: token
                    })
                    .end((err, res) => {
                        expect(res).to.has.status(401);
                        expect(res.body).to.has.property('valid', false);
                        expect(res.body).to.has.property('message');
                        done();
                    })
            });
        })


        describe('Authorized requests - librarian user', () => {

            let token;

            beforeEach(done => {
                User.create({
                    login: 'dd',
                    password: 'dd',
                    isLibrarian: true
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

            it('should failed to create book without title provided', (done) => {
                chai.request(service)
                    .post('/api/books')
                    .send({
                        description: 'Good book',
                        token: token
                    })
                    .end((err, res) => {
                        expect(res).to.has.status(403);
                        expect(res.body).to.has.property('valid', false);
                        expect(res.body).to.has.property('message');
                        done();
                    })
            });

            it('should successful register a new book', (done) => {
                chai.request(service)
                    .post('/api/books')
                    .send({
                        title: 'The game of thrones',
                        description: 'Good book',
                        token: token
                    })
                    .end((err, res) => {
                        expect(res).to.has.status(200);
                        expect(res.body).to.has.property('valid', true);
                        done();
                    })
            });
        })
    })

    describe('POST /books/:id/return', () => {
        beforeEach((done) => {
            Book.remove({})
                .then(() => {
                    return User.remove({})
                })
                .then(() => {
                    done();
                })
        })

        it('should failed to return a book without token provided', (done) => {
            chai.request(service)
                .post('/api/books/1/return')
                .end((err, res) => {
                    expect(res).to.has.status(401);
                    expect(res.body).to.has.property('valid', false);
                    expect(res.body).to.has.property('message');
                    done();
                })
        });

        describe('Authorized requests', () => {

            let token;
            let book;

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

                            Book.create({
                                title: 'The game of thrones'
                            }).then(book => {
                                book = book
                                done();
                            })

                        })
                })
            })


            it('should failed to return a book with unkown identificator', (done) => {
                chai.request(service)
                    .post('/api/books/1/return')
                    .send({
                        token: token
                    })
                    .end((err, res) => {
                        expect(res).to.has.status(404);
                        expect(res.body).to.has.property('valid', false);
                        expect(res.body).to.has.property('message');
                        done();
                    })
            });

            it('should failed to return a book that has not been rent by the logged user', (done) => {
                chai.request(service)
                    .post(`/api/books/${book._id}/return`)
                    .send({
                        token: token
                    })
                    .end((err, res) => {
                        expect(res).to.has.status(403);
                        expect(res.body).to.has.property('valid', false);
                        expect(res.body).to.has.property('message');
                        done();
                    })
            });


            it('should successful return the book', (done) => {


                chai.request(service)
                    .post(`/api/books/${book._id}/rent`)
                    .send({
                        token: token
                    })
                    .end((err, res) => {
                        chai.request(service)
                            .post(`/api/books/${book._id}/return`)
                            .send({
                                token: token
                            })
                            .end((err, res) => {
                                expect(res).to.has.status(200);
                                expect(res.body).to.has.property('valid', true);
                                done();
                            })
                    })
            });
        })
    })
})