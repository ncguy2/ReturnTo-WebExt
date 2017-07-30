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

/**
 *
 * @param type
 * @returns String filepath to svg file
 */
function GetIconForBookmarkType(type) {
    switch(type) {
        case ReturnTo.Constants.StorageTypes.Page: return "/icons/types/ReturnTo_typePage.svg";
        case ReturnTo.Constants.StorageTypes.Selection: return "/icons/types/ReturnTo_typeSelection.svg";
        case ReturnTo.Constants.StorageTypes.Image: return "/icons/types/ReturnTo_typeImage.svg";
        case ReturnTo.Constants.StorageTypes.Link: return "/icons/types/ReturnTo_typeLink.svg";
        default: return "/icons/types/ReturnTo_typeUnknown.svg";
    }
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
    var container = ce("div", {className:"entryContainer clickable"}, {"data-key": key});
    ReturnTo.DOM.AddTooltip(container, data.pageTitle, "bottom center");

    container.data = data;

    container.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const data = e.currentTarget.data;
        let tab = ReturnTo.DOM.OpenTab(data.targetUrl, {active:true});
        if(data.scrollTop && data.scrollTop > 0) {
                browser.tabs.executeScript(tab.id, {
                    code: "" +
                    "window.requestAnimFrame = (function(){\n" +
                    "  return  window.requestAnimationFrame       ||\n" +
                    "          window.webkitRequestAnimationFrame ||\n" +
                    "          window.mozRequestAnimationFrame    ||\n" +
                    "          function( callback ){\n" +
                    "            window.setTimeout(callback, 1000 / 60);\n" +
                    "          };\n" +
                    "})();\n" +
                    "\n" +
                    "// main function\n" +
                    "function scrollToY(scrollTargetY, speed, easing) {\n" +
                    "    // scrollTargetY: the target scrollY property of the window\n" +
                    "    // speed: time in pixels per second\n" +
                    "    // easing: easing equation to use\n" +
                    "\n" +
                    "    var scrollY = window.scrollY || document.documentElement.scrollTop,\n" +
                    "        scrollTargetY = scrollTargetY || 0,\n" +
                    "        speed = speed || 2000,\n" +
                    "        easing = easing || 'easeOutSine',\n" +
                    "        currentTime = 0;\n" +
                    "\n" +
                    "    // min time .1, max time .8 seconds\n" +
                    "    var time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, .8));\n" +
                    "\n" +
                    "    // easing equations from https://github.com/danro/easing-js/blob/master/easing.js\n" +
                    "    var easingEquations = {\n" +
                    "            easeOutSine: function (pos) {\n" +
                    "                return Math.sin(pos * (Math.PI / 2));\n" +
                    "            },\n" +
                    "            easeInOutSine: function (pos) {\n" +
                    "                return (-0.5 * (Math.cos(Math.PI * pos) - 1));\n" +
                    "            },\n" +
                    "            easeInOutQuint: function (pos) {\n" +
                    "                if ((pos /= 0.5) < 1) {\n" +
                    "                    return 0.5 * Math.pow(pos, 5);\n" +
                    "                }\n" +
                    "                return 0.5 * (Math.pow((pos - 2), 5) + 2);\n" +
                    "            }\n" +
                    "        };\n" +
                    "\n" +
                    "    // add animation loop\n" +
                    "    function tick() {\n" +
                    "        currentTime += 1 / 60;\n" +
                    "\n" +
                    "        var p = currentTime / time;\n" +
                    "        var t = easingEquations[easing](p);\n" +
                    "\n" +
                    "        if (p < 1) {\n" +
                    "            requestAnimFrame(tick);\n" +
                    "\n" +
                    "            window.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t));\n" +
                    "        } else {\n" +
                    "            console.log('scroll done');\n" +
                    "            window.scrollTo(0, scrollTargetY);\n" +
                    "        }\n" +
                    "    }\n" +
                    "\n" +
                    "    // call it once to get started\n" +
                    "    tick();\n" +
                    "}\n" +
                    "" +
                    "scrollToY("+data.scrollTop+", 1500);"
                    // "window.scrollBy(0, "+data.scrollTop+");"
                });
        }
    });

    var closeBtn = ce("button", {className:"ui button closeBtn"}, {}, container);
    ce("img", {src:"../icons/ReturnTo_closeBlack.svg",alt:"Close"}, {}, closeBtn);

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

    var content = ce("div", {className:"truncateParent"}, {}, container);
    if(!Builder.Build(content, data))
        container.classList.add("invalidEntry");
    ce("div", {className:"clearfix"}, {}, content);

    ce("span", {className:"returnTo timestamp", innerHTML:FormatDate(new Date(data.timeAdded))}, {}, container);

    const iconContainer = ce("div", {className:"returnTo icon"}, {}, container);
    const icon = ce("img", {src:GetIconForBookmarkType(data.type)}, {}, iconContainer);
    icon.style.width = icon.style.height = "24px";
    icon.style.position = "absolute";
    icon.style.bottom = icon.style.left = "0px";

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