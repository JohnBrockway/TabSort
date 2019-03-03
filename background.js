chrome.commands.onCommand.addListener(function(command) {
    if (command == "sort") {
        const queryInfo = {
            currentWindow: true
        };
        chrome.tabs.query(queryInfo, sort);
    }
});

function sort(tabs) {
    const pinnedTabs = tabs.filter(tab => tab.pinned);
    const unpinnedTabs = tabs.filter(tab => !tab.pinned);
    const sortedPinnedTabs = selectionSort(pinnedTabs);
    const sortedUnpinnedTabs = selectionSort(unpinnedTabs);
    const sortedTabs = sortedPinnedTabs.concat(sortedUnpinnedTabs);
    for (let i = 0 ; i < sortedTabs.length ; i++) {
        moveTab(sortedTabs[i].id, i);
    }
}

function selectionSort(tabs) {
    for (let i = 0 ; i < tabs.length - 1 ; i++) {
        let minIndex = i;
        for (let j = i+1 ; j < tabs.length ; j++) {
            if (lesserUrl(tabs[j].url, tabs[minIndex].url)) {
                minIndex = j;
            }
        }
        
        if (i != minIndex) {
            const temp = tabs[i];
            tabs[i] = tabs[minIndex];
            tabs[minIndex] = temp;
        }
    }
    return tabs;
}

function moveTab(tabId, destination) {
    const moveProperties = {
        index: destination
    };
    chrome.tabs.move(tabId, moveProperties);
}

// Returns true if urlA is lower sequentially than urlB, false otherwise
function lesserUrl(urlA, urlB) {
    const domainA = extractRootDomain(urlA);
    const domainB = extractRootDomain(urlB);
    if (domainA < domainB) {
        return true;
    }
    else if (domainA > domainB) {
        return false;
    }
    else {
        const hostnameAArray = getSubDomains(urlA).split('.').reverse();
        const hostnameBArray = getSubDomains(urlB).split('.').reverse();
        for (let i = 0 ; i < hostnameAArray.length || i < hostnameBArray.length ; i++) {
            if (i >= hostnameAArray.length && i < hostnameBArray.length) {
                return false;
            }
            else if (i >= hostnameBArray.length && i < hostnameAArray.length) {
                return true;
            }
            else if (hostnameAArray[i] < hostnameBArray[i]) {
                return true;
            }
            else if (hostnameAArray[i] > hostnameBArray[i]) {
                return false;
            }
        }
        const pathA = urlA.split(extractHostname(urlA))[1];
        const pathB = urlB.split(extractHostname(urlB))[1];
        if (pathA < pathB) {
            return true;
        }
        else {
            return false;
        }
    }
}

// Credit for this function: https://stackoverflow.com/a/23945027
function extractHostname(url) {
    let hostname;
    hostname = url.indexOf("//") > -1 
                ? url.split('/')[2]
                : url.split('/')[0];

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    return hostname;
}

// Credit for this function: https://stackoverflow.com/a/23945027
function extractRootDomain(url) {
    let domain = extractHostname(url);
    let splitArr = domain.split('.');
    let arrLen = splitArr.length;

    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        // check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            // this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}

function getSubDomains(url) {
    return extractHostname(url).split('.' + extractRootDomain(url))[0];
}
