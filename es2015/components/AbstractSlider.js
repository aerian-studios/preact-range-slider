import classJoin from 'classjoin';
import { Component, h } from 'preact';
import { getHandleCenterPosition, getMousePosition, getTouchPosition, isEventFromHandle, isNotCorrectTouchEvent, killEvent, noop, } from '../utils';
import Marks from './Marks';
import Steps from './Steps';
class AbstractSlider extends Component {
    constructor() {
        super(...arguments);
        this.dragOffset = 0;
        this.handlesRefs = [];
        this.saveSlider = (element) => {
            this.sliderRef = element;
        };
        this.saveHandle = (component, index = 0) => {
            if (component == null || component.base === undefined) {
                delete this.handlesRefs[index];
            }
            else {
                this.handlesRefs[index] = component.base;
            }
        };
        this.onMouseDown = (event) => {
            if (event.button !== 0) {
                return;
            }
            const vertical = this.props.vertical;
            let position = getMousePosition(vertical, event);
            if (isEventFromHandle(event, this.handlesRefs)) {
                const handlePosition = getHandleCenterPosition(vertical, event.target);
                this.dragOffset = position - handlePosition;
                position = handlePosition;
            }
            else {
                this.dragOffset = 0;
            }
            this.onStart(position);
            this.addDocumentMouseEvents();
            killEvent(event);
        };
        this.onTouchStart = (event) => {
            if (isNotCorrectTouchEvent(event)) {
                return;
            }
            const vertical = this.props.vertical;
            let position = getTouchPosition(vertical, event);
            if (isEventFromHandle(event, this.handlesRefs)) {
                const handlePosition = getHandleCenterPosition(vertical, event.target);
                this.dragOffset = position - handlePosition;
                position = handlePosition;
            }
            else {
                this.dragOffset = 0;
            }
            this.onStart(position);
            this.addDocumentTouchEvents();
            killEvent(event);
        };
        this.onMouseMove = (event) => {
            if (!this.sliderRef) {
                this.onEnd();
                return;
            }
            const position = getMousePosition(this.props.vertical, event);
            this.onMove(position - this.dragOffset);
            killEvent(event);
        };
        this.onTouchMove = (event) => {
            if (!this.sliderRef
                || isNotCorrectTouchEvent(event)) {
                this.onEnd();
                return;
            }
            const position = getTouchPosition(this.props.vertical, event);
            this.onMove(position - this.dragOffset);
            killEvent(event);
        };
        this.onEventEnd = () => {
            this.removeDocumentEvents();
            this.onEnd();
            this.props.onAfterChange(this.getValue());
        };
    }
    componentWillUnmount() {
        this.removeDocumentEvents();
    }
    renderBase(tracks, handles) {
        const { min, max, step, marks, dots, included, vertical, disabled, className, classesPrefix, children, } = this.props;
        const lowerBound = this.getLowerBound();
        const upperBound = this.getUpperBound();
        const classes = classJoin({
            [classesPrefix + 'with-marks']: Object.keys(marks).length,
            [classesPrefix + 'vertical']: vertical,
            [classesPrefix + 'disabled']: disabled,
        }, [className]);
        return (h("div", { class: classes, ref: this.saveSlider, onTouchStart: disabled ? noop : this.onTouchStart, onMouseDown: disabled ? noop : this.onMouseDown },
            h("div", { class: classesPrefix + 'rail' }),
            tracks,
            h(Steps, { vertical: vertical, marks: marks, dots: dots, step: step, included: included, lowerBound: lowerBound, upperBound: upperBound, max: max, min: min, classesPrefix: classesPrefix }),
            handles,
            h(Marks, { vertical: vertical, marks: marks, included: included, lowerBound: lowerBound, upperBound: upperBound, max: max, min: min, classesPrefix: classesPrefix }),
            children));
    }
    getSliderStart() {
        const slider = this.sliderRef;
        if (!slider) {
            return 0;
        }
        const rect = slider.getBoundingClientRect();
        return (this.props.vertical
            ? rect.top
            : rect.left);
    }
    getSliderLength() {
        const slider = this.sliderRef;
        if (!slider) {
            return 0;
        }
        return (this.props.vertical
            ? slider.clientHeight
            : slider.clientWidth);
    }
    calcValue(offset) {
        const { vertical, min, max } = this.props;
        const ratio = Math.abs(Math.max(offset, 0) / this.getSliderLength());
        const value = (vertical
            ? ((1 - ratio) * (max - min) + min)
            : (ratio * (max - min) + min));
        return value;
    }
    calcValueByPos(position) {
        const pixelOffset = position - this.getSliderStart();
        const nextValue = this.clampAlignValue(this.calcValue(pixelOffset));
        return nextValue;
    }
    calcOffset(value) {
        const { min, max } = this.props;
        const ratio = (value - min) / (max - min);
        return ratio * 100;
    }
    addDocumentMouseEvents() {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onEventEnd);
    }
    addDocumentTouchEvents() {
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onEventEnd);
    }
    removeDocumentEvents() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onEventEnd);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onEventEnd);
    }
}
AbstractSlider.defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    marks: {},
    dots: false,
    included: true,
    vertical: false,
    disabled: false,
    className: 'range-slider',
    classesPrefix: '',
    onBeforeChange: noop,
    onChange: noop,
    onAfterChange: noop,
    tipFormatter: String,
};
AbstractSlider.getDerivedStateFromProps = (_props, _state) => ({});
export { AbstractSlider as default, };
//# sourceMappingURL=AbstractSlider.js.map