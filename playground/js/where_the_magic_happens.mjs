import TRIGRAM_COMBINATIONS from "./trigram_patterns.mjs";

function getExtraPinkyCharacters(layout, characterData) {
    let extraPinkyCharacters = new Set();
    for(let char in characterData) {
        extraPinkyCharacters.add(char);
    }
    for(let char of layout) {
        extraPinkyCharacters.delete(char);
    }
    return Array.from(extraPinkyCharacters);
}

function* possibleBigrams(finger) {
    for(let letter1 of finger) {
        for(let letter2 of finger) {
            if(letter1 !== letter2) {
                yield letter1 + letter2;
            }
        }
    }
}

function getFingerUsage(finger, characterData) {
    let total = 0;
    finger.forEach(key => total += characterData[key] || 0);

    return total;
}

function getSfbForFinger(finger, bigramData) {
    let bigram_total = 0;
    for(let bigram of possibleBigrams(finger)) {
        bigram_total += bigramData[bigram] || 0;
    }
    return bigram_total;
}

function getLsbs(layout, excludedKeys, bigramData) {
    const layoutMap = {};
    for (let i = 0; i < 30; ++i) {
        if (!excludedKeys.has(layout[i])) {
            layoutMap[layout[i]] = i % 10;
        }
    }

    let res = 0.0;
    for (let bigram in bigramData) {
        let a = layoutMap[bigram[0]];
        let b = layoutMap[bigram[1]];
        if (a == 2 && b == 4 || a == 4 && b == 2 || a == 5 && b == 7 || a == 7 && b == 5) {
            res += bigramData[bigram];
        }
    }
    return res;
}

function analyzeLayout(layout, excludedKeys, languageData) {
    let fingers = {
        finger0: new Set([layout[0], layout[10], layout[20], '`']),
        finger1: new Set([layout[1], layout[11], layout[21]]),
        finger2: new Set([layout[2], layout[12], layout[22]]),
        finger3: new Set(layout.slice(3, 5).concat(layout.slice(13, 15), layout.slice(23, 25))),
        finger6: new Set(layout.slice(5, 7).concat(layout.slice(15, 17), layout.slice(25, 27))),
        finger7: new Set([layout[7], layout[17], layout[27]]),
        finger8: new Set([layout[8], layout[18], layout[28]]),
        finger9: new Set([layout[9], layout[19], layout[29]]),//.concat(getExtraPinkyCharacters(layout, languageData["characters"]))),
        thumbL: new Set(layout.slice(30, 33)),
        thumbR: new Set(layout.slice(33, 36))
    }

    for(let finger in fingers) {
        excludedKeys.forEach(exKey => fingers[finger].delete(exKey));
    }

    let fingerUsage = {
        0: getFingerUsage(fingers.finger0, languageData["characters"]),
        1: getFingerUsage(fingers.finger1, languageData["characters"]),
        2: getFingerUsage(fingers.finger2, languageData["characters"]),
        3: getFingerUsage(fingers.finger3, languageData["characters"]),
        6: getFingerUsage(fingers.finger6, languageData["characters"]),
        7: getFingerUsage(fingers.finger7, languageData["characters"]),
        8: getFingerUsage(fingers.finger8, languageData["characters"]),
        9: getFingerUsage(fingers.finger9, languageData["characters"]),
        thumbL: getFingerUsage(fingers.thumbL, languageData["characters"]),
        thumbR: getFingerUsage(fingers.thumbR, languageData["characters"])
    }

    let centerKeys = {
        left: new Set([layout[4], layout[14], layout[24]]),
        right: new Set([layout[5], layout[15], layout[25]]),
        homerow: new Set(layout.slice(10, 14).concat(layout.slice(16, 20))),
    }

    let centerUse = {
        left: getFingerUsage(centerKeys.left, languageData["characters"]),
        right: getFingerUsage(centerKeys.right, languageData["characters"]),
        homerow: getFingerUsage(centerKeys.homerow, languageData["characters"])
    }

    for(let part in centerUse) {
        excludedKeys.forEach(exKey => {
            if(exKey in centerKeys[part]) {
                centerUse[part] -= languageData["characters"][exKey];
            }
        })
    }

    let sfbPerFinger = {
        0: getSfbForFinger(fingers.finger0, languageData["bigrams"]),
        1: getSfbForFinger(fingers.finger1, languageData["bigrams"]),
        2: getSfbForFinger(fingers.finger2, languageData["bigrams"]),
        3: getSfbForFinger(fingers.finger3, languageData["bigrams"]),
        6: getSfbForFinger(fingers.finger6, languageData["bigrams"]),
        7: getSfbForFinger(fingers.finger7, languageData["bigrams"]),
        8: getSfbForFinger(fingers.finger8, languageData["bigrams"]),
        9: getSfbForFinger(fingers.finger9, languageData["bigrams"]),
        thumbL: getSfbForFinger(fingers.thumbL, languageData["bigrams"]),
        thumbR: getSfbForFinger(fingers.thumbR, languageData["bigrams"])
    }

    let dsfbTotal = 0;
    for(let finger in fingers) {
        dsfbTotal += getSfbForFinger(fingers[finger], languageData["skipgrams"]);
    }

    const COL_TO_FINGER = [0, 1, 2, 3, 3, 6, 6, 7, 8, 9];
    const layoutMap = {};
    for (let i = 0; i < 30; ++i) {
        if (!excludedKeys.has(layout[i])) {
            layoutMap[layout[i]] = COL_TO_FINGER[i % 10];
        }
    }
    
    for (let i = 30; i < 33; ++i) {
        if (!excludedKeys.has(layout[i])) {
            layoutMap[layout[i]] = 4;
        }
        if (!excludedKeys.has(layout[i+3])) {
            layoutMap[layout[i+3]] = 5;
        }
    }

    return {
        fingerChars: fingers,
        fingerUsage: fingerUsage,
        centerUsage: centerUse,
        fingerSfb: sfbPerFinger,
        dsfbTotal: dsfbTotal,
        lsbTotal: getLsbs(layout, excludedKeys, languageData["bigrams"]),
        trigramFreqs: getTrigramStats(languageData["trigrams"], layoutMap)
    };
}

