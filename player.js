function incrementName(name) {
    const A_CODE = 65;
    const Z_CODE = 90;

    if (!name) return String.fromCharCode(A_CODE);

    const nameChars = Array.from(name);
    let i = nameChars.length - 1;
    for (; i >= 0; i--) {
        const code = name.charCodeAt(i);
        if (code === Z_CODE) {
            nameChars[i] = String.fromCharCode(A_CODE);
        }
        else {
            nameChars[i] = String.fromCharCode(code + 1);
            break;
        }
    }

    if (i === -1) nameChars.unshift(String.fromCharCode(A_CODE));

    return nameChars.join('');
}

function* getNameGenerator() {
    const A_CODE = 65;
    const Z_CODE = 90;

    let i = A_CODE;
    let namePrefix = '';
    let name = '';
    while (true) {
        name = namePrefix + String.fromCharCode(i++);
        yield name;

        if (i === Z_CODE + 1) {
            i = A_CODE;
            namePrefix = incrementName(name.substring(0, name.length - 1)); 
        }
    }
}

const nameGenerator = getNameGenerator();

class Player {
    #position;
    #name;
    
    constructor(name = undefined) {        
        this.name = name || nameGenerator.next().value;
        this.#position = null;
    }

    static create(name = undefined) {
        return new Player(name);
    }

    get name() {        
        return this.#name;
    }

    set name(name) { 
        if (!name || !name.trim()) return;
        this.#name = name;
    }

    rename(){
        this.name = nameGenerator.next().value;
    }

    get position() {
        return this.#position;
    }

    set position(position) {
        if (!Array.isArray(position) || position.length !== 2) return;

        this.#position = position;
    }
}

export default Player;