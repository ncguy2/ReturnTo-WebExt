var ReturnTo = {};

ReturnTo.Storage = {

    PromiseRejected: reason => {
        console.log("Promise rejected: " + reason);
    },

    GetStorage: function() {
        return browser.storage.local;
    },

    Clear: () => {
        ReturnTo.Storage.GetStorage().clear();
    },

    Get: function(key, resolve) {
        ReturnTo.Storage.GetStorage().get(key).then(resolve, ReturnTo.Storage.PromiseRejected);
    },

    Remove: function(key, callback) {
        ReturnTo.Storage.GetStorage().remove(key).then(callback);
    },

    Set: function(key, value, callback) {
        var k = key;
        var data = {};
        data[k] = value;
        ReturnTo.Storage.GetStorage().set(data).then(_ => {
            console.log("Set "+key+" to "+value);
            if(callback) callback();
        }, ReturnTo.Storage.PromiseRejected);
    },

    Add: function(value, callback) {
        ReturnTo.Storage.Set(ReturnTo.Storage.UUIDv4(), value, callback);
    },

    UUIDv4: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

};

ReturnTo.Constants = {
    Keys: {
        RefreshPanel: "ReturnTo.RefreshPanel"
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

    AddTooltip: function(element, text, position, inverted) {
        element.setAttribute("data-tooltip", text);
        if(position)
            element.setAttribute("data-position", position);
        if(inverted)
            element.setAttribute("data-inverted", inverted);
    }
};

ReturnTo.Settings = {
    Registry: {
        Image_ConstraintWidth: {
            name: "Restrict by width",
            description: "Whether images should be constrained by width for sizing",
            field: "checkbox",
            defaultValue: false
        }
    },
    GetIdealRegistry: () => {
        var reg = {};
        for(var i in ReturnTo.Settings.Registry) {
            var d = ReturnTo.Settings.Registry[i];
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