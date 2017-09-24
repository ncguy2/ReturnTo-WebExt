function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/**
 * @return {string}
 */
function FormatDate(unix) {
    var date = new Date(unix);
    var str = "";

    str += date.getFullYear() + "/";
    str += pad(date.getMonth()+1, 2) + "/";
    str += pad(date.getDate(), 2);

    str += " - ";

    str += pad(date.getHours(), 2) + ":";
    str += pad(date.getMinutes(), 2) + ":";
    str += pad(date.getSeconds(), 2);

    return str;
}

function LoadSignature(parent, signature, func) {
    const tbody = document.getElementById(parent);
    while (tbody.hasChildNodes())
        tbody.removeChild(tbody.lastChild);

    ReturnTo.Storage.Get(null, index => {
        console.log("Entries: " + index);
        for(let i in index) {
            const data = index[i];
            const sig = data['signature'];
            if(sig && sig === signature)
                func(data, tbody, i);
        }
    });
}

function BuildEntryRow(entry, parent) {
    const ce = ReturnTo.DOM.CreateElement;
    const tr = ce("tr", {className:"themeable entryRow clickable"}, {}, parent);
    tr.data = entry;

    tr.addEventListener("click", e => {
        console.dir(e);
        const data = e.currentTarget.data;
        ReturnTo.DOM.OpenTarget(data.targetUrl, data.scrollTop);
    });

    ce("td", {innerHTML:entry.pageTitle}, {}, tr);
    ce("td", {innerHTML:entry.targetUrl}, {}, tr);
    ce("td", {innerHTML:entry.type}, {}, tr);
    ce("td", {innerHTML:entry.scrollTop}, {}, tr);
    ce("td", {innerHTML:FormatDate(entry.timeAdded)}, {}, tr);
}

function LoadEntries() {
    LoadSignature("entryTbody", ReturnTo.Storage.Signatures.Entry, BuildEntryRow);
}

function BuildSettingRow(setting, parent, key) {
    const ce = ReturnTo.DOM.CreateElement;
    const tr = ce("tr", {}, {}, parent);

    ce("td", {innerHTML:ReturnTo.Settings.Registry[key].name}, {}, tr);
    ce("td", {id:key+"_entry",innerHTML:setting.value}, {}, tr);
}

function LoadSettings() {
    LoadSignature("settingTbody", ReturnTo.Storage.Signatures.Setting, BuildSettingRow);
}

function StorageUseDarkTheme() {
    const elements = document.getElementsByClassName("themeable");
    for(let i in elements) {
        const e = elements[i];
        if(!e.tagName) continue;
        if(e.classList.contains("ui button")) {
            if(ReturnTo.Globals.darkThemeActive)
                e.classList.add("secondary");
            else e.classList.remove("secondary");
        }else if(e instanceof HTMLElement) {
            if (ReturnTo.Globals.darkThemeActive)
                e.classList.add("dark_theme");
            else e.classList.remove("dark_theme");
        }
    }

    const buttons = document.getElementsByClassName("button");
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

    ReturnTo.DOM.ForEachNode("themeableTable", table => {
        if(ReturnTo.Globals.darkThemeActive)
            table.classList.add("inverted");
        else table.classList.remove("inverted")
    })
}


function LoadExportData(func) {
    const exportData = {};
    ReturnTo.Storage.Get(null, index => {
        for(let i in index) {
            const data = index[i];
            const sig = data['signature'];
            if(sig && sig === ReturnTo.Storage.Signatures.Entry)
                exportData[i] = data;
        }
        func(exportData);
    });
}

document.addEventListener(ReturnTo.Events.Signatures.ModSetting, event => {
    const detail = event.detail;
    const key = detail.key;
    const value = detail.value;

    const element = document.getElementById(key+"_entry");
    if(element)
        element.innerHTML = value;

    if(key === ReturnTo.Settings.Registry.Global_DarkTheme.id) {
        ReturnTo.Globals.darkThemeActive = value;
        StorageUseDarkTheme();
    }
});

ReturnTo.DOM.UsingNode("#ShowExportSidebar", btn => {
    btn.addEventListener("click", (e) => {
        ReturnTo.DOM.UsingNode("#exportContent", sidebar => {
            if(!sidebar.classList.contains("active"))
                sidebar.classList.add("active");
        })
    })
});

ReturnTo.DOM.UsingNode("#sidebar_backBtn", btn => {
    btn.addEventListener("click", (e) => {
        ReturnTo.DOM.UsingNode("#exportContent", sidebar => {
            if(sidebar.classList.contains("active"))
                sidebar.classList.remove("active");
        })
    })
});

LoadEntries();
LoadSettings();

ReturnTo.DOM.UsingNode("#exportData", node => {
    while(node.firstChild)
        node.lastChild.remove();
    LoadExportData(data => {
        ReturnTo.DOM.CreateElement("textarea", {innerHTML:JSON.stringify(data, null, 2)}, {readonly:"readonly"}, node);
    })
});

StorageUseDarkTheme();