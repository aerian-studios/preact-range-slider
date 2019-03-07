import classJoin from 'classjoin';
import { h } from 'preact';
function Steps({ min, max, step, lowerBound, upperBound, marks, dots, included, vertical, classesPrefix, }) {
    const range = max - min;
    const elements = calcPoints(marks, dots, step, min, max).map((point) => {
        const offset = (Math.abs(point - min) / range * 100) + '%';
        const style = (vertical
            ? { bottom: offset }
            : { left: offset });
        const active = ((!included
            && (point === upperBound))
            || (included
                && (point <= upperBound)
                && (point >= lowerBound)));
        const classes = classJoin({
            [classesPrefix + 'active']: active,
        }, [classesPrefix + 'dot']);
        return (h("span", { class: classes, style: style, key: String(point) }));
    });
    return (h("div", { class: classesPrefix + 'steps' }, elements));
}
function calcPoints(marks, dots, step, min, max) {
    const points = Object.keys(marks).map(Number);
    if (dots && (step > 0)) {
        for (let i = min; i <= max; i = i + step) {
            if (points.indexOf(i) === -1) {
                points.push(i);
            }
        }
    }
    return points;
}
export { Steps as default, };
//# sourceMappingURL=Steps.js.map