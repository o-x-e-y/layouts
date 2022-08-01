function lh(num, nr_of_cols) {
    return num < (nr_of_cols / 2);
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
        return in_or_out(c2, c1);
    } else if (!lh1 && lh2 && lh3) {
        return in_or_out(c3, c2);
    } else if (!lh1 && !lh2 && lh3) {
        return in_or_out(c1, c2);
    } else if (lh1 && !lh2 && !lh3) {
        return in_or_out(c2, c3);
    } else {
        return 7;
    }
}

function in_or_out(f1, f2) {
    if (f1 > f2) {
        return 3;
    }
    return 2;
}

function on_one_hand(lh1, lh2, lh3) {
    return lh1 == lh2 && lh2 == lh3;
}

function is_bad_redir(c1, c2, c3) {
    let check = [1, 1, 1, 0, 0, 0, 0, 1, 1, 1];
    return (check[c1] + check[c2] + check[c3] == 3);
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

function get_trigram_pattern(c1, c2, c3, nr_of_cols) {
    let lh1 = lh(c1, nr_of_cols);
    let lh2 = lh(c2, nr_of_cols);
    let lh3 = lh(c3, nr_of_cols);

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

function trigram_index(c1, c2, c3, size) {
    return (c3 << (size * 2)) + (c2 << size) + c1;
}

function get_trigram_combinations(nr_of_cols) {
    // to be able to keep using the bitshift logic for array indexing
    let size = parseInt(Math.log2(nr_of_cols)) + 1;

    let length = trigram_index(nr_of_cols - 1, nr_of_cols - 1, nr_of_cols - 1, size) + 1;
    let combinations = new Int32Array(length).fill(-1);

    for (let c3 = 0; c3 < nr_of_cols; ++c3) {
        for (let c2 = 0; c2 < nr_of_cols; ++c2) {
            for (let c1 = 0; c1 < nr_of_cols; ++c1) {

                let index = (c3 << (size * 2)) + (c2 << size) + c1;
                combinations[index] = get_trigram_pattern(c1, c2, c3, nr_of_cols);
            }
        }
    }
    return combinations;
}

const TRIGRAM_COMBINATIONS = get_trigram_combinations(10);

export {TRIGRAM_COMBINATIONS as default};