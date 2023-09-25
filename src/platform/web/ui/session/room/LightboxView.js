/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

import { TemplateView } from "../../general/TemplateView";
import { spinner } from "../../common.js";

let draging = false
let dragingStartX = 0
let dragingStartY = 0
export class LightboxView extends TemplateView {
    render(t, vm) {

        const wheelFunc = (e) => {
            if (e.deltaY > 0) {
                zoom += zoomingSpeed
            } else {
                zoom -= zoomingSpeed
            }
            if (zoom > 3) zoom = 3
            if (zoom < 0.3) zoom = 0.3
            image.style.transform = `scale(${(zoom)})`;
        }

        const close = t.a({
            href: vm.closeUrl, title: vm.i18n`Close`, className: "close", onClick: () => {
                document.removeEventListener("wheel", wheelFunc)
                document.removeEventListener("wheel", wheelFunc)
                let lightBoxDom = document.getElementById('lightbox-main')
                lightBoxDom.parentNode.removeChild(lightBoxDom)
                lightBoxDom = null
            }
        });
        const image = t.img({
            className: {
                picture: true,
                hidden: vm => !vm.imageUrl,
            },
            onClick: evt => {
                evt.stopPropagation()
                evt.preventDefault()
            },
            src: vm.imageUrl,
            title: vm => vm.name,
            style: vm => `
                max-width: ${vm.imageWidth}px; 
                max-height: ${vm.imageHeight}px;
                top:${(vm.imageHeight + 32) > window.innerHeight ? '0' : ((window.innerHeight - vm.imageHeight - 32) / 2) + 'px'};
                left:${(vm.imageWidth + 32) > window.innerWidth ? '0' : ((window.innerWidth - vm.imageWidth - 32) / 2) + 'px'};
            `
        })
        // const image = t.div({
        //     role: "img",
        //     "aria-label": vm => vm.name,
        //     title: vm => vm.name,
        //     className: {
        //         picture: true,
        //         hidden: vm => !vm.imageUrl,
        //     },
        //     style: vm => `
        //         background-image: url('${vm.imageUrl}');
        //         max-width: ${vm.imageWidth}px;
        //         max-height: ${vm.imageHeight}px;
        //         top:${(vm.imageHeight + 32) > window.innerHeight ? '0' : ((window.innerHeight - vm.imageHeight - 32) / 2) + 'px'};
        //         left:${(vm.imageWidth + 32) > window.innerWidth ? '0' : ((window.innerWidth - vm.imageWidth - 32) / 2) + 'px'};
        //     `
        // });
        let zoom = 1;
        const zoomingSpeed = 0.05;

        document.addEventListener("wheel", wheelFunc)
        const imageContainer = t.div({
            className: { 'lightbox-image-container': true },
            ontouchstart: (e) => {
                draging = true
                dragingStartX = e.targetTouches[0].clientX - (parseInt(image.style.left) || 0)
                dragingStartY = e.targetTouches[0].clientY - (parseInt(image.style.top) || 0)
            },
            onmousedown: (e) => {
                draging = true
                dragingStartX = e.x - (parseInt(image.style.left) || 0)
                dragingStartY = e.y - (parseInt(image.style.top) || 0)
            },
            ontouchmove: (e) => {
                if (draging) {
                    image.style.top = `${e.targetTouches[0].clientY - dragingStartY}px`
                    image.style.left = `${e.targetTouches[0].clientX - dragingStartX}px`
                }
            },
            onmousemove: (e) => {
                if (draging) {
                    image.style.top = `${e.y - dragingStartY}px`
                    image.style.left = `${e.x - dragingStartX}px`
                }
            },
            ontouchend: () => {
                draging = false
                dragingStartX = 0
                dragingStartY = 0
            },
            onmouseup: () => {
                draging = false
                dragingStartX = 0
                dragingStartY = 0
            },
        }, image)
        const loading = t.div({
            className: {
                loading: true,
                hidden: vm => !!vm.imageUrl
            }
        }, [
            spinner(t),
            t.div(vm.i18n`Loading image…`)
        ]);
        const details = t.div({
            className: "details"
        }, [t.strong(vm => vm.name), t.br(), "uploaded by ", t.strong(vm => vm.sender), vm => ` at ${vm.time} on ${vm.date}.`]);
        const dialog = t.div({
            role: "dialog",
            className: "lightbox",
            onClick: evt => {
                evt.stopPropagation()
                document.removeEventListener("wheel", wheelFunc)
                document.removeEventListener("wheel", wheelFunc)
                let lightBoxDom = document.getElementById('lightbox-main')
                lightBoxDom.parentNode.removeChild(lightBoxDom)
                lightBoxDom = null
            },
            onKeydown: evt => {
                evt.stopPropagation()
                document.removeEventListener("wheel", wheelFunc)
                document.removeEventListener("wheel", wheelFunc)
                let lightBoxDom = document.getElementById('lightbox-main')
                lightBoxDom.parentNode.removeChild(lightBoxDom)
                lightBoxDom = null
            }
            // onClick: evt => this.clickToClose(evt),
            // onKeydown: evt => this.closeOnEscKey(evt)
        }, [imageContainer, loading, details, close]);
        trapFocus(t, dialog);
        return dialog;
    }

    clickToClose(evt) {
        if (evt.target === this.root()) {
            this.value.close.onClick();
        }
    }

    closeOnEscKey(evt) {
        if (evt.key === "Escape" || evt.key === "Esc") {
            this.value.onClick();
        }
    }
}

function trapFocus(t, element) {
    const elements = focusables(element);
    const first = elements[0];
    const last = elements[elements.length - 1];

    t.addEventListener(element, "keydown", evt => {
        if (evt.key === "Tab") {
            if (evt.shiftKey) {
                if (document.activeElement === first) {
                    last.focus();
                    evt.preventDefault();
                }
            } else {
                if (document.activeElement === last) {
                    first.focus();
                    evt.preventDefault();
                }
            }
        }
    }, true);
    Promise.resolve().then(() => {
        first.focus();
    });
}

function focusables(element) {
    return element.querySelectorAll('a[href], button, textarea, input, select');
}
