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

import { BaseMessageView } from "./BaseMessageView.js";

export class FileView extends BaseMessageView {
    renderMessageBody(t, vm) {
        const children = [];
        if (vm.isPending) {
            children.push(vm => vm.label);
        } else {
            const dateTime = t.span({ className: { hidden: !vm.date, datetimeAtEnd: true } }, vm.date);
            const time = t.span(vm.time);
            const timeContainer = t.time({}, [dateTime, ' ', time])
            const fileCardImg = t.div({ className: 'file-card-image' })
            const fileCardTxt1 = t.div({ className: 'file-card-content' }, vm => vm.filename)
            const fileCardTxt2 = t.div({ className: 'file-card-content' }, [vm.filesize, ' - ', vm.filestatus])
            const fileCardTxt3 = t.span({ className: 'file-card-tooltip' }, [vm.filename])
            const fileCardTxt = t.div({ className: 'file-card-txt' }, [fileCardTxt1, fileCardTxt2, fileCardTxt3])
            const fileCard = t.div({ className: 'file-card', onClick: () => vm.download() })
            fileCard.appendChild(fileCardImg)
            fileCard.appendChild(fileCardTxt)
            children.push(
                // t.button({className: "link", onClick: () => vm.download()}, vm => vm.label),
                fileCard,
                timeContainer
            );
        }
        return t.p({ className: "Timeline_messageBody statusMessage file-message" }, children);
    }
}
