var ReturnTo = {};

ReturnTo.Storage = {

    // Generated using ReturnTo.Storage::UUIDv4
    Signatures: {
        Entry: "e92683db-f4b7-47e9-a44d-4f1d4fa1901d",
        Setting: "c573e4b0-94a3-4f08-89ae-0461af00adc6"
    },

    PromiseRejected: reason => {
        console.log("Promise rejected: " + reason);
    },

    GetStorage: () => {
        return browser.storage.local;
    },

    Clear: () => {
        ReturnTo.Storage.GetStorage().clear();
    },

    Get: (key, resolve) => {
        ReturnTo.Storage.GetStorage().get(key).then(resolve, ReturnTo.Storage.PromiseRejected);
    },

    Remove: (key, callback) => {
        ReturnTo.Storage.GetStorage().remove(key).then(callback);
    },

    _Set: (key, value, callback) => {
        var k = key;
        var data = {};
        data[k] = value;
        ReturnTo.Storage.GetStorage().set(data).then(_ => {
            console.log("Set "+key+" to "+value);
            if(callback) callback();
        }, ReturnTo.Storage.PromiseRejected);
    },

    _Add: (value, callback) => {
        ReturnTo.Storage._Set(ReturnTo.Storage.UUIDv4(), value, callback);
    },

    SetEntry: (key, value, callback) => {
        value['signature'] = ReturnTo.Storage.Signatures.Entry;
        ReturnTo.Storage._Set(key, value, callback)
    },

    SetSetting: (key, value, callback) => {

        if(Object.keys(value).length === 0) {
            value = {
                value: value
            }
        }

        value['signature'] = ReturnTo.Storage.Signatures.Setting;
        ReturnTo.Storage._Set(key, value, callback);
    },

    GetSetting: (key, resolve) => {
        ReturnTo.Storage.Get(key, (val) => {
            if(val[key]) {
                resolve(val[key]['value']);
            }
        });
    },

    AddEntry: (value, callback) => {
        ReturnTo.Storage.SetEntry(ReturnTo.Storage.UUIDv4(), value, callback)
    },

    UUIDv4: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    Import: () => {

    }

};

ReturnTo.Events = {
    Signatures: {
        NewEntry: "New-"+ReturnTo.Storage.Signatures.Entry,
        DelEntry: "Del-"+ReturnTo.Storage.Signatures.Entry,
        RefEntry: "Ref-"+ReturnTo.Storage.Signatures.Entry,
        ModSetting: "Mod-"+ReturnTo.Storage.Signatures.Setting,
    },
    Factories: {
        NewEntry: (key, data) => {
            return new CustomEvent(ReturnTo.Events.Signatures.NewEntry, { detail: {key:key, data:data} })
        },
        DelEntry: (key) => {
            return new CustomEvent(ReturnTo.Events.Signatures.DelEntry, { detail: {key:key} })
        },
        RefEntry: () => {
            return new CustomEvent(ReturnTo.Events.Signatures.RefEntry)
        },
        ModSetting: (key, value) => {
            return new CustomEvent(ReturnTo.Events.Signatures.ModSetting, { detail: {key:key,value:value}});
        }
    }
};

ReturnTo.Globals = {
    darkThemeActive: false
};

ReturnTo.Constants = {
    Keys: {
        RefreshPanel: "ReturnTo.RefreshPanel",
        CloseButton: "closeBtn",
        BackButton: "backBtn",
        MenuButton: "menuBtn",
        ExportButton: "exportBtn",
    },
    StorageTypes: {
        Page: "page",
        Selection: "selection",
        Image: "image",
        Link: "link",

        Audio: "audio",
        Video: "video"
    }
};

