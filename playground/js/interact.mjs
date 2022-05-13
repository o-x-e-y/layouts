import analyzeLayout from "./where_the_magic_happens.mjs";

const keys = Array.from(document.querySelectorAll(".k"));
const fingerFrequencyElements = Array.from(document.querySelectorAll("#finger-frequency-table tr td.usage-p"));
const leftHand = document.getElementById("usage-left");
const rightHand = document.getElementById("usage-right");
const leftCenter = document.getElementById("center-usage-left");
const rightCenter = document.getElementById("center-usage-right");
const homerowUsage = document.getElementById("homerow-usage");
const sfbFrequencyElements = Array.from(document.querySelectorAll("#sfb-frequency-table tr td.sfb-p"))
const sfbElement = document.getElementById("stat-sfb");
const dsfbElement = document.getElementById("stat-dsfb");
const lsbElement = document.getElementById("stat-lsb");

const inrollElement = document.getElementById("stat-inroll");
const outrollElement = document.getElementById("stat-outroll");
const totalRollElement = document.getElementById("stat-total-roll");
const onehandElement = document.getElementById("stat-onehand");
const alternateElement = document.getElementById("stat-alternate");
const alternateSfsElement = document.getElementById("stat-alternate-sfs");
const totalAlternateElement = document.getElementById("stat-total-alternate");
const redirectElement = document.getElementById("stat-redirect");
const badRedirectElement = document.getElementById("stat-bad-redirect");
const totalRedirectElement = document.getElementById("stat-total-redirect");
const otherElement = document.getElementById("stat-other");
const invalidElement = document.getElementById("stat-invalid");

function prepareKey(characterData, key) {
    let prevalence = characterData[key.innerText] || 0;
    let complement = 190 - prevalence * 1750;
    key.style.backgroundColor = `rgb(175, ${complement}, ${complement})`;
    key.title = `Key usage: ${(Math.round(prevalence * 100000) / 1000).toFixed(2)}%`;
}

function prepareKeys(layout, characterData, excludedKeys, resetExcludedKeys) {
    for (let i = 0; i < keys.length; ++i) {
        keys[i].innerText = layout.charAt(i);
        prepareKey(characterData, keys[i]);
    }
    if (resetExcludedKeys) {
        keys.forEach(key => key.classList.remove("excluded-key"));
        excludedKeys.clear();
    }
}

function betterOrWorseSfb(sfbPast, frequencyElement) {
    let sfbPresent = parseFloat(frequencyElement.innerText);
    if (sfbPast === sfbPresent) {
        frequencyElement.style.borderColor = '#555';
        frequencyElement.style.backgroundColor = '';
        frequencyElement.title = '';
    } else if (sfbPast > sfbPresent) {
        frequencyElement.style.borderColor = '#080';
        frequencyElement.style.backgroundColor = '#454';
        frequencyElement.title = `difference: ${(sfbPast - sfbPresent).toFixed(3)}%`;
    } else {
        frequencyElement.style.borderColor = '#a00';
        frequencyElement.style.backgroundColor = '#544';
        frequencyElement.title = `difference: ${(sfbPast - sfbPresent).toFixed(3)}%`;
    }
}

function betterOrWorseStat(elem, cur, lowerIsBetter) {
    let prev = parseFloat(elem.innerText);
    let diff = prev - cur * 100;
    let absDiff = Math.abs(diff)
    if (lowerIsBetter) {
        diff = -diff;
    }
    
    if (absDiff < 0.001) {
        elem.style.backgroundColor = '';
        elem.title = '';
    } else if (diff < -0.001) {
        elem.style.backgroundColor = `rgb(68, ${Math.min(68+absDiff*(3/cur), 175)}, 68)`;
        elem.title = `difference: ${(prev - cur*100).toFixed(3)}%`;
    } else {
        elem.style.backgroundColor = `rgb(${Math.min(68+absDiff*(3/cur), 175)}, 68, 68)`;
        elem.title = `difference: ${(prev - cur*100).toFixed(3)}%`;
    }
}

