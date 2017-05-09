var chai = require('chai'),
    chaiHttp = require('chai-http'),
    service = require('../../../app'),
    Book = require('../../models/book'),
    User = require('../../models/user');

chai.use(chaiHttp);
var expect = chai.expect;

describe('GET /account/books', () => {

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
            .get('/api/account/books')
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

        it('should get empty array of books', done => {
            chai.request(service)
                .get('/api/account/books')
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(res).to.has.status(200);
                    expect(res.body).to.have.property('valid', true);
                    expect(res.body).to.have.property('books');
                    expect(res.body.books).to.be.an('Array')
                    expect(res.body.books).to.have.lengthOf(0);

                    done();
                })
        })

        it('should get array with one book', done => {
            Book.create({
                title: 'Zielona mila',
                genre: 'Dramat',
                author: 'Stephen King',
                description: 'Some description',
                isAvailable: true
            }).then(book => {
                chai.request(service)
                    .post(`/api/books/${book._id}/rent`)
                    .send({
                        token: token
                    })
                    .end((err, res) => {
                        chai.request(service)
                            .get('/api/account/books')
                            .send({
                                token: token
                            })
                            .end((err, res) => {
                                expect(res).to.has.status(200);
                                expect(res.body).to.have.property('valid', true);
                                expect(res.body).to.have.property('books');
                                expect(res.body.books).to.be.an('Array')
                                expect(res.body.books).to.have.lengthOf(1);
                                expect(res.body.books[0]).to.have.property('name', book.title);
                                expect(res.body.books[0]).to.have.property('author', book.author);
                                expect(res.body.books[0]).to.have.property('genre', book.genre);
                                expect(res.body.books[0]).to.have.property('description', book.description);
                                expect(res.body.books[0]).to.have.property('isAvailable', false);

                                done();
                            })
                    })
            })
        })

        it('should failed to get books of the removed user');

    })
})