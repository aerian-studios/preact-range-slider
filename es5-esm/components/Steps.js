import classJoin from 'classjoin';
import { h } from 'preact';
function Steps(_a) {
    var min = _a.min, max = _a.max, step = _a.step, lowerBound = _a.lowerBound, upperBound = _a.upperBound, marks = _a.marks, dots = _a.dots, included = _a.included, vertical = _a.vertical, classesPrefix = _a.classesPrefix;
    var range = max - min;
    var elements = calcPoints(marks, dots, step, min, max).map(function (point) {
        var _a;
        var offset = (Math.abs(point - min) / range * 100) + '%';
        var style = (vertical
            ? { bottom: offset }
            : { left: offset });
        var active = ((!included
            && (point === upperBound))
            || (included
                && (point <= upperBound)
                && (point >= lowerBound)));
        var classes = classJoin((_a = {},
            _a[classesPrefix + 'active'] = active,
            _a), [classesPrefix + 'dot']);
        return (h("span", { class: classes, style: style, key: String(point) }));
    });
    return (h("div", { class: classesPrefix + 'steps' }, elements));
}
function calcPoints(marks, dots, step, min, max) {
    var points = Object.keys(marks).map(Number);
    if (dots && (step > 0)) {
        for (var i = min; i <= max; i = i + step) {
            if (points.indexOf(i) === -1) {
                points.push(i);
            }
        }
    }
    return points;
}
export { Steps as default, };
//# sourceMappingURL=Steps.js.map