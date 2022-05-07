function lh(num) {
    return num < 4;
}

function is_alt(lh1, lh2, lh3) {
    return lh1 != lh2 && lh2 != lh3;
}

function is_roll(lh1, lh2, lh3, c1, c2, c3) {
    let r = Number(lh1) + Number(lh2) + Number(lh3);
    return !is_alt(lh1, lh2, lh3) && (r == 1 || r == 2) && c1 != c2 && c2 != c3;
}

function get_roll(lh1, lh2, lh3, c1, c2, c3) {
    if (lh1 && lh2 && !lh3) {
        return particular_roll(c2, c1);
    } else if (!lh1 && lh2 && lh3) {
        return particular_roll(c3, c2);
    } else if (!lh1 && !lh2 && lh3) {
        return particular_roll(c1, c2);
    } else if (lh1 && !lh2 && !lh3) {
        return particular_roll(c2, c3);
    } else {
        return 7;
    }
}

function particular_roll(f1, f2) {
    if (f1 > f2) {
        return 3;
    }
    return 2;
}

function on_one_hand(lh1, lh2, lh3) {
    return lh1 == lh2 && lh2 == lh3;
}

function is_bad_redir(c1, c2, c3) {
    return !(c1 == 3 || c2 == 3 || c3 == 3 || c1 == 4 || c2 == 4 || c3 == 4);
}

function get_one_hand(c1, c2, c3) {
    if ((c1 < c2 && c2 > c3) || (c1 > c2 && c2 < c3)) {
        if (is_bad_redir(c1, c2, c3)) {
            return 6;
        }
        return 5;
    }
    if ((c1 > c2 && c2 > c3) || (c1 < c2 && c2 < c3)) {
        return 4;
    }
    return 7;
}

function get_trigram_pattern(c1, c2, c3) {
    let lh1 = lh(c1);
    let lh2 = lh(c2);
    let lh3 = lh(c3);

    if (is_alt(lh1, lh2, lh3)) {
        if (c1 == c3) {
            return 1;
        } else {
            return 0;
        }
    } else if (on_one_hand(lh1, lh2, lh3)) {
        return get_one_hand(c1, c2, c3);
    } else if (is_roll(lh1, lh2, lh3, c1, c2, c3)) {
        return get_roll(lh1, lh2, lh3, c1, c2, c3);
    } else {
        return 7
    }
}

function get_trigram_combinations() {
    let combinations = new Uint32Array(512);
    for (let i = 0; i < 512; ++i) {
        combinations[i] = 7;
    }

    let c3 = 0;
    while (c3 < 8) {
        let c2 = 0;
        while (c2 < 8) {
            let c1 = 0;
            while (c1 < 8) {
                let index = c3 * 64 + c2 * 8 + c1;
                combinations[index] = get_trigram_pattern(c1, c2, c3);
                c1 += 1;
            }
            c2 += 1;
        }
        c3 += 1;
    }
    return combinations;
}

const TrigramCombinations = get_trigram_combinations();

export {TrigramCombinations as default};