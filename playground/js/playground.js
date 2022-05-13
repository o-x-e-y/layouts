import initLayout from "./layout.mjs";
import initSearch from "./search.mjs";

const kbWrapperElem = document.querySelector(".kb-wrapper");
const keys = Array.from(document.querySelectorAll(".k"));
const trigramWrapperElem = document.getElementById("trigrams-wrapper");


window.onload = () => {
    kbWrapperElem.addEventListener("click", () => {
        let copy_layout = ""
        for (let i = 0; i < keys.length; ++i) {
            copy_layout += keys[i].innerText;
            if ((i+6)%10==0) {
                copy_layout += " "
            }
            if (i%10 < 9) {
                copy_layout += " "
            } else if (i < keys.length - 1) {
                copy_layout += "\n"
            }
        }
        navigator.clipboard.writeText(copy_layout)
    })

    trigramWrapperElem.addEventListener("click", () => {
        let stats = trigramWrapperElem.innerText.split('\n');
        let splits = [2, 6, 9, 12];
        let res = "";
        for (let i = 0; i < stats.length; ++i) {
            res += stats[i] + "\n";
            if (splits.includes(i)) {
                res += "\n";
            }
        }
        navigator.clipboard.writeText(res);
    })

    initLayout();

    initSearch();
}