ReturnTo.DOM = {
    CreateElement: function(tag, props, attrs, parent) {
        attrs = attrs || {};
        props = props || {};
        var e = document.createElement(tag);
        for(var p in props) e[p] = props[p];
        for(var a in attrs) e.setAttribute(a, attrs[a]);

        if(parent) {
            if(parent instanceof HTMLElement)
                parent.appendChild(e);
        }

        return e;
    },

    OpenTab: function(url, options) {
        options['url'] = url;
        return browser.tabs.create(options);
    },

    OpenTarget: function(url, scrollTop) {
        let tab = ReturnTo.DOM.OpenTab(url, {active:true});
        if(scrollTop && scrollTop > 0) {
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
                "scrollToY("+scrollTop+", 1500);"
                // "window.scrollBy(0, "+data.scrollTop+");"
            });
        }
    },

    AddTooltip: function(element, text, position, inverted) {
        element.setAttribute("data-tooltip", text);
        if(position)
            element.setAttribute("data-position", position);
        if(inverted)
            element.setAttribute("data-inverted", inverted);
    },

    ForEachNode: (cls, func) => {
        const nodes = document.getElementsByClassName(cls);
        for(let i in nodes) {
            if (!nodes[i].tagName) continue;
            func(nodes[i]);
        }
    },

    UsingNode: (query, func) => {
        const node = document.querySelector(query);
        if(node && node.tagName)
            func(node)
    },

    UsingNodes: (query, func) => {
        const nodes = document.querySelectorAll(query);
        for(let i in nodes) {
            if(!nodes[i].tagName) continue;
            func(nodes[i]);
        }
    }
};

ReturnTo.Settings = {
    Registry: {
        Image_ConstraintWidth: {
            id: "Image_ConstraintWidth",
            name: "Restrict by width",
            description: "Whether images should be constrained by width for sizing",
            field: "checkbox",
            defaultValue: false
        },
        Global_DarkTheme: {
            id: "Global_DarkTheme",
            name: "Dark theme",
            description: "Use the dark theme",
            field: "checkbox",
            defaultValue: ReturnTo.Globals.darkThemeActive,
            hidden: true
        }
    },
    GetIdealRegistry: () => {
        var reg = {};
        for(var i in ReturnTo.Settings.Registry) {
            var d = ReturnTo.Settings.Registry[i];
            d.hidden = d.hidden || false;
            d.id = i;
            reg[i] = d;
        }
        return reg;
    },
    GetStorage: () => {
        return browser.storage.local;
    },
    Get: (id, callback) => {
        ReturnTo.Settings.GetStorage().get(id).then(value => {
            callback(value);
        }, reason => {
            console.log(reason);
            if(!ReturnTo.Settings.Registry[id]) return;
            callback(ReturnTo.Settings.Registry[id].defaultValue, reason);
        });
    },
    Set: (id, value) => {
        return ReturnTo.Settings.GetStorage().set(id, value);
    }
};

/**
 *
 * @param type
 * @param theme
 * @returns String filepath to svg file
 */
function GetIconForBookmarkType(type, theme) {
    switch(type) {
        case ReturnTo.Constants.StorageTypes.Page: return "/icons/contextual/types/ReturnTo_typePage.svg";
        case ReturnTo.Constants.StorageTypes.Selection: return "/icons/contextual/types/ReturnTo_typeSelection.svg";
        case ReturnTo.Constants.StorageTypes.Image: return "/icons/contextual/types/ReturnTo_typeImage.svg";
        case ReturnTo.Constants.StorageTypes.Link: return "/icons/contextual/types/ReturnTo_typeLink.svg";
        case ReturnTo.Constants.Keys.CloseButton: return "/icons/contextual/buttons/ReturnTo_closeBtn.svg";
        case ReturnTo.Constants.Keys.BackButton: return "/icons/contextual/buttons/ReturnTo_backBtn.svg";
        case ReturnTo.Constants.Keys.MenuButton: return "/icons/contextual/buttons/ReturnTo_menuBtn.svg";
        case ReturnTo.Constants.Keys.ExportButton: return "/icons/contextual/buttons/ReturnTo_exportBtn.svg";
        default: return "/icons/contextual/types/ReturnTo_typeUnknown.svg";
    }
}

function GetSVGIcon(type, theme, container, async, callback) {
    async = async || false;
    const path = GetIconForBookmarkType(type, theme);

    const isNodeContextual = node => {
        return node.getAttribute("fill") === "context-fill";
    };

    const getContextualNodes = (node, arr) => {

        if(isNodeContextual(node))
            arr.push(node);

        const children = Array.from(node.children);
        for(let i in children)
            getContextualNodes(children[i], arr);
    };


    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4 && xhr.status === 200) {
            let svg = xhr.responseXML.documentElement;

            let contextualNodes = [];
            getContextualNodes(svg, contextualNodes);

            for(let i in contextualNodes) {
                const node = contextualNodes[i];
                node.classList.add("themeable");
                if(ReturnTo.Globals.darkThemeActive)
                    node.classList.add("dark_theme");
            }

            container.appendChild(svg);

            if(callback) callback(svg);

        }
    };
    xhr.open("GET", path, async);
    xhr.overrideMimeType("image/svg+xml");
    xhr.send("");
}

