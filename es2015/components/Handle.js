import classJoin from 'classjoin';
import { Component, h } from 'preact';
class Handle extends Component {
    constructor() {
        super(...arguments);
        this.saveElement = (element) => {
            this.elementRef = element;
        };
    }
    render({ min, max, value, vertical, disabled, dragging, index, offset, classesPrefix, children, }) {
        const style = (vertical
            ? {
                bottom: offset + '%',
            }
            : {
                left: offset + '%',
            });
        if (dragging && this.elementRef) {
            this.elementRef.focus();
        }
        const classes = classJoin({
            [classesPrefix + 'dragging']: dragging,
        }, [
            classesPrefix + 'handle',
            `${classesPrefix}handle-${index}`,
        ]);
        return (h("div", { class: classes, style: style, role: "slider", tabIndex: disabled ? undefined : 0, "aria-orientation": vertical ? 'vertical' : 'horizontal', "aria-disabled": String(disabled), "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, ref: this.saveElement },
            h("span", { class: classesPrefix + 'tip' }, children)));
    }
}
export { Handle as default, };
//# sourceMappingURL=Handle.js.map