import classJoin from 'classjoin';
import { Component, h } from 'preact';
import { getHandleCenterPosition, getMousePosition, getTouchPosition, isEventFromHandle, isNotCorrectTouchEvent, killEvent, noop, } from '../utils';
import Marks from './Marks';
import Steps from './Steps';
var MouseButtons;
(function (MouseButtons) {
    MouseButtons[MouseButtons["LEFT"] = 0] = "LEFT";
    MouseButtons[MouseButtons["MIDDLE"] = 1] = "MIDDLE";
    MouseButtons[MouseButtons["RIGHT"] = 2] = "RIGHT";
    MouseButtons[MouseButtons["BACK"] = 3] = "BACK";
    MouseButtons[MouseButtons["FORWARD"] = 4] = "FORWARD";
})(MouseButtons || (MouseButtons = {}));
class AbstractSlider extends Component {
    constructor() {
        super(...arguments);
        this.dragOffset = 0;
        this.handlesRefs = [];
        this.calcMinValue = (value, seekable) => seekable && seekable > value ? seekable : value;
        this.calcMaxValue = (value, seekable) => seekable && seekable < value ? seekable : value;
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
            if (event.button !== MouseButtons.LEFT) {
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
        const { min, max, step, marks, dots, included, vertical, disabled, className, classesPrefix, children, minSeekable, maxSeekable, } = this.props;
        const lowerBound = this.getLowerBound();
        const upperBound = this.getUpperBound();
        const classes = classJoin({
            [classesPrefix + 'with-marks']: Object.keys(marks).length,
            [classesPrefix + 'vertical']: vertical,
            [classesPrefix + 'disabled']: disabled,
            [classesPrefix + 'minSeekable']: minSeekable && (minSeekable > min),
            [classesPrefix + 'maxSeekable']: maxSeekable && (maxSeekable < max),
        }, [className]);
        const unSeekableStyles = () => {
            const marginLeft = minSeekable && (minSeekable > min) ? ((minSeekable - min) / (max - min)) * 100 : 0;
            const marginRight = maxSeekable && (maxSeekable < max) ? ((max - maxSeekable) / (max - min)) * 100 : 0;
            const scrubberWidth = 100 - (marginRight + marginLeft);
            return {
                margin: `0 ${marginRight}% 0 ${marginLeft}%`,
                width: `${scrubberWidth}%`,
            };
        };
        const maxValue = this.calcMaxValue(max, maxSeekable);
        const minValue = this.calcMinValue(min, minSeekable);
        return (h("div", { class: 'slider-container' },
            h("div", { class: classes, ref: this.saveSlider, onTouchStart: disabled ? noop : this.onTouchStart, onMouseDown: disabled ? noop : this.onMouseDown, style: unSeekableStyles() },
                h("div", { class: classesPrefix + 'rail' }),
                tracks,
                h(Steps, { vertical: vertical, marks: marks, dots: dots, step: step, included: included, lowerBound: lowerBound, upperBound: upperBound, max: maxValue, min: minValue, classesPrefix: classesPrefix }),
                handles,
                h(Marks, { vertical: vertical, marks: marks, included: included, lowerBound: lowerBound, upperBound: upperBound, max: maxValue, min: minValue, classesPrefix: classesPrefix }),
                children)));
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
        const { vertical, min, max, minSeekable, maxSeekable } = this.props;
        const minValue = this.calcMinValue(min, minSeekable);
        const maxValue = this.calcMaxValue(max, maxSeekable);
        const ratio = Math.abs(Math.max(offset, 0) / this.getSliderLength());
        const value = (vertical
            ? ((1 - ratio) * (maxValue - minValue) + minValue)
            : (ratio * (maxValue - minValue) + minValue));
        return maxSeekable ? value <= maxSeekable ? value : maxSeekable : value;
    }
    calcValueByPos(position) {
        const pixelOffset = position - this.getSliderStart();
        const nextValue = this.clampAlignValue(this.calcValue(pixelOffset));
        return nextValue;
    }
    calcOffset(value) {
        const { min, max, minSeekable, maxSeekable } = this.props;
        const minValue = this.calcMinValue(min, minSeekable);
        const maxValue = this.calcMaxValue(max, maxSeekable);
        const ratio = (value - minValue) / (maxValue - minValue);
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
    minSeekable: undefined,
    maxSeekable: undefined,
};
AbstractSlider.getDerivedStateFromProps = (_props, _state) => ({});
export { AbstractSlider as default, };
//# sourceMappingURL=AbstractSlider.js.map