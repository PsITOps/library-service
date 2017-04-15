const LIBRARIAN_CODE = 'i love books';

function isLibrarianCodeCorrect(code) {
    return code == LIBRARIAN_CODE;
}

function isLibrarian(code) {
    return isLibrarianCodeCorrect(code);
}

module.exports = {
    isLibrarian,
}