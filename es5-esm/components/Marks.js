import classJoin from 'classjoin';
import { h } from 'preact';
function Marks(_a) {
    var min = _a.min, max = _a.max, lowerBound = _a.lowerBound, upperBound = _a.upperBound, marks = _a.marks, included = _a.included, vertical = _a.vertical, classesPrefix = _a.classesPrefix;
    var marksKeys = Object.keys(marks);
    var marksCount = marksKeys.length;
    var unit = 100 / (marksCount - 1);
    var markWidth = unit * 0.9;
    var range = max - min;
    var elements = marksKeys.map(Number)
        .sort(function (a, b) { return a - b; })
        .map(function (point) {
        var _a;
        var active = ((!included
            && (point === upperBound))
            || (included
                && (point <= upperBound)
                && (point >= lowerBound)));
        var classes = classJoin((_a = {},
            _a[classesPrefix + 'active'] = active,
            _a), [classesPrefix + 'text']);
        var style = (vertical
            ? {
                marginBottom: '-50%',
                bottom: ((point - min) / range * 100) + '%',
            }
            : {
                width: markWidth + '%',
                marginLeft: (-markWidth / 2) + '%',
                left: ((point - min) / range * 100) + '%',
            });
        var markPoint = marks[point];
        return (h("span", { class: classes, style: style, key: String(point) }, markPoint));
    });
    return (h("div", { class: classesPrefix + 'marks' }, elements));
}
export { Marks as default, };
//# sourceMappingURL=Marks.js.map