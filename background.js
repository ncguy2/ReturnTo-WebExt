function onCreated() {
    if(browser.runtime.lastError) {
        console.log(`Error: ${browser.runtime.lastError}`);
    }else{
        console.log("Item created successfully")
    }
}

function onRemoved() {
    console.log("Item removed successfully");
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function StoreSelected(info, tab) {
    console.log("Info");
    console.dir(info);
    console.log("Tab");
    console.dir(tab);

    var target = {
        targetUrl: info['pageUrl'],
        targetText: info['selectionText']
    };

    ReturnTo.Storage.Add(target, ReloadPanel);
}

function ReloadPanel() {
    // browser.runtime.sendMessage({id:Messaging.Keys.RefreshPanel});
}

browser.contextMenus.create({
    id: "store-selection",
    title: browser.i18n.getMessage("contextMenuItemSelectionStore"),
    contexts: ["selection"]
}, onCreated);

browser.contextMenus.onClicked.addListener((info, tab) => {
   switch(info.menuItemId) {
       case "store-selection": StoreSelected(info, tab); break;
   }
});
