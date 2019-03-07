import * as tslib_1 from "tslib";
import { h } from 'preact';
import { alignValue, clampValue, clampValueToSurroundingHandles, isValueOutOfRange, } from '../utils';
import AbstractSlider from './AbstractSlider';
import Handle from './Handle';
import Track from './Track';
var MultiSlider = (function (_super) {
    tslib_1.__extends(MultiSlider, _super);
    function MultiSlider(props) {
        var _this = _super.call(this, props) || this;
        var count = props.count, min = props.min, max = props.max;
        var initialValue = Array(count + 1).slice().map(function () { return min; });
        var values = ((props.value != null)
            ? props.value
            : ((props.defaultValue != null)
                ? props.defaultValue
                : initialValue));
        var bounds = values.map(function (value) { return _this.clampAlignValue(value); });
        var recent = ((bounds[0] === max)
            ? 0
            : bounds.length - 1);
        _this.state = {
            handle: null,
            recent: recent,
            bounds: bounds,
        };
        return _this;
    }
    MultiSlider.prototype.render = function (_a, _b) {
        var _this = this;
        var min = _a.min, max = _a.max, vertical = _a.vertical, included = _a.included, disabled = _a.disabled, classesPrefix = _a.classesPrefix, tipFormatter = _a.tipFormatter;
        var handle = _b.handle, bounds = _b.bounds;
        var offsets = bounds.map(function (value) { return _this.calcOffset(value); });
        var handles = bounds.map(function (value, index) { return (h(Handle, { vertical: vertical, disabled: disabled, dragging: handle === index, min: min, max: max, value: value, index: index + 1, offset: offsets[index], classesPrefix: classesPrefix, ref: function (component) { return _this.saveHandle(component, index); }, key: "handle-" + index }, tipFormatter(value))); });
        var tracks = bounds.slice(0, -1).map(function (_value, index) {
            var nextIndex = index + 1;
            return (h(Track, { vertical: vertical, included: included, index: nextIndex, offset: offsets[index], length: offsets[nextIndex] - offsets[index], classesPrefix: classesPrefix, key: "track-" + index }));
        });
        return this.renderBase(tracks, handles);
    };
    MultiSlider.prototype.getValue = function () {
        return this.state.bounds;
    };
    MultiSlider.prototype.getLowerBound = function () {
        return this.state.bounds[0];
    };
    MultiSlider.prototype.getUpperBound = function () {
        var bounds = this.state.bounds;
        return bounds[bounds.length - 1];
    };
    MultiSlider.prototype.onChange = function (state) {
        var props = this.props;
        var isNotControlled = !('value' in props);
        var hasHandle = function (s) {
            return typeof s.handle !== 'undefined';
        };
        if (isNotControlled) {
            this.setState(state);
        }
        else if (hasHandle(state)) {
            this.setState({ handle: state.handle });
        }
        var data = tslib_1.__assign({}, this.state, state);
        props.onChange(data.bounds);
    };
    MultiSlider.prototype.onStart = function (position) {
        var props = this.props;
        var state = this.state;
        var bounds = this.getValue();
        props.onBeforeChange(bounds);
        var value = this.calcValueByPos(position);
        var closestBound = this.getClosestBound(value);
        var boundNeedMoving = this.getBoundNeedMoving(value, closestBound);
        this.setState({
            handle: boundNeedMoving,
            recent: boundNeedMoving,
        });
        var prevValue = bounds[boundNeedMoving];
        if (value === prevValue) {
            return;
        }
        var nextBounds = state.bounds.slice();
        nextBounds[boundNeedMoving] = value;
        this.onChange({ bounds: nextBounds });
    };
    MultiSlider.prototype.onMove = function (position) {
        var props = this.props;
        var state = this.state;
        if (state.handle == null) {
            return;
        }
        var value = this.calcValueByPos(position);
        var oldValue = state.bounds[state.handle];
        if (value === oldValue) {
            return;
        }
        var nextBounds = state.bounds.slice();
        nextBounds[state.handle] = value;
        var nextHandle = state.handle;
        if (props.pushable !== false) {
            var originalValue = state.bounds[nextHandle];
            this.pushSurroundingHandles(nextBounds, nextHandle, originalValue);
        }
        else if (props.allowCross) {
            nextBounds.sort(function (a, b) { return a - b; });
            nextHandle = nextBounds.indexOf(value);
        }
        this.onChange({
            handle: nextHandle,
            bounds: nextBounds,
        });
    };
    MultiSlider.prototype.onEnd = function () {
        this.setState({ handle: null });
    };
    MultiSlider.prototype.clampAlignValue = function (value, nextProps) {
        if (nextProps === void 0) { nextProps = {}; }
        var mergedProps = tslib_1.__assign({}, this.props, nextProps);
        return alignValue(this.clampValueToSurroundingHandles(clampValue(value, mergedProps), mergedProps), mergedProps);
    };
    MultiSlider.prototype.getClosestBound = function (value) {
        var bounds = this.state.bounds;
        var closestBound = 0;
        for (var i = 1, n = bounds.length - 1; i < n; i++) {
            if (value > bounds[i]) {
                closestBound = i;
            }
        }
        if (Math.abs(bounds[closestBound + 1] - value)
            < Math.abs(bounds[closestBound] - value)) {
            closestBound += 1;
        }
        return closestBound;
    };
    MultiSlider.prototype.getBoundNeedMoving = function (value, closestBound) {
        var _a = this.state, bounds = _a.bounds, recent = _a.recent;
        var boundNeedMoving = closestBound;
        var nextBound = closestBound + 1;
        var atTheSamePoint = (bounds[nextBound] === bounds[closestBound]);
        if (atTheSamePoint) {
            if (bounds[recent] === bounds[closestBound]) {
                boundNeedMoving = recent;
            }
            else {
                boundNeedMoving = nextBound;
            }
            if (value !== bounds[nextBound]) {
                boundNeedMoving = ((value < bounds[nextBound])
                    ? closestBound
                    : nextBound);
            }
        }
        return boundNeedMoving;
    };
    MultiSlider.prototype.pushSurroundingHandles = function (bounds, handle, originalValue) {
        var threshold = Number(this.props.pushable);
        var value = bounds[handle];
        var direction = 0;
        if ((bounds[handle + 1] - value) < threshold) {
            direction = +1;
        }
        if ((value - bounds[handle - 1]) < threshold) {
            direction = -1;
        }
        if (direction === 0) {
            return;
        }
        var nextHandle = handle + direction;
        var diffToNext = direction * (bounds[nextHandle] - value);
        if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
            bounds[handle] = originalValue;
        }
    };
    MultiSlider.prototype.pushHandle = function (bounds, handle, direction, amount) {
        var originalValue = bounds[handle];
        var currentValue = bounds[handle];
        while ((direction * (currentValue - originalValue)) < amount) {
            if (!this.pushHandleOnePoint(bounds, handle, direction)) {
                bounds[handle] = originalValue;
                return false;
            }
            currentValue = bounds[handle];
        }
        return true;
    };
    MultiSlider.prototype.pushHandleOnePoint = function (bounds, handle, direction) {
        var points = this.getPoints();
        var pointIndex = points.indexOf(bounds[handle]);
        var nextPointIndex = pointIndex + direction;
        if ((nextPointIndex >= points.length)
            || (nextPointIndex < 0)) {
            return false;
        }
        var nextHandle = handle + direction;
        var nextValue = points[nextPointIndex];
        var threshold = Number(this.props.pushable);
        var diffToNext = direction * (bounds[nextHandle] - nextValue);
        if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
            return false;
        }
        bounds[handle] = nextValue;
        return true;
    };
    MultiSlider.prototype.getPoints = function () {
        var _a = this.props, marks = _a.marks, step = _a.step, min = _a.min, max = _a.max;
        var cache = this.pointsCache;
        if (!cache
            || (cache.marks !== marks)
            || (cache.step !== step)) {
            var pointsObject = tslib_1.__assign({}, marks);
            if ((step != null)
                && (step > 0)) {
                for (var point = min; point <= max; point += step) {
                    pointsObject[point] = String(point);
                }
            }
            var points = Object.keys(pointsObject).map(Number);
            points.sort(function (a, b) { return a - b; });
            this.pointsCache = { marks: marks, step: step, points: points };
        }
        return this.pointsCache.points;
    };
    MultiSlider.prototype.clampValueToSurroundingHandles = function (value, props) {
        return clampValueToSurroundingHandles(value, props, this.state);
    };
    MultiSlider.defaultProps = tslib_1.__assign({}, AbstractSlider.defaultProps, { count: 1, allowCross: true, pushable: false });
    MultiSlider.getDerivedStateFromProps = function (nextProps, prevState) {
        if (!(('value' in nextProps)
            || ('min' in nextProps)
            || ('max' in nextProps))) {
            return {};
        }
        var bounds = prevState.bounds;
        var value = nextProps.value || bounds;
        var nextBounds = value.map(function (singleValue) { return alignValue(clampValueToSurroundingHandles(clampValue(singleValue, nextProps), nextProps, prevState), nextProps); });
        if ((nextBounds.length === bounds.length)
            && nextBounds.every(function (singleValue, index) { return (singleValue === bounds[index]); })) {
            return {};
        }
        if (bounds.some(function (singleValue) { return isValueOutOfRange(singleValue, nextProps); })) {
            nextProps.onChange(nextBounds);
        }
        return { bounds: nextBounds };
    };
    return MultiSlider;
}(AbstractSlider));
export { MultiSlider as default, };
//# sourceMappingURL=MultiSlider.js.map