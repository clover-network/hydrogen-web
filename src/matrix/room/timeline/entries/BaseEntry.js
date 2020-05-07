//entries can be sorted, first by fragment, then by entry index.
import {EventKey} from "../EventKey.js";
export const PENDING_FRAGMENT_ID = Number.MAX_SAFE_INTEGER;

export class BaseEntry {
    constructor(fragmentIdComparer) {
        this._fragmentIdComparer = fragmentIdComparer;
    }

    get fragmentId() {
        throw new Error("unimplemented");
    }

    get entryIndex() {
        throw new Error("unimplemented");
    }

    compare(otherEntry) {
        if (this.fragmentId === otherEntry.fragmentId) {
            return this.entryIndex - otherEntry.entryIndex;
        } else if (this.fragmentId === PENDING_FRAGMENT_ID) {
            return 1;
        } else if (otherEntry.fragmentId === PENDING_FRAGMENT_ID) {
            return -1;
        } else {
            // This might throw if the relation of two fragments is unknown.
            return this._fragmentIdComparer.compare(this.fragmentId, otherEntry.fragmentId);
        }
    }

    asEventKey() {
        return new EventKey(this.fragmentId, this.entryIndex);
    }
}