class TrigramFreq {
    constructor() {
        this.alternates = 0;
        this.alternatesSfs = 0;
        this.inrolls = 0;
        this.outrolls = 0;
        this.onehands = 0;
        this.redirects = 0;
        this.badRedirects = 0;
        this.other = 0;
        this.invalid = 0;
    }
}   

function getTrigramPattern(layoutMap, trigram) {
    let a = layoutMap[trigram[0]];
    let b = layoutMap[trigram[1]];
    let c = layoutMap[trigram[2]];
    if (a === undefined || b === undefined || c === undefined) {
        return -1;
    }
    // a, b and c are numbers between 0 and 7. This means they fit in exactly 3 bits (7 = 0b111)
    // they now are between 0 and 9 which can only fit into 4 bits with empty space
    let combination = (a << 8) | (b << 4) | c;
    return TRIGRAM_COMBINATIONS[combination];
}

function getTrigramStats(trigramData, layoutMap) {
    let freqs = new TrigramFreq();
    for (let trigram in trigramData) {
        let freq = trigramData[trigram];
		switch (getTrigramPattern(layoutMap, trigram)) {
            case 0: freqs.alternates += freq; break;
            case 1: freqs.alternatesSfs += freq; break;
            case 2: freqs.inrolls += freq; break;
            case 3: freqs.outrolls += freq; break;
            case 4: freqs.onehands += freq; break;
            case 5: freqs.redirects += freq; break;
            case 6: freqs.badRedirects += freq; break;
            case 7: freqs.other += freq; break;
            default: freqs.invalid += freq; break;
        }
    }
    return freqs;
}

export { analyzeLayout as default };