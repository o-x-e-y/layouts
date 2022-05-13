import layoutNames from "./layout_names.mjs"
import {setLanguageData} from "./layout.mjs"

const searchResultsElem = document.getElementById("search-results-wrapper");
const searchResults = document.getElementById("search-results");
const searchbarElem = document.getElementById("search-bar");
let selectorList = [];
let layoutToIndex = {};
let selectedElemNr = 0;
let isOnSearch = false;
let hasToBlur = false;

class DefaultDict {
    constructor(defaultVal) {
        return new Proxy({}, {
            get: (target, name) => name in target ? target[name] : defaultVal
        })
    }
}

function searchLayouts(query, maxMatches = 10) {
    let matchScores = new DefaultDict(0);
    for (let layoutName of layoutNames) {
        for (let layoutTrigram of getTrigrams(layoutName)) {
            for (let queryTrigram of getTrigrams(query)) {
                if (layoutTrigram === queryTrigram) {
                    matchScores[layoutName] += 1 / layoutName.length;
                }
            }
        }
    }
    let matches = [];
    for (let layout in matchScores) {
        matches.push({ "layout": layout, "matchScore": matchScores[layout] });
    }
    matches = matches
        .sort((a, b) => {
            return b.matchScore - a.matchScore;
        })
        .slice(0, maxMatches)
        .map((match) => match.layout);
    addSearches(matches);
    return matches.length;
}

function* getTrigrams(string) {
    if (string.length == 0) {
        return null;
    }
    string = "  " + string + " ";
    for (let i = 0; i < string.length - 2; ++i) {
        yield string[i] + string[i + 1] + string[i + 2];
    }
    return null;
}

function searchOnClick(layout_name) {
    select(layout_name);
    searchbarElem.value = "";
    searchbarElem.blur();
    searchResultsElem.style.display = "none";
    selectedElemNr = 0;
}

document.SOC = searchOnClick;

function searchElemHover(e) {
    // let selectorList = searchResultsElem.querySelectorAll(".search-result");
    selectorList[selectedElemNr].classList.remove("search-result-selected");
    selectedElemNr = layoutToIndex[e.innerText];
    selectorList[selectedElemNr].classList.add("search-result-selected");
}

document.SEH = searchElemHover;

function addSearches(layouts) {
    let res = ""
    let i = 0;
    for (let layout of layouts) {
        res += `<div class="search-result" onclick="SOC(this.innerText)" onmouseover="SEH(this)">${layout}</div>`;
        layoutToIndex[layout] = i;
        ++i;
    }
    searchResults.innerHTML = res;
    selectorList = searchResultsElem.querySelectorAll(".search-result");
}

function search(query, max_matches) {
    selectedElemNr = 0;
    if (searchLayouts(query, max_matches) > 0) {
        searchResultsElem.style.display = "block";
        searchResultsElem.querySelector(".search-result").classList.add("search-result-selected");
    } else {
        searchResultsElem.style.display = "none";
    }
}

function initSearch() {
    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            case "Escape":
                searchbarElem.blur();
                selectedElemNr = 0;
                break;
            case "ArrowUp":
                // selectorList = searchResultsElem.querySelectorAll(".search-result");
                selectorList[selectedElemNr].classList.remove("search-result-selected");
                if (selectedElemNr > 0) {
                    --selectedElemNr;
                    selectorList[selectedElemNr].classList.add("search-result-selected");
                } else {
                    selectedElemNr = selectorList.length - 1;
                    selectorList[selectedElemNr].classList.add("search-result-selected");
                }
                break;
            case "ArrowDown":
                // selectorList = searchResultsElem.querySelectorAll(".search-result");
                selectorList[selectedElemNr].classList.remove("search-result-selected");
                if (selectedElemNr < selectorList.length - 1) {
                    ++selectedElemNr;
                    selectorList[selectedElemNr].classList.add("search-result-selected");
                } else {
                    selectedElemNr = 0;
                    selectorList[selectedElemNr].classList.add("search-result-selected");
                }
                break;
            case "Enter":
                // selectorList = searchResultsElem.querySelectorAll(".search-result");
                select(selectorList[selectedElemNr].innerText);
                searchbarElem.value = "";
                searchbarElem.blur();
                selectedElemNr = 0;
                break;
            default:
                break;
        }
    })

    searchResultsElem.addEventListener("mouseenter", (e) => {
        isOnSearch = true;
    })
    searchResultsElem.addEventListener("mouseleave", () => {
        isOnSearch = false;
        if (hasToBlur) {
            searchResultsElem.style.display = "none";
            hasToBlur = false;
        }
    })

    searchbarElem.addEventListener("input", (e) => {
        search(e.target.value, 7);
    })

    searchbarElem.addEventListener("blur", () => {
        if (!isOnSearch) {
            searchResultsElem.style.display = "none";
        } else {
            hasToBlur = true;
        }
    })
    searchbarElem.addEventListener("focus", (e) => {
        search(e.target.value, 7);
    })

    document.getElementById("search-form").addEventListener("submit", (e) => {
        e.preventDefault();
        return false;
    })
}

function select(layout_name) {
    fetch(`./stored_layouts/${layout_name}.json`)
        .then(res => res.json())
        .then((layout_obj) => setLayoutInfo(layout_obj));
}

// function fixLink(link) {
//     if (!link.startsWith("http")) {
//         return `https://${link}`;
//     }
//     return link;
// }

function setLayoutInfo(layout_obj) {
    let layout = layout_obj['layout'];
    let language = layout_obj['for_language'];
    // let link = layout_obj['link'];
    // if (link.length > 0) {
    //     layout_link_elem.href = fixLink(link);
    //     layout_link_elem.innerText = link;
    // }
    // layout_name_elem.innerText = layout_obj['name'];
    // layout_language_elem.innerText = language.replace("_", " ");
    // layout_author_elem.innerText = layout_obj['author']
    // layout_year_elem.innerText = layout_obj['year']

    setLayout(layout, language);
}

function setLayout(layout, language) {
    setLanguageData(language, true, layout);
}

export {initSearch as default};

