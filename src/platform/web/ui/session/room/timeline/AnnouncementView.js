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

import { TemplateView } from "../../../general/TemplateView";

export class AnnouncementView extends TemplateView {
    // ignore other arguments
    constructor(vm) {
        super(vm);
    }

    render(t) {
        const isNewDay = this.value?.isNewDay
        const shouldHide = this.value?.shouldHide
        const inNewDay = this.value?.inNewDay
        const noContent = this.value?.noContent
        const showTime = (isNewDay || inNewDay) && !noContent


        const timeTitle = t.div({ className: { timeTitle: true } });
        const timeTitleTimer = t.time({ className: {} }, this.value?.date);
        timeTitle.appendChild(timeTitleTimer)

        const showWelcome = (this.value?.announcement || '').toLocaleLowerCase().indexOf('welcome') !== -1;
        const shouldReplace = (this.value?.announcement || '').indexOf('{userName}') !== -1;
        return t.li({
            className: `AnnouncementView ${showTime ? 'showTime' : ''} ${shouldHide ? 'hidden' : 'joining'}`
        }, [
            t.div({
                className: 'AnnouncementView_inner'
            }, [
                t.div({ className: 'AnnouncementView_inner_upper' }, [
                    t.div({ className: 'AnnouncementView_inner_upper_img' }),
                    ...shouldReplace ? [
                        t.div(`${(this.value?.announcement || '').replace('{userName}', ' ')}`),
                        t.span({ style: 'margin-left: 4px;', className: `usercolor${this.value?.colorIndex}` }, `${this.value?.targetName}`)
                    ] : [t.div(`${this.value?.announcement}`)],
                ]),
                t.div({ className: 'AnnouncementView_inner_below' }, showWelcome ? [
                    t.span({ className: 'AnnouncementView_hi', onClick: () => this.value?.sendWelcome() }, '👋 Wave to say hi!'),
                    t.time({ className: 'AnnouncementView_innertime' }, this.value?.time)
                ] : [
                    t.span(),
                    t.time({ className: 'AnnouncementView_innertime' }, this.value?.time)
                ]),
                timeTitle,
            ])
        ])
    }

    /* This is called by the parent ListView, which just has 1 listener for the whole list */
    onClick() { }
}
