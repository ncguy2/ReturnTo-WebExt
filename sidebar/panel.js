var windowId;
const contentBox = document.querySelector("#content");

// browser.runtime.onMessage.addListener(message => {
//     var id = message.id;
//     switch(id) {
//         case Messaging.Keys.RefreshPanel: Reload(); break;
//     }
// });

var panelMap = {};
var Types = {
    ADDITION: 1,
    UNDEFINED: 0,
    DELETION:-1
};

/**
 *
 * @returns Number from Types
 */
function GetType(change) {
    if(change['oldValue'] && !change['newValue'])
        return Types.DELETION;
    if(!change['oldValue'] && change['newValue'])
        return Types.ADDITION;
    return Types.UNDEFINED;
}

browser.storage.onChanged.addListener((changes, areaName) => {
    console.log("Storage change detected in " + areaName);
    console.dir(changes);

    var doReload = false;

    for(var c in changes) {
        var key = c;
        var change = changes[key];
        switch(GetType(change)) {
            case Types.ADDITION:
                AddEntry(key, change.newValue);
                console.log("Addition detected");
                break;
            case Types.DELETION:
                panelMap[key].remove();
                panelMap[key] = null;
                console.log("Deletion detected");
                break;
            case Types.UNDEFINED:
                doReload = true;
                console.log("Undefined change detected, reloading list...");
                break;
        }
    }
    if(doReload) Reload();
});

function Pad(num, width, pad) {
    pad = pad || '0';
    num = num + '';
    return num.length >= width ? num : new Array(width - num.length + 1).join(pad) + num;
}

/**
 * @return {string}
 */
function FormatDate(date) {
    let string = "";
    string += Pad(date.getDate(), 2) + "/";
    string += Pad(date.getMonth() + 1, 2) + "/";
    string += date.getFullYear();
    return string;
}

function BuildElement(key, data) {
    var ce = ReturnTo.DOM.CreateElement;
    var container = ce("div", {className:"entryContainer"}, {"data-key": key});

    var closeBtn = ce("button", {className:"ui button closeBtn"}, {}, container);
    ce("img", {src:"../icons/ReturnTo_closeBlack.svg",alt:"Close"}, {}, closeBtn);

    closeBtn.addEventListener("click", e => {
        if(!e) {
            console.log("No event");
            return;
        }
        if(!e.originalTarget) {
            console.log("No event target");
            return;
        }
        if(!e.originalTarget.parentElement) {
            console.log("No event target parent");
            return;
        }

        var parentElement = e.originalTarget.parentElement;
        while(!parentElement.classList.contains("entryContainer")) {
            if(parentElement.parentElement)
                parentElement = parentElement.parentElement;
            else {
                console.log("Unable to find parent");
                return;
            }
        }

        if(!parentElement.dataset) {
            console.log("No event target parent dataset");
            return;
        }
        if(!parentElement.dataset['key']) {
            console.dir(parentElement);
            console.log("No event target parent dataset key");
            return;
        }

        var key = parentElement.dataset['key'];
        console.log("Removing "+key);
        ReturnTo.Storage.Remove(key);
    });

    var content = ce("div", {className:"truncateParent"}, {}, container);
    if(!Builder.Build(content, data))
        container.classList.add("invalidEntry");
    ce("div", {className:"clearfix"}, {}, content);

    ce("span", {className:"returnTo timestamp", innerHTML:FormatDate(new Date(data.timeAdded))}, {}, container);
    const anchor = ce("div", {className: "returnTo anchor"}, {}, container);
    const anchorText = ce("span", {innerHTML: data.targetUrl}, {href: data.targetUrl}, anchor);
    ce("section", {}, {}, container).style.width = "100%";

    anchorText.addEventListener("click", e => {
        var href = e.originalTarget.innerHTML;
        if(!href) {
            console.log("No href found");
            e.originalTarget.style.color = "red";
            return;
        }

        ReturnTo.DOM.OpenTab(href, {active:e.ctrlKey});
        // browser.tabs.create({
        //     active:e.ctrlKey,
        //     url:href
        // });
    });

    return container;
}

function AddEntry(key, data) {
    var element = BuildElement(key, data);
    panelMap[key] = element;
    document.querySelector("#body").appendChild(element);
}

function Reload() {
    var table = document.querySelector("#body");
    table.innerHTML = "";
    ReturnTo.Storage.Get(null, index => {
        for(var i in index)
            AddEntry(i, index[i]);
    });
}

Reload();

function Open(e) {
    var href = "/sidebar/panel.html";
    ReturnTo.DOM.OpenTab(href, {active:true});
}

function OpenSettings() {
    browser.runtime.openOptionsPage();
}

document.querySelector("#clearBtn").addEventListener("click", ReturnTo.Storage.Clear);
document.querySelector("#openBtn").addEventListener("click", Open);
document.querySelector("#settingBtn").addEventListener("click", OpenSettings);