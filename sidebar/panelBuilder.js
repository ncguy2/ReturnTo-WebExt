let Builder = {};

Builder.Build = (container, data) => {
    if(!data.type)
        return Builder.BuildError(container, data);

    switch(data.type) {
        case ReturnTo.Constants.StorageTypes.Page:
            return Builder.BuildPage(container, data);
        case ReturnTo.Constants.StorageTypes.Selection:
            return Builder.BuildSelection(container, data);
        case ReturnTo.Constants.StorageTypes.Image:
            return Builder.BuildImage(container, data);
        default:
            return Builder.BuildError(container, data);
    }

};

Builder.BuildError = (container, data) => {
    const ce = ReturnTo.DOM.CreateElement;
    ce("h4", {innerHTML:"Undefined type: " + data.type}, {}, container);
    return false;
};

Builder.BuildPage = (container, data) => {
    const ce = ReturnTo.DOM.CreateElement;
    ce("p", {className:"truncate", innerHTML:data.pageTitle}, {}, container);
    return true;
};

Builder.BuildSelection = (container, data) => {
    const ce = ReturnTo.DOM.CreateElement;
    ce("p", {className:"truncate", innerHTML:data.targetText}, {}, container);
    return true;
};

Builder.BuildImage = (container, data) => {
    const ce = ReturnTo.DOM.CreateElement;
    const imgDiv = ce("div", {className:"image"}, {}, container);
    const img = ce("img", {className:"image clickable blue"}, {src: data.imageUrl}, imgDiv);

    // ReturnTo.Settings.Get("Image_ConstraintWidth", (value) => {
    //     if(value) img.classList.add("constrainWidth");
    //     else img.classList.add("constrainHeight");
    // });

    img.classList.add("constrainHeight");

    img.addEventListener("click", e => {
        ReturnTo.DOM.OpenTab(data.imageUrl, {active:true});
    });
    return true;
};