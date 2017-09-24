var panelMap = {};


const themes = {
    "light": "panel.light.css",
    "dark": "panel.dark.css"
};
themes.default = themes.light;

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
    var container = ce("div", {className:"themeable entryContainer clickable"}, {"data-key": key});
    ReturnTo.DOM.AddTooltip(container, data.pageTitle, "bottom center");

    container.data = data;

    container.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const data = e.currentTarget.data;
        ReturnTo.DOM.OpenTarget(data.targetUrl, data.scrollTop);
    });

    var closeBtn = ce("button", {className:"ui button themeable photonBtn closeBtn"}, {}, container);
    //    const icon = ce("img", {src:GetIconForBookmarkType(data.type, ), className:"themeableIcon"}, {"data-type":data.type}, iconContainer);
    // ce("img", {src:GetIconForBookmarkType(ReturnTo.Constants.Keys.CloseButton),alt:"Close", className:"themeableIcon"}, {"data-type":ReturnTo.Constants.Keys.CloseButton}, closeBtn);

    GetSVGIcon(ReturnTo.Constants.Keys.CloseButton, ReturnTo.Globals.darkThemeActive ? "dark" : "light", closeBtn);

    closeBtn.addEventListener("click", e => {

        e.preventDefault();
        e.stopPropagation();

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

    var content = ce("div", {className:"truncateParent themeable"}, {}, container);
    if(!Builder.Build(content, data))
        container.classList.add("invalidEntry");
    ce("div", {className:"clearfix"}, {}, content);

    ce("span", {className:"returnTo timestamp", innerHTML:FormatDate(new Date(data.timeAdded))}, {}, container);

    const iconContainer = ce("div", {className:"returnTo icon"}, {}, container);
    GetSVGIcon(data.type, "", iconContainer, true, svg => {
        svg.classList.add("photon", "fit");
    });
    // const icon = ce("img", {src:GetIconForBookmarkType(data.type), className:"themeableIcon"}, {"data-type":data.type}, iconContainer);
    iconContainer.style.width = iconContainer.style.height = "24px";
    iconContainer.style.position = "absolute";
    iconContainer.style.bottom = iconContainer.style.left = "0px";

    const anchor = ce("div", {className: "returnTo anchor"}, {}, container);
    const anchorText = ce("span", {innerHTML: data.targetUrl}, {href: data.targetUrl}, anchor);
    ce("section", {}, {}, container).style.width = "100%";

    anchorText.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
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
    console.dir(data);
    var element = BuildElement(key, data);
    panelMap[key] = element;
    document.querySelector("#body").appendChild(element);
}

function Reload() {
    var table = document.querySelector("#body");
    table.innerHTML = "";
    ReturnTo.Storage.Get(null, index => {
        for(let i in index) {
            const data = index[i];
            const sig = data['signature'];
            if(sig && sig === ReturnTo.Storage.Signatures.Entry)
                AddEntry(i, data);
        }
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

function OpenStorage() {
    ReturnTo.DOM.OpenTab("/pages/Storage.html", {active:true});
}

function ToggleDarkTheme() {
    ReturnTo.Globals.darkThemeActive = !ReturnTo.Globals.darkThemeActive;
    UseDarkTheme();
    ReturnTo.Storage.SetSetting(ReturnTo.Settings.Registry.Global_DarkTheme.id, ReturnTo.Globals.darkThemeActive);
}

function UseDarkTheme() {
    const elements = document.getElementsByClassName("themeable");
    for(let i in elements) {
        const e = elements[i];
        if(e.tagName) {
            if (ReturnTo.Globals.darkThemeActive)
                e.classList.add("dark_theme");
            else e.classList.remove("dark_theme");
        }
    }

    const buttons = document.getElementsByClassName("buttons");
    for(let i in buttons) {
        const btn = buttons[i];
        if(btn instanceof HTMLElement) {
            if(ReturnTo.Globals.darkThemeActive)
                btn.classList.add("secondary");
            else btn.classList.remove("secondary");
            // btn.classList.toggle("secondary")
        }
    }

    const icons = document.getElementsByClassName("themeableIcon");
    for(let i in icons) {
        const icon = icons[i];
        if(icon instanceof HTMLElement) {
            const type = icon.getAttribute("data-type");
            icon.src = GetIconForBookmarkType(type);
        }
    }
}

function OpenSettingsSidebar() {
    const element = document.getElementById("settingContent");
    if(!element.classList.contains("active"))
        element.classList.add("active");
}

function CloseSettingsSidebar() {
    const element = document.getElementById("settingContent");
    if(element.classList.contains("active"))
        element.classList.remove("active");
}

document.addEventListener(ReturnTo.Events.Signatures.NewEntry, event => {
    const detail = event.detail;
    const key = detail.key;
    const data = detail.data;
    AddEntry(key, data);
});

document.addEventListener(ReturnTo.Events.Signatures.DelEntry, event => {
    const detail = event.detail;
    const key = detail.key;
    panelMap[key].remove();
    panelMap[key] = null;
});

document.addEventListener(ReturnTo.Events.Signatures.RefEntry, _ => {
    Reload();
});

document.addEventListener(ReturnTo.Events.Signatures.ModSetting, event => {
    const detail = event.detail;
    const key = detail.key;
    const value = detail.value;
    if(key === ReturnTo.Settings.Registry.Global_DarkTheme.id) {
        ReturnTo.Globals.darkThemeActive = value;
        UseDarkTheme();
    }
});

if(document.querySelector("#sidebar_backBtn")) {
    const element = document.querySelector("#sidebar_backBtn");
    element.addEventListener("click", CloseSettingsSidebar);
}

// if(document.querySelector("#clearBtn")) document.querySelector("#clearBtn").addEventListener("click", ReturnTo.Storage.Clear);
// if(document.querySelector("#settingBtn")) document.querySelector("#settingBtn").addEventListener("click", OpenSettings);
// if(document.querySelector("#storageBtn")) document.querySelector("#storageBtn").addEventListener("click", OpenStorage);
// if(document.querySelector("#toggleBtn")) document.querySelector("#toggleBtn").addEventListener("click", ToggleDarkTheme);

// if(document.querySelector("#OpenSettingSidebar"))
//     document.querySelector("#OpenSettingSidebar").addEventListener("click", OpenSettingsSidebar);

ReturnTo.DOM.UsingNode("#clearBtn",             btn => { btn.addEventListener("click", ReturnTo.Storage.Clear); });

ReturnTo.DOM.UsingNode("#settingBtn",           btn => { btn.addEventListener("click", OpenSettings);           });
ReturnTo.DOM.UsingNode("#storageBtn",           btn => { btn.addEventListener("click", OpenStorage);            });
ReturnTo.DOM.UsingNode("#toggleBtn",            btn => { btn.addEventListener("click", ToggleDarkTheme);        });
ReturnTo.DOM.UsingNode("#OpenSettingSidebar",   btn => { btn.addEventListener("click", OpenSettingsSidebar);    });

ReturnTo.DOM.UsingNode("#importBtn",            btn => { btn.addEventListener("click", ReturnTo.Storage.Import);});

UseDarkTheme();