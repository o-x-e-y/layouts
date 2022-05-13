import layoutNames from "./layout_names.mjs"

const searchElem = document.getElementById("search-bar");

window.onload = () => {
    searchElem.addEventListener("input", (e) => {
        let layouts = search(e.target.value, 7);
        addSearches(layouts);
    });
}

function addSearches(layouts) {
    const searchWrapper = document.getElementById("search-results");
    let res = ""
    for (let layout of layouts) {
        res += `<div class="search-result">${layout}</div>`
    }
    searchWrapper.innerHTML = res;
}

class DefaultDict {
    constructor(defaultVal) {
        return new Proxy({}, {
            get: (target, name) => name in target ? target[name] : defaultVal
        })
    }
}

function search(query, maxMatches=10) {
    let matchScores = new DefaultDict(0);
    for (let layoutName of layoutNames) {
        for (let layoutTrigram of getTrigrams(layoutName)) {
            for (let queryTrigram of getTrigrams(query)) {
                if (layoutTrigram === queryTrigram) {
                    matchScores[layoutName] += 1/layoutName.length;
                }
            }
        }
    }
    let matches = [];
    for (let layout in matchScores) {
        matches.push({ "layout": layout, "matchScore": matchScores[layout] });
    }
    return matches
        .sort((a, b) => {
            return b.matchScore - a.matchScore;
        })
        .slice(0, maxMatches)
        .map((match) => match.layout);
}

function* getTrigrams(string) {
    if (string.length == 0) {
        return null;
    }
    string = "  " + string;
    for (let i = 0; i < string.length - 2; ++i) {
        yield string[i]+string[i+1]+string[i+2];
    }
    return null;
}