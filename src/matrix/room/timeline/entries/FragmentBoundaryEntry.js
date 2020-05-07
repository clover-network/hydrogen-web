import {BaseEntry} from "./BaseEntry.js";
import {Direction} from "../Direction.js";
import {isValidFragmentId} from "../common.js";
import {Platform} from "../../../../Platform.js";

export class FragmentBoundaryEntry extends BaseEntry {
    constructor(fragment, isFragmentStart, fragmentIdComparer) {
        super(fragmentIdComparer);
        this._fragment = fragment;
        // TODO: should isFragmentStart be Direction instead of bool?
        this._isFragmentStart = isFragmentStart;
    }

    static start(fragment, fragmentIdComparer) {
        return new FragmentBoundaryEntry(fragment, true, fragmentIdComparer);
    }

    static end(fragment, fragmentIdComparer) {
        return new FragmentBoundaryEntry(fragment, false, fragmentIdComparer);
    }
    
    get started() {
        return this._isFragmentStart;
    }

    get hasEnded() {
        return !this.started;
    }

    get fragment() {
        return this._fragment;
    }

    get fragmentId() {
        return this._fragment.id;
    }

    get entryIndex() {
        if (this.started) {
            return Platform.minStorageKey;
        } else {
            return Platform.maxStorageKey;
        }
    }

    get isGap() {
        return !!this.token;
    }

    get token() {
        if (this.started) {
            return this.fragment.previousToken;
        } else {
            return this.fragment.nextToken;
        }
    }

    set token(token) {
        if (this.started) {
            this.fragment.previousToken = token;
        } else {
            this.fragment.nextToken = token;
        }
    }

    get linkedFragmentId() {
        if (this.started) {
            return this.fragment.previousId;
        } else {
            return this.fragment.nextId;
        }
    }

    set linkedFragmentId(id) {
        if (this.started) {
            this.fragment.previousId = id;
        } else {
            this.fragment.nextId = id;
        }
    }

    get hasLinkedFragment() {
        return isValidFragmentId(this.linkedFragmentId);
    }

    get direction() {
        if (this.started) {
            return Direction.Backward;
        } else {
            return Direction.Forward;
        }
    }

    withUpdatedFragment(fragment) {
        return new FragmentBoundaryEntry(fragment, this._isFragmentStart, this._fragmentIdComparer);
    }

    createNeighbourEntry(neighbour) {
        return new FragmentBoundaryEntry(neighbour, !this._isFragmentStart, this._fragmentIdComparer);
    }
}
