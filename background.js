let listeners = {};

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

function BuildGenericTarget(type, pageUrl, scrollTop) {
    scrollTop = scrollTop || 0;
    return {
        type: type,
        targetUrl: pageUrl,
        timeAdded: Math.floor(Date.now()),
        scrollTop: scrollTop
    };
}

function Add(type, pageUrl, extraData) {
    ReturnTo.Storage.Add(Prep(type, pageUrl, extraData));
}

function AddData(data) {
    ReturnTo.Storage.Add(data);
}

function Prep(type, pageUrl, extraData) {
    let target = BuildGenericTarget(type, pageUrl);
    if(extraData) for(const i in extraData)
        target[i] = extraData[i];
    return target;
}

function RequestNewScrollTop(tab, data, callback) {
    const id = ReturnTo.Storage.UUIDv4();
    RequestScrollTop(id, tab, data, callback);
    return id;
}

function RequestScrollTop(id, tab, data, callback) {
    var tabId = tab.id;

    var listener = {
        data:data,
        callback:callback
    };

    listeners[id] = listener;

    browser.tabs.executeScript(tabId, {
        code:"" +
        "var top = window.pageYOffset || document.documentElement.scrollTop;\n" +
        "browser.runtime.sendMessage({id:\""+id+"\",scrollTop:top});"
    });
}

function StoreSelected(info, tab) {
    let store = Prep(ReturnTo.Constants.StorageTypes.Selection, info['pageUrl'], {pageTitle: tab['title'], targetText: info['selectionText']});
    const id = ReturnTo.Storage.UUIDv4();
    RequestScrollTop(id, tab, store, AddData);
}

function StorePage(info, tab) {
    Add(ReturnTo.Constants.StorageTypes.Page, info['pageUrl'], {pageTitle: tab['title']})
}

function StoreImage(info, tab) {
    var data = Prep(ReturnTo.Constants.StorageTypes.Image, info['pageUrl'], {
        pageTitle: tab['title'],
        imageUrl: info['srcUrl']
    });
    RequestNewScrollTop(tab, data, AddData);
}

function StoreLink(info, tab) {
    Add(ReturnTo.Constants.StorageTypes.Link, info['linkUrl'], {pageTitle: info['linkText']});
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    var id = msg.id;
    var scroll = msg.scrollTop;
    if(listeners[id]) {
        var listener = listeners[id];
        listener.data['scrollTop'] = scroll;
        listener.callback(listener.data);
    }
});

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
browser.contextMenus.create({
    id: "store-link",
    title: browser.i18n.getMessage("contextMenuItem.LinkStore"),
    contexts: ["link"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
   switch(info.menuItemId) {
       case "store-selection":  StoreSelected(info, tab);   break;
       case "store-page":       StorePage(info, tab);       break;
       case "store-image":      StoreImage(info, tab);      break;
       case "store-link":       StoreLink(info, tab);       break;
   }
});
