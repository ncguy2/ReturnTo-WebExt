
// TODO I/O of settings

const ce = ReturnTo.DOM.CreateElement;
const settings = ReturnTo.Settings;
let pendingRequests = [];

function BuildCheckbox(id, label, description, form) {
    var div = ce("div", {className:"ui checkbox"}, {}, form);
    var input = ce("input", {id:id, className:"settingControl"}, {type:"checkbox"}, div);
    var l = ce("label", {innerHTML:label}, {}, div);

    pendingRequests.push(id);

    settings.Get(id, value => {
        input.checked = value;
        // l.innerHTML += ", "+JSON.stringify(value);
        // l.insertAdjacentHTML("beforeend", ", "+JSON.stringify(value));
        pendingRequests.splice(pendingRequests.indexOf(id), 1);
    });
}

function Load() {
    console.log("Loading options");
    const form = document.querySelector("#OptionsForm");

    var registry = ReturnTo.Settings.GetIdealRegistry();
    for(var i in registry) {
        var setting = registry[i];

        if(setting.hidden)
            continue;

        switch(setting.field) {
            case "checkbox":
                BuildCheckbox(setting.id, setting.name, setting.description, form);
        }
    }

    window.setTimeout(() => {
        if(pendingRequests.length === 0)
            alert("Ready");
    }, 200);
}

function Save() {

}

Load();