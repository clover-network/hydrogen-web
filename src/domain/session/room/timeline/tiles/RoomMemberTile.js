/*
Copyright 2020 Bruno Windels <bruno@windels.cloud>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { SimpleTile } from "./SimpleTile.js";

export class RoomMemberTile extends SimpleTile {
    constructor(entry, options) {
        super(entry, options);
        this._isNewDay = false;
        this._inNewDay = false;
        this._isSameDay = false;
        this._date = this._entry.timestamp ? new Date(this._entry.timestamp) : null;
    }

    get isNewDay() {
        return this._isNewDay;
    }
    get inNewDay() {
        return this._inNewDay;
    }
    get isSameDay() {
        return this._isSameDay;
    }

    get shape() {
        return "announcement";
    }

    get noContent() {
        if ((this.announcement || '').indexOf('@u_') >= 0) return true
        if ((this.announcement || '').indexOf('gamic_admin') >= 0) return true
        if ((this.targetName || '').indexOf('@u_') >= 0) return true
        if ((this.targetName || '').indexOf('gamic_admin') >= 0) return true
        return false;
    }
    get shouldHide() {
        if (this.noContent) return true
        const { content } = this._entry;
        const membership = content && content.membership;
        if (membership === "join" || membership === "leave") {
            return false;
        }
        return true;
    }

    get date() {
        return this._date && this._date.toLocaleDateString('en-US', { year: 'numeric', month: "long", day: "numeric" }).split('/').join('-');
    }

    get time() {
        return this._date && this._date.toLocaleTimeString({}, { hour: "numeric", minute: "2-digit" });
    }

    sendWelcome() {
        const { sender, content, prevContent, stateKey } = this._entry;
        const senderName = this._entry.displayName || sender;
        const targetName = sender === stateKey ? senderName : (this._entry.content?.displayname || stateKey);
        // const mainInput = document.getElementById('main_input')
        const mainInput = document.querySelector('.welcome-channel #main_input')
        const mainSendButton = document.querySelector('.welcome-channel #main_send_button')
        if (mainInput) {
            mainInput.value = `Welcome @${targetName}`
            mainSendButton.click()
        }
    }
    updatePreviousSibling(prev) {
        super.updatePreviousSibling(prev);
        let isContinuation = false;
        // console.log('prev:', !!prev, '\n', prev, '\n\n', this.noContent, this.announcement, '==', this._entry?.entryIndex)
        // console.log('entryIndex:', this._entry?.entryIndex, prev?._entry?.entryIndex, ((this._entry?.entryIndex || 0) > (prev?._entry?.entryIndex || 0)))
        if (isContinuation !== this._isContinuation) {
            this._isContinuation = isContinuation;
            this.emitChange("isContinuation");
        }
        if (prev && prev.date !== this.date || !prev) {
            this._isNewDay = true;
            this.emitChange("isNewDay");
        }
        if (prev && prev.date === this.date) {
            this._isSameDay = true;
            this.emitChange("isSameDay");
        }
        if ((prev?.isNewDay || prev?.inNewDay) && prev?.shouldHide && this._isSameDay) {
            this._inNewDay = true
            this.emitChange("inNewDay");
        }
    }

    get targetName() {
        const { sender, stateKey } = this._entry;
        const senderName = this._entry.displayName || sender;
        const targetName = sender === stateKey ? senderName : (this._entry.content?.displayname || stateKey);
        return targetName
    }
    get colorIndex() {
        return this._entry?.entryIndex % 8 + 1
    }
    get announcement() {
        const { sender, content, prevContent, stateKey } = this._entry;
        const senderName = this._entry.displayName || sender;
        const targetName = sender === stateKey ? senderName : (this._entry.content?.displayname || stateKey);
        const membership = content && content.membership;
        const prevMembership = prevContent && prevContent.membership;
        if (prevMembership === "join" && membership === "join") {
            if (content.avatar_url !== prevContent.avatar_url) {
                return `${senderName} changed their avatar`;
            } else if (content.displayname !== prevContent.displayname) {
                if (!content.displayname) {
                    return `${stateKey} removed their name (${prevContent.displayname})`;
                }
                return `${prevContent.displayname ?? stateKey} changed their name to ${content.displayname}`;
            }
        } else if (membership === "join") {
            return `Everyone welcome {userName}`;
            // return `Everyone welcome ${targetName}`;
        } else if (membership === "invite") {
            return `Everyone welcome ${targetName}, invited by ${senderName}`;
        } else if (prevMembership === "invite") {
            if (membership === "join") {
                return `${targetName} accepted the invitation to join the room`;
            } else if (membership === "leave") {
                return `${targetName} declined the invitation to join the room`;
            }
        } else if (membership === "leave") {
            if (stateKey === sender) {
                return `${targetName} left the guild`;
            } else {
                const reason = content.reason;
                return `${targetName} was kicked from the room by ${senderName}${reason ? `: ${reason}` : ""}`;
            }
        } else if (membership === "ban") {
            return `${targetName} was banned from the room by ${senderName}`;
        }

        return `${sender} membership changed to ${content.membership}`;
    }
}

export function tests() {
    return {
        "user removes display name": (assert) => {
            const tile = new RoomMemberTile(
                {
                    prevContent: { displayname: "foo", membership: "join" },
                    content: { membership: "join" },
                    stateKey: "foo@bar.com",
                },
                {}
            );
            assert.strictEqual(tile.announcement, "foo@bar.com removed their name (foo)");
        },
        "user without display name sets a new display name": (assert) => {
            const tile = new RoomMemberTile(
                {
                    prevContent: { membership: "join" },
                    content: { displayname: "foo", membership: "join" },
                    stateKey: "foo@bar.com",
                },
                {}
            );
            assert.strictEqual(tile.announcement, "foo@bar.com changed their name to foo");
        },
    };
}
