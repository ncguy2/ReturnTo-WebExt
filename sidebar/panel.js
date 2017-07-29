var windowId;
const contentBox = document.querySelector("#content");

// browser.runtime.onMessage.addListener(message => {
//     var id = message.id;
//     switch(id) {
//         case Messaging.Keys.RefreshPanel: Reload(); break;
//     }
// });

browser.storage.onChanged.addListener((changes, areaName) => {
    console.log("Storage change detected in " + areaName);
    console.dir(changes);

    Reload();
});

function BuildElement(key, data) {
    var ce = ReturnTo.DOM.CreateElement;
    var container = ce("div", {className:"entryContainer"}, {"data-key": key});

    var closeBtn = ce("button", {className:"ui button closeBtn"}, {}, container);
    ce("img", {src:"../icons/ReturnTo_closeBlack.svg",alt:"Close"}, {}, closeBtn);

    closeBtn.addEventListener("click", e => {
        // ReturnTo.Storage.Remove()
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

    var p = ce("div", {className:"truncateParent"}, {}, container);
    ce("p", {className:"truncate", innerHTML:data.targetText}, {}, p);
    ce("div", {className:"clearfix"}, {}, container);
    var anchor = ce("div", {className:"returnTo anchor"}, {}, container);
    var anchorText = ce("span", {innerHTML:data.targetUrl}, {href:data.targetUrl}, anchor);
    ce("section", {}, {}, container).style.width = "100%";

    anchorText.addEventListener("click", e => {
        var href = e.originalTarget.innerHTML;
        if(!href) {
            console.log("No href found");
            e.originalTarget.style.color = "red";
            return;
        }

        browser.tabs.create({
            active:e.ctrlKey,
            url:href
        });
    });

    return container;
}

function AddEntry(key, data) {
    document.querySelector("#body").appendChild(BuildElement(key, data));
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

document.querySelector("#clearBtn").addEventListener("click", ReturnTo.Storage.Clear);