function analyze(excludedKeys, languageData, betterOrWorse, resetExcludedKeys, newLayout=null) {
    let layout = "";
    if (newLayout === null || newLayout.length !== 30) {
        keys.forEach(key => layout += key.innerText);
    } else {
        layout = newLayout;
    }
	
    let data = analyzeLayout(layout, excludedKeys, languageData);
    prepareKeys(layout, languageData["characters"], excludedKeys, resetExcludedKeys);

    let sfbTotal = 0, sfbElemPast0 = 0, sfbElemPast1 = 0;
    let totalUsageRight = 0, totalUsageLeft = 0;

    for (let i = 0; i < 4; ++i) {
        fingerFrequencyElements[i * 2].innerText = (data.fingerUsage[i] * 100).toFixed(2) + '%';
        fingerFrequencyElements[i * 2 + 1].innerText = (data.fingerUsage[9 - i] * 100).toFixed(2) + '%';
        totalUsageRight += data.fingerUsage[9 - i];
        totalUsageLeft += data.fingerUsage[i];

        sfbElemPast0 = parseFloat(sfbFrequencyElements[i * 2].innerText);
        sfbElemPast1 = parseFloat(sfbFrequencyElements[i * 2 + 1].innerText);

        sfbFrequencyElements[i * 2].innerText = (data.fingerSfb[i] * 100).toFixed(3) + '%';
        sfbFrequencyElements[i * 2 + 1].innerText = (data.fingerSfb[9 - i] * 100).toFixed(3) + '%';
        if (betterOrWorse) {
            betterOrWorseSfb(sfbElemPast0, sfbFrequencyElements[i * 2]);
            betterOrWorseSfb(sfbElemPast1, sfbFrequencyElements[i * 2 + 1]);
        }

        sfbTotal += data.fingerSfb[i] + data.fingerSfb[9 - i];
    }
    leftHand.innerText = `Left hand: ${((totalUsageLeft) * 100).toFixed(2)}%`;
    rightHand.innerText = `Right hand: ${(totalUsageRight * 100).toFixed(2)}%`;
    leftCenter.innerText = `Left center: ${(data.centerUsage.left * 100).toFixed(3)}%`;
    rightCenter.innerText = `Right center: ${(data.centerUsage.right * 100).toFixed(3)}%`;
    homerowUsage.innerText = `Home keys usage: ${(data.centerUsage.homerow * 100).toFixed(2)}%`;
    
    let trigrams = data.trigramFreqs;

    betterOrWorseStat(sfbElement, sfbTotal, true);
    betterOrWorseStat(dsfbElement, data.dsfbTotal, true);
    betterOrWorseStat(lsbElement, data.lsbTotal, true);
    betterOrWorseStat(inrollElement, trigrams.inrolls, false);
    betterOrWorseStat(outrollElement, trigrams.outrolls, false);
    betterOrWorseStat(totalRollElement, (trigrams.inrolls+trigrams.outrolls), false);
    betterOrWorseStat(onehandElement, trigrams.onehands, false);
    betterOrWorseStat(alternateElement, trigrams.alternates, false);
    betterOrWorseStat(alternateSfsElement, trigrams.alternatesSfs, false);
    betterOrWorseStat(totalAlternateElement, (trigrams.alternates+trigrams.alternatesSfs), false);
    betterOrWorseStat(redirectElement, trigrams.redirects, true);
    betterOrWorseStat(badRedirectElement, trigrams.badRedirects, true);
    betterOrWorseStat(totalRedirectElement, (trigrams.redirects+trigrams.badRedirects), true);

    sfbElement.innerText = `${(sfbTotal * 100).toFixed(3)}%`;
    dsfbElement.innerText = `${(data.dsfbTotal * 100).toFixed(3)}%`;
    lsbElement.innerText = `${(data.lsbTotal * 100).toFixed(3)}%`;
    inrollElement.innerText = `${(trigrams.inrolls * 100).toFixed(3)}%`;
    outrollElement.innerText = `${(trigrams.outrolls * 100).toFixed(3)}%`;
    totalRollElement.innerText = `${((trigrams.inrolls+trigrams.outrolls) * 100).toFixed(3)}%`;
    onehandElement.innerText = `${(trigrams.onehands * 100).toFixed(3)}%`;
    alternateElement.innerText = `${(trigrams.alternates * 100).toFixed(3)}%`;
    alternateSfsElement.innerText = `${(trigrams.alternatesSfs * 100).toFixed(3)}%`;
    totalAlternateElement.innerText = `${((trigrams.alternates+trigrams.alternatesSfs) * 100).toFixed(3)}%`;
    redirectElement.innerText = `${(trigrams.redirects * 100).toFixed(3)}%`;
    badRedirectElement.innerText = `${(trigrams.badRedirects * 100).toFixed(3)}%`;
    totalRedirectElement.innerText = `${((trigrams.redirects+trigrams.badRedirects) * 100).toFixed(3)}%`;
    otherElement.innerText = `${(trigrams.other * 100).toFixed(3)}%`;
    invalidElement.innerText = `${(trigrams.invalid * 100).toFixed(3)}%`;
}

export {analyze, prepareKey};