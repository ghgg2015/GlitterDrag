var supportCopyImage = false;
var config = new ConfigClass();
var majorVersion = 52; // depend on manifesion.json
var DOSAVE = false;
browser.runtime.getBrowserInfo().then(info => {
    majorVersion = info.version.split(".")[0];
    majorVersion = parseInt(majorVersion);
})
document.title = getI18nMessage("option_page_title");



const TOOLTIP_TEXT_TABLE = {};
//TODO add allow_ tooltip
["act", "active", "pos", "search", "search_type", "search_onsite", "copy", "allow", "open_type", "download_type", "download_saveas", "download_directory"].forEach(
    (name) => {
        TOOLTIP_TEXT_TABLE[name] = getI18nMessage("option_tooltip_" + name);
    }
)


const OPTION_TEXT_VALUE_TABLE = {
    act: [],
    active: [],
    pos: [],
    open: [],
    search: [],
    search_onsite: [],
    copy: [],
    allow: [],
    download: [],
    download_saveas: []
}
const DIR_TEXT_VALUE_TABLE = {};
for (let item of Object.keys(commons)) {

    //排除
    if (["urlPattern", "fileExtension", "appName", "PLACE_HOLDER", "NEW_WINDOW", "DEFAULT_SEARCH_ENGINE", "DEFAULT_DOWNLOAD_DIRECTORY", "_DEBUG", ].includes(item)) {
        continue;
    }
    if (/^TYPE_/.test(item)) {
        continue;
    }
    if (/^KEY_/.test(item)) {
        continue;
    }
    const obj = {
        text: getI18nMessage(item),
        value: commons[item]
    };
    if (/^DIR_/.test(item)) {
        DIR_TEXT_VALUE_TABLE[item] = obj;
    }

    else if (/^ACT_/.test(item)) {
        OPTION_TEXT_VALUE_TABLE.act.push(obj)
    }
    else if (/^TAB_/.test(item)) {
        OPTION_TEXT_VALUE_TABLE.pos.push(obj);
    }
    else if (["FORE_GROUND", "BACK_GROUND"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.active.push(obj);
    }
    else if (["SEARCH_LINK", "SEARCH_TEXT", "SEARCH_IMAGE", "SEARCH_IMAGE_LINK"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.search.push(obj);
    }
    else if (["SEARCH_ONSITE_YES", "SEARCH_ONSITE_NO"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.search_onsite.push(obj);
    }
    else if (["OPEN_LINK", "OPEN_IMAGE", "OPEN_IMAGE_LINK"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.open.push(obj);
    }
    else if (["COPY_TEXT", "COPY_LINK", "COPY_IMAGE", "COPY_IMAGE_LINK"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.copy.push(obj);
    }
    else if (["DOWNLOAD_TEXT", "DOWNLOAD_LINK", "DOWNLOAD_IMAGE", "DOWNLOAD_IMAGE_LINK"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.download.push(obj);
    }
    else if (["DOWNLOAD_SAVEAS_YES", "DOWNLOAD_SAVEAS_NO"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.download_saveas.push(obj);
    }
    else if (/^ALLOW_/.test(item)) {
        OPTION_TEXT_VALUE_TABLE.allow.push(obj);
    }
    else {
        //unused
        //console.log(obj);
    }
}

async function toggleSelectedClass(e) {
    let el = e.target.parentElement.querySelector(".category-item-selected");
    let nextSelected = e.target;
    while (nextSelected.classList.contains("category-item-disabled")) nextSelected = nextSelected.nextElementSibling;
    el.classList.remove("category-item-selected");
    nextSelected.classList.add("category-item-selected");

    if (e.target.parentElement.id === "type-category") {
        const el = $E("#direction-control");
        el.value = (await (browser.storage.local.get("directionControl")))["directionControl"][currectActionType()];
        el.dispatchEvent(new Event("change"));
    }
}

function currentAction() {
    return "Actions";
}

function currentActionType() {
    return $E("#type-category .category-item-selected").getAttribute("value");
}

function currentDirection() {
    return $E("#direction-category .category-item-selected").getAttribute("value");
}

async function assignValue() {
    let actConfig = (await (browser.storage.local.get(currentAction())))[currentAction()][currentActionType()][currentDirection()];
    if (actConfig["tab_active"] === commons.FORE_GROUND) {
        $E("#foreground").checked = true;
    }
    else {
        $E("#background").checked = true;
    }

    if (actConfig["search_onsite"] === commons.SEARCH_ONSITE_YES) {
        $E("#search-onsite-yes").checked = true;
    }
    else {
        $E("#search-onsite-no").checked = true;
    }
    if (actConfig["download_saveas"] === commons.DOWNLOAD_SAVEAS_YES) {
        $E("#download-saveas-yes").checked = true;
    }
    else {
        $E("#download-saveas-no").checked = true;
    }

    if (currentAction() === "Actions_CtrlKey") {
        $E("#direction-control").value = (await (browser.storage.local.get("directionControl_CtrlKey")))["directionControl_CtrlKey"][currentActionType()]
    }
    else if (currentAction() === "Actions_ShiftKey") {
        $E("#direction-control").value = (await (browser.storage.local.get("directionControl_ShiftKey")))["directionControl_ShiftKey"][currentActionType()]
    }
    else {
        $E("#direction-control").value = (await (browser.storage.local.get("directionControl")))["directionControl"][currentActionType()]
    }
    $E("#action-name").value = actConfig["act_name"];
    $E("#tab-pos").value = actConfig["tab_pos"];
    $E("#search-engine-name").value = actConfig["engine_name"];
    $E(`[value='${actConfig["search_type"]}']`).checked = true;
    $E(`[value='${actConfig["download_type"]}']`).checked = true;
    $E(`[value='${actConfig["copy_type"]}']`).checked = true;
    $E(`[value='${actConfig["open_type"]}']`).checked = true;

}

function getRadioValue(name) {
    document.getElementsByName(name).forEach((el) => {
        if (el.checked) return el.value;
    })
}

async function main() {

    $A("#type-category>div,#direction-category>div").forEach(el => {
        el.addEventListener("click", toggleSelectedClass);
    })

    $A("#direction-category>div").forEach(el => {
        el.addEventListener("click", assignValue);
    })
    let el = $E("#direction-control");
    el.addEventListener("change", (e) => {
        function showDirections(re) {
            $A("#direction-category>div").forEach(el => {
                el.classList.add("category-item-disabled");
                if (re.test(el.getAttribute("value"))) {
                    el.classList.remove("category-item-disabled");
                }
            })
            $E("#direction-category>div").click();
        }
        switch (e.target.value) {
            case commons.ALLOW_ALL:
                showDirections(/^.*$/);
                break;
            case commons.ALLOW_NORMAL:
                showDirections(/^DIR_([UDLR]|OUTER)$/);
                break;
            case commons.ALLOW_H:
                showDirections(/^DIR_([LR]|OUTER)$/);
                break;
            case commons.ALLOW_V:
                showDirections(/^DIR_([UD]|OUTER)$/);
                break;
            case commons.ALLOW_ONE:
                showDirections(/^DIR_(U|OUTER)$/);
                break;
            case commons.ALLOW_LOW_L_UP_R:
                showDirections(/^DIR_(UP_R|LOW_L|OUTER)/);
                break;
            case commons.ALLOW_UP_L_LOW_R:
                showDirections(/^DIR_(UP_L|LOW_R|OUTER)/);
                break;
            case commons.ALLOW_QUADRANT:
                showDirections(/^DIR_(UP_L|LOW_R|UP_R|LOW_L|OUTER)/);
                break;
            case commons.ALLOW_NONE: //备用，未来可能会添加“关闭所有方向”
            default:
                break;
        }
    })
    $A("option", el).forEach(opt => {
        for (let obj of OPTION_TEXT_VALUE_TABLE.allow) {
            if (obj.value === opt.value) {
                opt.textContent = obj.text;
                break;
            }
        }
    })


    $A("#builtin-engine select").forEach((selectElem, index) => {
        let cloned = selectElem.cloneNode(true);
        cloned.addEventListener("change", (e) => {
            $E("#search-engine-name").value = e.target.querySelector(`[value='${e.target.value}']`).textContent;
            $E("#search-engine-name").setAttribute("url", e.target.value);
            e.target.firstElementChild.selected = true;
        })
        $E("#search-engine-select").appendChild(cloned);
    });

    $E("#action-category").addEventListener("change", async() => {
        let actConfig = (await (browser.storage.local.get(currentAction())));
        Object.assign(actConfig[currentAction()][currentActionType()][currentDirection()], {
            act_name: $E("#action-name").value,
            tab_active: getRadioValue("tab-active"),
            tab_pos: $E("#tab-pos").value,
            engine_name: $E("#search-engine-name").value,
            open_type: getRadioValue("open_type"),
            search_type: getRadioValue("search-type"),
            copy_type: getRadioValue("copy-type"),
            download_type: getRadioValue("download-type"),
            download_directory: $E("#download-directory"),
            download_saveas: getRadioValue("download-saveas"),
            search_onsite: getRadioValue("search-onsite")
        });
        browser.storage.local.set(actConfig);
    });
    assignValue();
}
main();
class EngineItemWrapper {
    constructor(val, callback, saved) {
        this.callback = callback;
        this.onchange = this.onchange.bind(this);

        this.elem = document.createElement("div");

        this.removeBtn = document.createElement("a");
        this.removeBtn.className = "remove-button";
        this.removeBtn.href = "#";
        this.removeBtn.textContent = "x";
        eventUtil.attachEventT(this.removeBtn, () => this.onRemoveClick());

        this.nameInput = document.createElement("input");
        this.nameInput.className = "search-name-input";
        this.nameInput.type = "text";
        this.nameInput.title = getI18nMessage("search_name_tooltip");
        this.nameInput.placeholder = getI18nMessage("search_name_tooltip"); // Did not see the need for separate strings
        eventUtil.attachEventT(this.nameInput, this.onchange, "change");

        this.urlInput = this.nameInput.cloneNode();
        this.urlInput.className = "search-url-input";
        this.urlInput.title = getI18nMessage("search_url_tooltip");
        this.urlInput.placeholder = getI18nMessage("search_url_tooltip");
        eventUtil.attachEventT(this.urlInput, this.onchange, "change");




        [this.removeBtn, this.nameInput, this.urlInput].forEach(t => this.elem.appendChild(t));
        this.value = val;
        if (saved) {
            this.elem.classList.add("saved");
        }
    }

    onRemoveClick() {
        this.callback(this);
    }

    onchange() {
        this.elem.classList.remove("saved"); // TODO: better if highlight the changed input only?
    }
    get name() {
        return this.nameInput.value;
    }
    set name(n) {
        return this.nameInput.value = n;
    }
    get url() {
        return this.urlInput.value;
    }
    set url(s) {
        return this.urlInput.value = s;
    }
    get value() {
        return {
            name: this.name,
            url: this.url
        }
    }
    set value(o) {
        this.name = o.name;
        this.url = o.url;
    }
    appendTo(p) {
        p.appendChild(this.elem);
    }
}
class EngineWrapper {
    constructor(engineList) {
        document.querySelectorAll("#builtin-engine>select>option:nth-child(1)").forEach(el => {
            el.selected = true;
        })
        eventUtil.attachEventAll("#builtin-engine>select", (event) => {
            this.newItem({
                name: event.target.selectedOptions[0].textContent,
                url: event.target.value
            }, false)
            event.target.selectedIndex = 0; // Reset to group option for re-select to add this value again
        }, "change");


        this.items = [];

        // this.onAdd = this.onAdd.bind(this);
        this.onItemRemove = this.onItemRemove.bind(this);

        this.buttonsDiv = document.querySelector("#engine-buttons");
        this.itemsDiv = document.querySelector("#engine-items");

        let refreshbtn = this.buttonsDiv.querySelector("#RefreshbtnOnEngines");
        refreshbtn.onclick = () => this.onRefresh();

        let addbtn = this.buttonsDiv.querySelector("#AddbtnOnEngines");
        addbtn.onclick = () => this.onAdd();

        let savebtn = this.buttonsDiv.querySelector("#SavebtnOnEngines");
        savebtn.onclick = () => this.onSaveAll();

        this.refreshItems(engineList);
    }

    onSaveAll() {
        const engines = [];
        const savedItems = [];
        const unSavedItems = [];
        for (let item of this.items) {
            if (item.url.length > 0 && item.name.length > 0) {
                savedItems.push(item);
                engines.push({
                    name: item.name,
                    url: item.url
                });
            }
            else {
                unSavedItems.push(item);
            }
        }
        if (engines.length > 0) {
            config.set("Engines", engines).then(() => {
                savedItems.forEach(item => {
                    item.elem.classList.add("accept", "saved");
                    setTimeout(() => {
                        item.elem.classList.remove("accept");
                    }, 1200)
                });
                unSavedItems.forEach(item => {
                    item.nameInput.classList.toggle("warning", item.name.length <= 0);
                    item.urlInput.classList.toggle("warning", item.url.length <= 0);
                    item.elem.classList.remove("saved");
                    setTimeout(() => {
                        item.nameInput.classList.remove("warning");
                        item.urlInput.classList.remove("warning");
                    }, 1200)
                });
                // dispatch event to a large number of element will slow the optioin page
                setTimeout(() => {
                    DOSAVE = false;
                    document.querySelectorAll(".searchEngines").forEach((el, i, list) => {
                        if (i === list.length - 1) {
                            DOSAVE = true;
                        }
                        el.dispatchEvent(new Event("update"));
                    });
                }, 2500);
            });
        }
    }
    onItemRemove(item) {
        this.items = this.items.filter((v) => v !== item);
        this.itemsDiv.removeChild(item.elem);
    }
    onRefresh() {
        this.refreshItems(config.get("Engines"));
    }
    onAdd() {
        this.newItem({
            name: "",
            url: ""
        }, false);
    }
    refreshItems(list) {
        this.clearItems();
        list.forEach(s => this.newItem(s, true));
    }
    clearItems() {
        this.items.forEach(item => {
            this.itemsDiv.removeChild(item.elem);
        });
        this.items = [];
    }

    newItem(val, saved = false) {
        let item = new EngineItemWrapper(val, this.onItemRemove, saved);
        this.items.push(item);
        item.appendTo(this.itemsDiv);
    }
    collect() {
        let result = [];
        this.items.forEach((item) => {
            if (item.name.length != 0 && item.url.length != 0) {
                result.push(item.value);
            }
        })
        return result;
    }
    appendTo(parent) {
        parent;
        // parent.appendChild(this.itemsDiv)
    }
}

class generalWrapper {
    constructor() {
        if (majorVersion >= 53) {
            $E("#enableSync").removeAttribute("disabled");
        }
        const el = $E("#tipsContentSelect");
        const input = $E("#tipsContentInput");
        const content = config.get("tipsContent");
        OPTION_TEXT_VALUE_TABLE.act.forEach(item => {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.text;
            el.appendChild(option);
        });
        input.addEventListener("change", ({ target }) => {
            let val = target.value.replace(/\\n/g, "\n");
            content[target.getAttribute("data-id")] = val;
            config.set("tipsContent", content);
        });
        el.addEventListener("change", (e) => {
            input.value = content[e.target.value];
            input.setAttribute("data-id", e.target.value);
        });
        el.selectedIndex = 1;
        el.dispatchEvent(new Event("change"));
    }
}

class downloadWrapper {
    constructor() {
        const dirCount = 8;

        this.directories = config.get("downloadDirectories");

        const tab = document.querySelector("#tab-download");

        eventUtil.attachEventS("#showDefaultDownloadDirectory", () => {
            browser.downloads.showDefaultFolder();
        })
        eventUtil.attachEventS("#SavebtnOnDownloadDirectories", (e) => {
            document.querySelectorAll(".directory-entry>input:nth-child(2)").forEach((el, index) => {
                this.directories[index] = el.value;
            });
            config.set("downloadDirectories", this.directories);
            // e.target.setAttribute("disabled", "true");
        })
        const node = document.importNode(document.querySelector("#template-for-directory-entry").content, true);
        const entry = node.querySelector(".directory-entry");

        for (let i = 0; i < dirCount; i++) {
            const cloned = entry.cloneNode(true);

            // const a = cloned.querySelector("a");
            // a.setAttribute("index", i);
            // a.addEventListener("click", (event) => this.onConfirmClick(event));

            cloned.querySelector("input:nth-child(1)").value = browser.i18n.getMessage("DownloadDirectory", i);
            cloned.querySelector("input:nth-child(2)").value = this.directories[i] || "";
            // cloned.querySelector("input:nth-child(2)").addEventListener("change", (e) => this.onChange(e));
            tab.appendChild(cloned);
        }

    }
    onChange() {
        $E("#SavebtnOnDownloadDirectories").removeAttribute("disabled");
    }
    onSaveBtnClick(event) {
        // const index = event.target.getAttribute("index");
        // this.directories[index] = event.target.previousElementSibling.value;
        // config.set("downloadDirectories", this.directories);
    }
}

class styleWrapper {
    constructor() {
        let tab = document.querySelector("#tab-style");

        let styleArea = tab.querySelector("#styleContent");
        let style = config.get("style");
        if (style.length === 0) {
            let styleURL = browser.runtime.getURL("./../content_scripts/content_script.css");
            fetch(styleURL).then(
                response => response.text()
            ).then(text => styleArea.value = text);
        }
        else {
            styleArea.value = style;
        }

        eventUtil.attachEventS("#saveStyle", () => {
            config.set("style", styleArea.value); // TODO: promise?
            document.querySelector("#saveStyle").textContent = getI18nMessage('elem_SaveDone');
            setTimeout(() => {
                document.querySelector("#saveStyle").textContent = getI18nMessage('elem_SaveStyle');
            }, 2000);
        })
    }
}


const tabs = {
    _tabs: [],
    init: function() {


        let w = new Wrapper();
        w.appendTo($E(`#tab-actions`));
        this._tabs.push(w);

        w = new ActionsWithCtrlKeyWrapper();
        w.appendTo($E(`#tab-actions-ctrlkey`));
        this._tabs.push(w);

        w = new ActionsWithShiftKeyWrapper();
        w.appendTo($E(`#tab-actions-shiftkey`));
        this._tabs.push(w);

        w = new EngineWrapper(config.get("Engines"));
        w.appendTo($E(`#tab-search-template`));
        this._tabs.push(w);


        w = new generalWrapper();
        this._tabs.push(w);

        w = new downloadWrapper();
        this._tabs.push(w);

        w = new styleWrapper();
        this._tabs.push(w);


        document.querySelectorAll(".nav-a").forEach(a => {
            a.addEventListener("click", this.navOnClick);
        });

        //do with i18n
        for (let elem of document.querySelectorAll("[data-i18n]")) {
            elem.textContent = getI18nMessage(`elem_${elem.dataset['i18n']}`);
        }

        document.querySelectorAll("input[id]").forEach(elem => {
            if ("not-config" in elem.attributes) return;

            if (elem.type === "file") return;

            if (elem.type === "checkbox") elem.checked = config.get(elem.id);
            else elem.value = config.get(elem.id);

            elem.addEventListener("change", (evt) => {
                this.showOrHideNav();
                if (evt.target.type === "checkbox") config.set(evt.target.id, evt.target.checked);
                else if (evt.target.type === "number") config.set(evt.target.id, parseInt(evt.target.value));
                else config.set(evt.target.id, evt.target.value);
                // config.save();
            });
        })
        this.showOrHideNav();

    },

    navOnClick: function(event) {
        $E(".nav-active").classList.remove("nav-active");
        event.target.classList.add("nav-active");
        $E(".tab-active").classList.remove("tab-active");
        $E(`${event.target.getAttribute("toggle-target")}`).classList.add("tab-active");
    },

    showOrHideNav: function() {
        let classList = $E(`a[toggle-target="#tab-actions-ctrlkey"]`).classList;
        if ($E("#enableCtrlKey").checked) {
            classList.remove("hide")
        }
        else {
            classList.add("hide");
        }

        classList = $E(`a[toggle-target="#tab-actions-shiftkey"]`).classList;
        if ($E("#enableShiftKey").checked) {
            classList.remove("hide")
        }
        else {
            classList.add("hide");
        }
    }
}


// var backgroundPage = null;
config.load().then(() => {
    return;
    let fileReader = new FileReader();
    fileReader.addEventListener("loadend", async() => {
        try {
            await config.restore(fileReader.result);
            // await config.save();
            location.reload();
        }
        catch (e) {
            const msg = "An error occured, please check backup file";
            console.error(msg, e);
            alert(msg);
        }
    });
    eventUtil.attachEventS("#backup", () => {
        const blob = new Blob([JSON.stringify(config.storage, null, 2)]);
        const url = URL.createObjectURL(blob);
        const date = new Date();

        browser.downloads.download({
            url: url,
            filename: `GlitterDrag-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.json`,
            conflictAction: 'uniquify',
            saveAs: true
        });

        setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 1000 * 60 * 5);
    });
    eventUtil.attachEventS("#restore", () => {
        $E("#fileInput").click();
    });
    eventUtil.attachEventS("#default", async() => {
        await config.loadDefault();
        location.reload();
    });
    eventUtil.attachEventS("#fileInput", (event) => {
        fileReader.readAsText(event.target.files[0]);
    }, "change");

    tabs.init();


}, () => {});



function messageListener(msg) {
    function log(message) {
        logArea.value = `${logArea.value}\n${new Date().toTimeString()} --- ${message}`
    }
    let elem = mydrag.targetElem;
    let logArea = document.querySelector("#logArea");
    if (elem instanceof HTMLImageElement && msg.command === "copy" && msg.copy_type === commons.COPY_IMAGE) {
        log("1. Handshake to script");
        browser.runtime.sendNativeMessage(commons.appName, "test").then((r) => {
            log("2.1. The script reply：" + r);
        }, (e) => {
            log("2.2. Test no response:" + e);
        });
        log("3. Copy image behavior is detected.");

        fetch(elem.src)
            .then(response => {
                log("4. Get the blob of image");
                return response.blob();

            })
            .then(blob => {
                let reader = new FileReader();
                reader.readAsDataURL(blob);
                return new Promise(resolve => {
                    reader.onloadend = () => {
                        log("5. Convert blob to base64");
                        resolve(reader.result.split(",")[1]);
                    }
                });
            })
            .then(base64 => {
                log("6. Send image to script");
                return browser.runtime.sendNativeMessage(commons.appName, base64);
            })
            .catch(error => {
                console.log(error)
                log("An error occurred: " + error);
            });
    }
    else {
        CSlistener(msg);
    }
}
document.addEventListener("beforeunload", () => {
    config.save().then(() => {
        console.info("succeed to save config ");
    }).catch(() => {
        console.error("fail to save config");
    });
})
browser.runtime.onConnect.addListener(port => {
    if (port.name === "sendToOptions") {
        port.onMessage.addListener(messageListener);
    }
});