if(!String.prototype.width) {
    String.prototype.width = function() {
        var body = document.querySelector("#panelBody");
        var o = ReturnTo.DOM.CreateElement("div", {className:"internal_stringWidth", innerHTML:this}, {}, body);
        // o.style.position = "absolute";
        // o.style.float = "left";
        // o.style.whiteSpace = "nowrap"
            // o = $('<div>' + this + '</div>')
            //     .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            //     .appendTo($('body')),
        var rect = o.getBoundingClientRect();
        var w = rect.width;

        o.remove();

        return w;
    }
}

var Types = {
    MODIFICATION: 2,
    ADDITION: 1,
    UNDEFINED: 0,
    DELETION:-1
};

/**
 *
 * @returns Number from Types
 */
function GetType(change) {
    if(change['oldValue'] && change['newValue'])
        return Types.MODIFICATION;

    if(change['oldValue'] && !change['newValue'])
        return Types.DELETION;
    if(!change['oldValue'] && change['newValue'])
        return Types.ADDITION;
    return Types.UNDEFINED;
}

/**
 * @return {string}
 */
function GetSignature(change, changeType) {
    changeType = changeType || GetType(change);
    let sig = "";

    if(changeType === Types.DELETION)
        sig = change['oldValue']['signature'];
    else if(changeType === Types.ADDITION || changeType === Types.UNDEFINED || changeType === Types.MODIFICATION)
        sig = change['newValue']['signature'];

    return sig;
}

browser.storage.onChanged.addListener((changes, areaName) => {
    console.log("Storage change detected in " + areaName);
    console.dir(changes);

    var doReload = false;

    for(var c in changes) {
        var key = c;
        var change = changes[key];
        const type = GetType(change);
        const sig = GetSignature(change, type);
        console.log("Type: " + type + ", Signature: " + sig);
        switch(type) {
            case Types.ADDITION:
                if(sig === ReturnTo.Storage.Signatures.Entry)
                    document.dispatchEvent(ReturnTo.Events.Factories.NewEntry(key, change.newValue));
                break;
            case Types.DELETION:
                if(sig === ReturnTo.Storage.Signatures.Entry)
                    document.dispatchEvent(ReturnTo.Events.Factories.DelEntry(key));
                break;
            case Types.UNDEFINED:
                if(sig === ReturnTo.Storage.Signatures.Entry)
                    doReload = true;
                break;
            case Types.MODIFICATION:
                if(sig === ReturnTo.Storage.Signatures.Setting)
                    document.dispatchEvent(ReturnTo.Events.Factories.ModSetting(key, change['newValue']['value']));
        }
    }
    if(doReload)
        document.dispatchEvent(ReturnTo.Events.Factories.RefEntry());
});

ReturnTo.Storage.GetSetting(ReturnTo.Settings.Registry.Global_DarkTheme.id, val => {
    console.log("Setting-DarkTheme");
    console.dir(val);
    const res = val;
    if(typeof(res) == "undefined") {
        ReturnTo.Storage.SetSetting(ReturnTo.Settings.Registry.Global_DarkTheme.id, ReturnTo.Globals.darkThemeActive);
    }else{
        ReturnTo.Globals.darkThemeActive = res;
    }
});

document.addEventListener("DOMContentLoaded", e => {
    ReturnTo.DOM.ForEachNode("photonMenuBtn", btn => {
        GetSVGIcon(ReturnTo.Constants.Keys.MenuButton, "", btn, true);
    });

    ReturnTo.DOM.ForEachNode("photonBackBtn", btn => {
        GetSVGIcon(ReturnTo.Constants.Keys.BackButton, "", btn, true);
    });

    ReturnTo.DOM.ForEachNode("photonExportBtn", btn => {
        GetSVGIcon(ReturnTo.Constants.Keys.ExportButton, "", btn, true);
    });

});