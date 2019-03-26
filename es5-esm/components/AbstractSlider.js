import * as tslib_1 from "tslib";
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
var AbstractSlider = (function (_super) {
    tslib_1.__extends(AbstractSlider, _super);
    function AbstractSlider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dragOffset = 0;
        _this.handlesRefs = [];
        _this.calcMinValue = function (value, seekable) {
            return seekable && seekable > value ? seekable : value;
        };
        _this.calcMaxValue = function (value, seekable) {
            return seekable && seekable < value ? seekable : value;
        };
        _this.saveSlider = function (element) {
            _this.sliderRef = element;
        };
        _this.saveHandle = function (component, index) {
            if (index === void 0) { index = 0; }
            if (component == null || component.base === undefined) {
                delete _this.handlesRefs[index];
            }
            else {
                _this.handlesRefs[index] = component.base;
            }
        };
        _this.onMouseDown = function (event) {
            if (event.button !== MouseButtons.LEFT) {
                return;
            }
            var vertical = _this.props.vertical;
            var position = getMousePosition(vertical, event);
            if (isEventFromHandle(event, _this.handlesRefs)) {
                var handlePosition = getHandleCenterPosition(vertical, event.target);
                _this.dragOffset = position - handlePosition;
                position = handlePosition;
            }
            else {
                _this.dragOffset = 0;
            }
            _this.onStart(position);
            _this.addDocumentMouseEvents();
            killEvent(event);
        };
        _this.onTouchStart = function (event) {
            if (isNotCorrectTouchEvent(event)) {
                return;
            }
            var vertical = _this.props.vertical;
            var position = getTouchPosition(vertical, event);
            if (isEventFromHandle(event, _this.handlesRefs)) {
                var handlePosition = getHandleCenterPosition(vertical, event.target);
                _this.dragOffset = position - handlePosition;
                position = handlePosition;
            }
            else {
                _this.dragOffset = 0;
            }
            _this.onStart(position);
            _this.addDocumentTouchEvents();
            killEvent(event);
        };
        _this.onMouseMove = function (event) {
            if (!_this.sliderRef) {
                _this.onEnd();
                return;
            }
            var position = getMousePosition(_this.props.vertical, event);
            _this.onMove(position - _this.dragOffset);
            killEvent(event);
        };
        _this.onTouchMove = function (event) {
            if (!_this.sliderRef
                || isNotCorrectTouchEvent(event)) {
                _this.onEnd();
                return;
            }
            var position = getTouchPosition(_this.props.vertical, event);
            _this.onMove(position - _this.dragOffset);
            killEvent(event);
        };
        _this.onEventEnd = function () {
            _this.removeDocumentEvents();
            _this.onEnd();
            _this.props.onAfterChange(_this.getValue());
        };
        return _this;
    }
    AbstractSlider.prototype.componentWillUnmount = function () {
        this.removeDocumentEvents();
    };
    AbstractSlider.prototype.renderBase = function (tracks, handles) {
        var _a;
        var _b = this.props, min = _b.min, max = _b.max, step = _b.step, marks = _b.marks, dots = _b.dots, included = _b.included, vertical = _b.vertical, disabled = _b.disabled, className = _b.className, classesPrefix = _b.classesPrefix, children = _b.children, minSeekable = _b.minSeekable, maxSeekable = _b.maxSeekable;
        var lowerBound = this.getLowerBound();
        var upperBound = this.getUpperBound();
        var classes = classJoin((_a = {},
            _a[classesPrefix + 'with-marks'] = Object.keys(marks).length,
            _a[classesPrefix + 'vertical'] = vertical,
            _a[classesPrefix + 'disabled'] = disabled,
            _a[classesPrefix + 'minSeekable'] = minSeekable && (minSeekable > min),
            _a[classesPrefix + 'maxSeekable'] = maxSeekable && (maxSeekable < max),
            _a), [className]);
        var unSeekableStyles = function () {
            var marginLeft = minSeekable && (minSeekable > min) ? (minSeekable / max) * 100 : 0;
            var marginRight = maxSeekable && (maxSeekable < max) ? ((max - maxSeekable) / max) * 100 : 0;
            var scrubberWidth = 100 - (marginRight + marginLeft);
            return {
                margin: "0 " + marginRight + "% 0 " + marginLeft + "%",
                width: scrubberWidth + "%",
            };
        };
        var maxValue = this.calcMaxValue(max, maxSeekable);
        var minValue = this.calcMinValue(min, minSeekable);
        return (h("div", { class: 'slider-container' },
            h("div", { class: classes, ref: this.saveSlider, onTouchStart: disabled ? noop : this.onTouchStart, onMouseDown: disabled ? noop : this.onMouseDown, style: unSeekableStyles() },
                h("div", { class: classesPrefix + 'rail' }),
                tracks,
                h(Steps, { vertical: vertical, marks: marks, dots: dots, step: step, included: included, lowerBound: lowerBound, upperBound: upperBound, max: maxValue, min: minValue, classesPrefix: classesPrefix }),
                handles,
                h(Marks, { vertical: vertical, marks: marks, included: included, lowerBound: lowerBound, upperBound: upperBound, max: maxValue, min: minValue, classesPrefix: classesPrefix }),
                children)));
    };
    AbstractSlider.prototype.getSliderStart = function () {
        var slider = this.sliderRef;
        if (!slider) {
            return 0;
        }
        var rect = slider.getBoundingClientRect();
        return (this.props.vertical
            ? rect.top
            : rect.left);
    };
    AbstractSlider.prototype.getSliderLength = function () {
        var slider = this.sliderRef;
        if (!slider) {
            return 0;
        }
        return (this.props.vertical
            ? slider.clientHeight
            : slider.clientWidth);
    };
    AbstractSlider.prototype.calcValue = function (offset) {
        var _a = this.props, vertical = _a.vertical, min = _a.min, max = _a.max, minSeekable = _a.minSeekable, maxSeekable = _a.maxSeekable;
        var minValue = this.calcMinValue(min, minSeekable);
        var maxValue = this.calcMaxValue(max, maxSeekable);
        var ratio = Math.abs(Math.max(offset, 0) / this.getSliderLength());
        var value = (vertical
            ? ((1 - ratio) * (maxValue - minValue) + minValue)
            : (ratio * (maxValue - minValue) + minValue));
        return maxSeekable ? value <= maxSeekable ? value : maxSeekable : value;
    };
    AbstractSlider.prototype.calcValueByPos = function (position) {
        var pixelOffset = position - this.getSliderStart();
        var nextValue = this.clampAlignValue(this.calcValue(pixelOffset));
        return nextValue;
    };
    AbstractSlider.prototype.calcOffset = function (value) {
        var _a = this.props, min = _a.min, max = _a.max, minSeekable = _a.minSeekable, maxSeekable = _a.maxSeekable;
        var minValue = this.calcMinValue(min, minSeekable);
        var maxValue = this.calcMaxValue(max, maxSeekable);
        var ratio = (value - minValue) / (maxValue - minValue);
        return ratio * 100;
    };
    AbstractSlider.prototype.addDocumentMouseEvents = function () {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onEventEnd);
    };
    AbstractSlider.prototype.addDocumentTouchEvents = function () {
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onEventEnd);
    };
    AbstractSlider.prototype.removeDocumentEvents = function () {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onEventEnd);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onEventEnd);
    };
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
    AbstractSlider.getDerivedStateFromProps = function (_props, _state) { return ({}); };
    return AbstractSlider;
}(Component));
export { AbstractSlider as default, };
//# sourceMappingURL=AbstractSlider.js.map