import { Component, h } from 'preact';
class Track extends Component {
    render({ vertical, included, index, offset, length, classesPrefix }) {
        const style = {};
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
        return (h("div", { class: `${classesPrefix}track ${classesPrefix}track-${index}`, style: style }));
    }
}
export { Track as default, };
//# sourceMappingURL=Track.js.map