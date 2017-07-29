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

function BuildGenericTarget(type, pageUrl) {
    return {
        type: type,
        targetUrl: pageUrl,
        timeAdded: Math.floor(Date.now())
    };
}

function Add(type, pageUrl, extraData) {
    let target = BuildGenericTarget(type, pageUrl);
    if(extraData) for(const i in extraData)
        target[i] = extraData[i];
    ReturnTo.Storage.Add(target);
}

function StoreSelected(info, tab) {
    Add(ReturnTo.Constants.StorageTypes.Selection, info['pageUrl'], {targetText: info['selectionText']})
}

function StorePage(info, tab) {
    Add(ReturnTo.Constants.StorageTypes.Page, info['pageUrl'], {pageTitle: tab['title']})
}

function StoreImage(info, tab) {
    Add(ReturnTo.Constants.StorageTypes.Image, info['pageUrl'], {
        pageTitle: tab['title'],
        imageUrl: info['srcUrl']
    });
}

browser.contextMenus.create({
    id: "store-open",
    title: browser.i18n.getMessage("contextMenuItem.SidebarOpen"),
    command: "_execute_sidebar_action",
    contexts: ["all"]
});
browser.contextMenus.create({
    id: "store-page",
    title: browser.i18n.getMessage("contextMenuItem.PageStore"),
    contexts: ["page", "selection", "image"]
});
browser.contextMenus.create({
    id: "store-selection",
    title: browser.i18n.getMessage("contextMenuItem.SelectionStore"),
    contexts: ["selection"]
});
browser.contextMenus.create({
    id: "store-image",
    title: browser.i18n.getMessage("contextMenuItem.ImageStore"),
    contexts: ["image"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
   switch(info.menuItemId) {
       case "store-selection": StoreSelected(info, tab); break;
       case "store-page": StorePage(info, tab); break;
       case "store-image": StoreImage(info, tab); break;
   }
});
