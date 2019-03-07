import * as tslib_1 from "tslib";
import { h } from 'preact';
import { alignValue, clampValue, isValueOutOfRange, } from '../utils';
import AbstractSlider from './AbstractSlider';
import Handle from './Handle';
import Track from './Track';
var Slider = (function (_super) {
    tslib_1.__extends(Slider, _super);
    function Slider(props) {
        var _this = _super.call(this, props) || this;
        var value = ((props.value != null)
            ? props.value
            : ((props.defaultValue != null)
                ? props.defaultValue
                : props.min));
        _this.state = {
            dragging: false,
            value: _this.clampAlignValue(value),
        };
        return _this;
    }
    Slider.prototype.render = function (_a, _b) {
        var min = _a.min, max = _a.max, vertical = _a.vertical, included = _a.included, disabled = _a.disabled, classesPrefix = _a.classesPrefix, tipFormatter = _a.tipFormatter;
        var value = _b.value, dragging = _b.dragging;
        var offset = this.calcOffset(value);
        var handle = (h(Handle, { vertical: vertical, disabled: disabled, dragging: dragging, min: min, max: max, value: value, index: 1, offset: offset, classesPrefix: classesPrefix, ref: this.saveHandle, key: 'handle-0' }, tipFormatter(value)));
        var track = (h(Track, { vertical: vertical, included: included, index: 1, offset: 0, length: offset, classesPrefix: classesPrefix, key: 'track-0' }));
        return this.renderBase(track, handle);
    };
    Slider.prototype.getValue = function () {
        return this.state.value;
    };
    Slider.prototype.getLowerBound = function () {
        return this.props.min;
    };
    Slider.prototype.getUpperBound = function () {
        return this.state.value;
    };
    Slider.prototype.onChange = function (state) {
        var _this = this;
        var props = this.props;
        var isControlled = ('value' in props);
        var hasValue = function (s) {
            return typeof s.value !== 'undefined';
        };
        if (isControlled && hasValue(state)) {
            props.onChange(state.value);
            return;
        }
        this.setState(state, function () { return props.onChange(_this.state.value); });
    };
    Slider.prototype.onStart = function (position) {
        this.setState({ dragging: true });
        var prevValue = this.getValue();
        this.props.onBeforeChange(prevValue);
        var value = this.calcValueByPos(position);
        if (value === prevValue) {
            return;
        }
        this.onChange({ value: value });
    };
    Slider.prototype.onMove = function (position) {
        var value = this.calcValueByPos(position);
        var oldValue = this.state.value;
        if (value === oldValue) {
            return;
        }
        this.onChange({ value: value });
    };
    Slider.prototype.onEnd = function () {
        this.setState({ dragging: false });
    };
    Slider.prototype.clampAlignValue = function (value, nextProps) {
        if (nextProps === void 0) { nextProps = {}; }
        var mergedProps = tslib_1.__assign({}, this.props, nextProps);
        return alignValue(clampValue(value, mergedProps), mergedProps);
    };
    Slider.getDerivedStateFromProps = function (nextProps, prevState) {
        if (!(('value' in nextProps)
            || ('min' in nextProps)
            || ('max' in nextProps))) {
            return {};
        }
        var prevValue = prevState.value;
        var value = ((nextProps.value == null)
            ? prevValue
            : nextProps.value);
        var nextValue = alignValue(clampValue(value, nextProps), nextProps);
        if (nextValue === prevValue) {
            return {};
        }
        if (isValueOutOfRange(value, nextProps)) {
            nextProps.onChange(nextValue);
        }
        return { value: nextValue };
    };
    return Slider;
}(AbstractSlider));
export { Slider as default, };
//# sourceMappingURL=Slider.js.map