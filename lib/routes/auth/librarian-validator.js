const LIBRARIAN_CODE = 'i love books';

class LibrarianValidator {

    constructor() {

    }

    isLibrarianCodeCorrect(code) {
        return code == LIBRARIAN_CODE;
    }

    isLibrarianCode(code) {
        return this.isLibrarianCodeCorrect(code);
    }

    isLibrarianCodeSupplied(code) {
        return code != undefined;
    }

    isWrongLibrarianCodeSupplied(code) {
        return this.isLibrarianCodeSupplied(code) &&
            !this.isLibrarianCodeCorrect(code);
    }

    isLibrarianUser(user) {
        return user != undefined &&
            user.isLibrarian != undefined &&
            user.isLibrarian;
    }
}

module.exports = LibrarianValidator;