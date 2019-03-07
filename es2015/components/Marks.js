import classJoin from 'classjoin';
import { h } from 'preact';
function Marks({ min, max, lowerBound, upperBound, marks, included, vertical, classesPrefix, }) {
    const marksKeys = Object.keys(marks);
    const marksCount = marksKeys.length;
    const unit = 100 / (marksCount - 1);
    const markWidth = unit * 0.9;
    const range = max - min;
    const elements = marksKeys.map(Number)
        .sort((a, b) => a - b)
        .map((point) => {
        const active = ((!included
            && (point === upperBound))
            || (included
                && (point <= upperBound)
                && (point >= lowerBound)));
        const classes = classJoin({
            [classesPrefix + 'active']: active,
        }, [classesPrefix + 'text']);
        const style = (vertical
            ? {
                marginBottom: '-50%',
                bottom: ((point - min) / range * 100) + '%',
            }
            : {
                width: markWidth + '%',
                marginLeft: (-markWidth / 2) + '%',
                left: ((point - min) / range * 100) + '%',
            });
        const markPoint = marks[point];
        return (h("span", { class: classes, style: style, key: String(point) }, markPoint));
    });
    return (h("div", { class: classesPrefix + 'marks' }, elements));
}
export { Marks as default, };
//# sourceMappingURL=Marks.js.map