const LIBRARIAN_CODE = 'i love books';

class LibrarianValidator {

    constructor() {

    }

    isLibrarianCodeCorrect(code) {
        return code == LIBRARIAN_CODE;
    }

    isLibrarian(code) {
        return this.isLibrarianCodeCorrect(code);
    }

    isLibrarianCodeSupplied(code) {
        return code != undefined;
    }

    isWrongLibrarianCodeSupplied(code) {
        return this.isLibrarianCodeSupplied(code) &&
            !this.isLibrarianCodeCorrect(code);
    }
}

module.exports = LibrarianValidator;