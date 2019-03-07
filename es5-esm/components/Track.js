import * as tslib_1 from "tslib";
import { Component, h } from 'preact';
var Track = (function (_super) {
    tslib_1.__extends(Track, _super);
    function Track() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Track.prototype.render = function (_a) {
        var vertical = _a.vertical, included = _a.included, index = _a.index, offset = _a.offset, length = _a.length, classesPrefix = _a.classesPrefix;
        var style = {};
        if (!included) {
            style.visibility = 'hidden';
        }
        if (vertical) {
            style.bottom = offset + '%';
            style.height = length + '%';
        }
        else {
            style.left = offset + '%';
            style.width = length + '%';
        }
        return (h("div", { class: classesPrefix + "track " + classesPrefix + "track-" + index, style: style }));
    };
    return Track;
}(Component));
export { Track as default, };
//# sourceMappingURL=Track.js.map