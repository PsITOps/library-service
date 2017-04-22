var chai = require('chai'),
    chaiHttp = require('chai-http'),
    service = require('../../app'),
    Book = require('../../models/book'),
    User = require('../../models/user');

chai.use(chaiHttp);
var expect = chai.expect;



describe('/books', () => {
    beforeEach((done) => {
        Book.remove({})
            .then(() => {
                return User.remove({})
            })
            .then(() => {
                done();
            })
    })

    it('should failed to get books without token supplied', (done) => {
        chai.request(service)
            .get('/api/books')
            .end((err, res) => {
                expect(res).to.has.status(401);
                expect(res.body).to.has.property('valid', false);
                done();
            })
    });

    describe('Authorized requests', () => {

        let token;

        beforeEach((done) => {

            User.create({
                login: 'dd',
                password: 'dd'
            }).then(user => {
                chai.request(service)
                    .post('/login')
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
    })
})