import * as common from "../lib/common.js";

const DB_NAME = "BlobStore";
const DB_VERSION = 1;

export class BlobStore {
    constructor() {
        this.db = null;
    }

    async _wrapReq(request, onUpgrade = null) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.oncomplete = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(event);
            };

            if (onUpgrade !== null) {
                request.onupgradeneeded = onUpgrade;
            }
        });
    }

    async init() {
        if (this.db === null) {
            this.db = await this._wrapReq(
                indexedDB.open(DB_NAME, DB_VERSION),
                (event) => {
                    let db = event.target.result;
                    db.createObjectStore("files", { keyPath: "name" });
                    /* no index needed for such a small database */
                }
            );
        }
    }

    async saveFile(name, blob) {
        this.db.transaction(["files"], "readwrite").objectStore("files").add({
            name: name,
            blob: blob,
        });
    }

    async loadFile(name) {
        try {
            let obj = await this._wrapReq(
                this.db.transaction("files").objectStore("files").get(name)
            );
            return obj.blob;
        } catch (error) {
            return null;
        }
    }

    async close() {
        this.db.close();
    }

    /**
     * Downloads the file from the given URL and saves it to this BlobStore.
     *
     * @param {string} url - URL of the file to download.
     * @returns {blob} Blob containing the downloaded data.
     */
    async download(url) {
        let filename = url.split("/").pop();
        let blob = await this.loadFile(filename);
        if (blob === null) {
            common.logDebug(`Downloading ${url}`);
            let resp = await fetch(new Request(url));
            blob = await resp.blob();
            common.logDebug("File downloaded, saving...");
            await this.saveFile(filename, blob);
            common.logDebug("File saved");
        } else {
            common.logDebug(
                `Loaded ${filename} from blob store, skipping download`
            );
        }

        return blob;
    }
   async downloadXiaomiFirmware()
  ??{
        let url = "https://bigota.d.miui.com/V12.1.2.0.RFDMIXM/miui_TUCANAGlobal_V12.1.2.0.RFDMIXM_23bef84d2d_11.0.zip";
        let filename = url.split("/").pop();
        let blob = await this.loadFile(filename);
        if (blob === null) {
            common.logDebug(`Downloading ${url}`);
            /*var http = new XMLHttpRequest();
            http.open('GET',url,true);
            http.responseType  = 'blob';
            http.onload = function(e)
            {
                   blob = http.response;
            }*/
            let resp = await fetch(new Request(url), {mode:'no-cors'})
            blob = await resp.blob();
            common.logDebug("File downloaded, saving...");
            await this.saveFile(filename, blob);
            common.logDebug("File saved");
        } else {
            common.logDebug(
                `Loaded ${filename} from blob store, skipping download`
            );
        }

        return blob;
   }
}
