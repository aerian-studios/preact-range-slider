import * as tslib_1 from "tslib";
import classJoin from 'classjoin';
import { Component, h } from 'preact';
var Handle = (function (_super) {
    tslib_1.__extends(Handle, _super);
    function Handle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.saveElement = function (element) {
            _this.elementRef = element;
        };
        return _this;
    }
    Handle.prototype.render = function (_a) {
        var min = _a.min, max = _a.max, value = _a.value, vertical = _a.vertical, disabled = _a.disabled, dragging = _a.dragging, index = _a.index, offset = _a.offset, classesPrefix = _a.classesPrefix, children = _a.children;
        var _b;
        var style = (vertical
            ? {
                bottom: offset + '%',
            }
            : {
                left: offset + '%',
            });
        if (dragging && this.elementRef) {
            this.elementRef.focus();
        }
        var classes = classJoin((_b = {},
            _b[classesPrefix + 'dragging'] = dragging,
            _b), [
            classesPrefix + 'handle',
            classesPrefix + "handle-" + index,
        ]);
        return (h("div", { class: classes, style: style, role: "slider", tabIndex: disabled ? undefined : 0, "aria-orientation": vertical ? 'vertical' : 'horizontal', "aria-disabled": String(disabled), "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, ref: this.saveElement },
            h("span", { class: classesPrefix + 'tip' }, children)));
    };
    return Handle;
}(Component));
export { Handle as default, };
//# sourceMappingURL=Handle.js.map