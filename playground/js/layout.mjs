import { prepareKey, analyze } from "./interact.mjs";

const keys = Array.from(document.querySelectorAll(".k"));
const languageElem = document.getElementById("languages");
let languageData;
let startIndex;
let excludedKeys = new Set();
let currentLanguageData = null;
let languageToIndex = {};

function _setLanguageData(data, repaintBetterOrWorse, newLayout = null, resetExcludedKeys) {
    currentLanguageData = data;
    let back = {};
    try {
        for (let k in languageData.convert) {
            back[languageData.convert[k]] = k;
        }
    } catch (e) {
        if (e.name !== "TypeError") {
            console.log("converting back failed because", e);
        }
    }

    for (let key of keys) {
        key.innerText = back[key.innerText] || key.innerText;
        key.innerText = data.convert[key.innerText] || key.innerText;
    }
    languageData = data;
    analyze(excludedKeys, languageData, repaintBetterOrWorse, resetExcludedKeys, newLayout);
}

function setLanguageData(language, repaintBetterOrWorse, newLayout = null) {
    for (let i = 30; i < keys.length; ++i) {
        keys[i].classList.add("excluded-key");
    }

    languageElem.selectedIndex = languageToIndex[language] || 0;

    if (currentLanguageData === null || currentLanguageData["language"] !== language) {
        fetch(`data/${language}.json`)
            .then((res) => res.json())
            .then(
                (json) => {
                    _setLanguageData(json, repaintBetterOrWorse, newLayout, false);
                },
                () => console.log("getting lanugage data failed :/")
            );
    } else {
        analyze(excludedKeys, currentLanguageData, repaintBetterOrWorse, true, newLayout);
    }
}

function initLayout() {
    setLanguageData("english", false);

    document.addEventListener("dragover", (e) => {
        e.preventDefault();
    }, false);

    for (let i = 0; i < keys.length; ++i) {
        let key = keys[i];
        key.index = i;

        key.oncontextmenu = () => {
            if (key.classList.contains("excluded-key")) {
                key.classList.remove("excluded-key");
                excludedKeys.delete(key.innerHTML);
            } else {
                key.classList.add("excluded-key");
                excludedKeys.add(key.innerHTML);
            }
            analyze(excludedKeys, languageData, false, false);
            return false;
        }

        key.addEventListener('dragstart', (event) => {
            key.classList.add('dragging');
            startIndex = i;
        })

        key.addEventListener('drop', (event) => {
            let endIndex = i;
            let startKey = '';
            try {
                startKey = keys[startIndex].innerHTML;
                keys[startIndex].innerHTML = keys[endIndex].innerHTML;
                keys[endIndex].innerHTML = startKey;

                let start_excluded = keys[startIndex].classList.contains("excluded-key");
                let end_excluded = keys[endIndex].classList.contains("excluded-key");
                let both_excluded = start_excluded && end_excluded;

                if (start_excluded &&!both_excluded) {
                    keys[endIndex].classList.add("excluded-key");
                    keys[startIndex].classList.remove("excluded-key");
                }
                else if (end_excluded && !both_excluded) {
                    keys[startIndex].classList.add("excluded-key");
                    keys[endIndex].classList.remove("excluded-key");
                }

                prepareKey(languageData["characters"], keys[startIndex]);
                prepareKey(languageData["characters"], keys[endIndex]);
            } catch {
                console.log("something is not going right lol");
            }
        })

        key.addEventListener('dragend', () => {
            key.classList.remove('dragging');
            analyze(excludedKeys, languageData, false, false);
        })
    }

    const languages = [
        "Albanian", "Bokmal", "Czech", "Dutch", "Dutch Repeat", "English Repeat", "English þ",
        "English2", "Esperanto", "Finnish", "Finnish Repeat", "French", "French Qu", "German",
        "Hebrew", "Hungarian", "Indonesian", "Italian", "Korean", "Malay", "Mt Quotes", "Nynorsk", "Pinyin",
        "Pinyin AN", "Polish", "Portuguese", "Russian", "Spanish", "Swedish", "Swiss", "Toki Pona", "Tr Quotes",
        "Ukranian", "Welsh", "Welsh Pure", "e200", "450k"
    ];

    for (let i = 0; i < languages.length; ++i) {
        let language = languages[i];
        let baseLanguage = language.toLowerCase().replace(" ", "_");
        
        languageToIndex[baseLanguage] = i + 1;

        let x = new Option(language, baseLanguage);
        languageElem.append(x);
    }

    languageElem.addEventListener("change", (c) => {
        const language = c.target.value;
        setLanguageData(language, true);
    })
}

export {initLayout as default, setLanguageData};
