const popupContext = {};

; (function (context) {
    const CURRENT_WINDOW_ID = chrome.windows.WINDOW_ID_CURRENT;
    const tabs = document.getElementById("tabs");
    tabs.innerHTML = "";

    function showNoDuplicateTabsMessage() {
        tabs.innerHTML = `<h4 class="center">No Duplicate Tabs :)</h4>`;
    }

    function execludeChromeTabs(tabObject) {
        const urlObject = new URL(tabObject.url);
        return urlObject.protocol.indexOf("chrome") === -1;
    }

    // TODO remove this
    context.execludeChromeTabs = execludeChromeTabs;

    function getDuplicateTabs(windowTabs, tabsFilter) {
        debugger;
        if (!windowTabs || windowTabs.length < 1) {
            return [];
        }

        const occurrences = {};
        const duplicateValues = [];
        const filteredTabs = typeof (tabsFilter) === "function" ? windowTabs.filter(tabsFilter) : windowTabs;

        filteredTabs
            .forEach(tabObject => {
                const urlObject = new URL(tabObject.url);
                const urlString = urlObject.hostname + urlObject.pathname + (urlObject.search || "");
                console.log("urlString", urlString);
                if(occurrences[urlString]) {
                    duplicateValues.push(tabObject);
                    return;
                }

                occurrences[urlString] = true;
            });

        return duplicateValues;
    }

    // TODO remove this
    context.getDuplicateTabs = getDuplicateTabs;

    chrome.tabs.getAllInWindow(CURRENT_WINDOW_ID, windowTabs => {
        context.windowTabs = windowTabs;
        const duplicateTabs = getDuplicateTabs(windowTabs, execludeChromeTabs) || [];
        if (duplicateTabs && duplicateTabs.length > 0) {
            const formattedDuplicateTabs = duplicateTabs
                .map(tabObject => `<a href="#" data-id="${tabObject.id}" class="tab-btn">${tabObject.url}</a>`)
                .map(tabAncoher => `<li class="collection-item">${tabAncoher}</li>`);

            tabs.innerHTML = `
                <ul class="collection">
                <li class="collection-header"><h4>Duplicate Tabs</h4></li>
                    ${formattedDuplicateTabs.join("")}
                </ul>
            `;

            const tabLinks = document.querySelectorAll("#tabs a");
            tabLinks.forEach(element => {
                element.addEventListener("click", (e) => {
                    e.preventDefault();
                    const dataset = e.target.dataset;
                    if(dataset && dataset.id && !isNaN(parseInt(dataset.id))) {
                        const tabId = parseInt(dataset.id);
                        chrome.tabs.remove(tabId, () => {
                            e.target.parentElement.remove();
                            if(document.querySelector("#tabs ul").children.length === 1) {
                                showNoDuplicateTabsMessage();
                            }
                        });
                    }
                })
            });
        } else {
            showNoDuplicateTabsMessage();
            return;
        }
    });
})(popupContext);




