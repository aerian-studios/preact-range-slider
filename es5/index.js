(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('preact')) :
	typeof define === 'function' && define.amd ? define(['exports', 'preact'], factory) :
	(factory((global.PreactRangeSlider = {}),global.preact));
}(this, (function (exports,preact) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

function noop() {
    var _rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        _rest[_i] = arguments[_i];
    }
}
function clampValue(value, _a) {
    var min = _a.min, max = _a.max;
    if (value <= min) {
        return min;
    }
    if (value >= max) {
        return max;
    }
    return value;
}
function isValueOutOfRange(value, _a) {
    var min = _a.min, max = _a.max;
    return ((value < min)
        || (value > max));
}
function getPrecision(step) {
    var stepString = step.toString();
    var dotIndex = stepString.indexOf('.');
    var precision = 0;
    if (dotIndex !== -1) {
        precision = stepString.length - dotIndex - 1;
    }
    return precision;
}
function clampValueToSurroundingHandles(value, _a, _b) {
    var allowCross = _a.allowCross;
    var handle = _b.handle, bounds = _b.bounds;
    if (!allowCross
        && (handle != null)) {
        if ((handle > 0)
            && (value <= bounds[handle - 1])) {
            return bounds[handle - 1];
        }
        if ((handle < (bounds.length - 1))
            && (value >= bounds[handle + 1])) {
            return bounds[handle + 1];
        }
    }
    return value;
}
function getClosestPoint(value, _a) {
    var marks = _a.marks, step = _a.step, min = _a.min;
    var points = Object.keys(marks).map(Number);
    if ((step != null)
        && (step > 0)) {
        var closestStep = Math.round((value - min) / step) * step + min;
        points.push(closestStep);
    }
    var diffs = points.map(function (point) { return Math.abs(value - point); });
    return (points[diffs.indexOf(Math.min.apply(Math, diffs))]
        || min);
}
function alignValue(value, props) {
    var step = props.step;
    var closestPoint = getClosestPoint(value, props);
    return (((step == null)
        || (step <= 0))
        ? closestPoint
        : Number(closestPoint.toFixed(getPrecision(step))));
}
function getHandleCenterPosition(vertical, handle) {
    var coords = handle.getBoundingClientRect();
    return (vertical
        ? coords.top + (coords.height / 2)
        : coords.left + (coords.width / 2));
}
function getMousePosition(vertical, event) {
    return (vertical ? event.clientY : event.pageX);
}
function getTouchPosition(vertical, event) {
    return (vertical ? event.touches[0].clientY : event.touches[0].pageX);
}
function isEventFromHandle(event, handles) {
    return (handles.some(function (handle) { return event.target === handle; }));
}
function isNotCorrectTouchEvent(event) {
    return ((event.touches.length > 1)
        || ((event.type.toLowerCase() === 'touchend')
            && (event.touches.length > 0)));
}
function killEvent(event) {
    event.stopPropagation();
    event.preventDefault();
}

function classJoin(withConditions, withoutConditions) {
    var classes = [];
    var keys = Object.keys(withConditions);
    for (var i = 0, n = keys.length; i < n; i++) {
        var key = keys[i];
        if (withConditions[key]) {
            classes.push(key);
        }
    }
    if (withoutConditions) {
        classes = withoutConditions.concat(classes);
    }
    return classes.join(' ');
}

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
        return (preact.h("span", { class: classes, style: style, key: String(point) }, markPoint));
    });
    return (preact.h("div", { class: classesPrefix + 'marks' }, elements));
}

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
        return (preact.h("span", { class: classes, style: style, key: String(point) }));
    });
    return (preact.h("div", { class: classesPrefix + 'steps' }, elements));
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

var AbstractSlider = (function (_super) {
    __extends(AbstractSlider, _super);
    function AbstractSlider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dragOffset = 0;
        _this.handlesRefs = [];
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
            if (event.button !== 0) {
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
        var _b = this.props, min = _b.min, max = _b.max, step = _b.step, marks = _b.marks, dots = _b.dots, included = _b.included, vertical = _b.vertical, disabled = _b.disabled, className = _b.className, classesPrefix = _b.classesPrefix, children = _b.children;
        var lowerBound = this.getLowerBound();
        var upperBound = this.getUpperBound();
        var classes = classJoin((_a = {},
            _a[classesPrefix + 'with-marks'] = Object.keys(marks).length,
            _a[classesPrefix + 'vertical'] = vertical,
            _a[classesPrefix + 'disabled'] = disabled,
            _a), [className]);
        return (preact.h("div", { class: classes, ref: this.saveSlider, onTouchStart: disabled ? noop : this.onTouchStart, onMouseDown: disabled ? noop : this.onMouseDown },
            preact.h("div", { class: classesPrefix + 'rail' }),
            tracks,
            preact.h(Steps, { vertical: vertical, marks: marks, dots: dots, step: step, included: included, lowerBound: lowerBound, upperBound: upperBound, max: max, min: min, classesPrefix: classesPrefix }),
            handles,
            preact.h(Marks, { vertical: vertical, marks: marks, included: included, lowerBound: lowerBound, upperBound: upperBound, max: max, min: min, classesPrefix: classesPrefix }),
            children));
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
        var _a = this.props, vertical = _a.vertical, min = _a.min, max = _a.max;
        var ratio = Math.abs(Math.max(offset, 0) / this.getSliderLength());
        var value = (vertical
            ? ((1 - ratio) * (max - min) + min)
            : (ratio * (max - min) + min));
        return value;
    };
    AbstractSlider.prototype.calcValueByPos = function (position) {
        var pixelOffset = position - this.getSliderStart();
        var nextValue = this.clampAlignValue(this.calcValue(pixelOffset));
        return nextValue;
    };
    AbstractSlider.prototype.calcOffset = function (value) {
        var _a = this.props, min = _a.min, max = _a.max;
        var ratio = (value - min) / (max - min);
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
    };
    AbstractSlider.getDerivedStateFromProps = function (_props, _state) { return ({}); };
    return AbstractSlider;
}(preact.Component));

var Handle = (function (_super) {
    __extends(Handle, _super);
    function Handle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.saveElement = function (element) {
            _this.elementRef = element;
        };
        return _this;
    }
    Handle.prototype.render = function (_a) {
        var min = _a.min, max = _a.max, value = _a.value, vertical = _a.vertical, disabled = _a.disabled, dragging = _a.dragging, index = _a.index, offset = _a.offset, classesPrefix = _a.classesPrefix, children = _a.children;
        var _b;
        var style = (vertical
            ? {
                bottom: offset + '%',
            }
            : {
                left: offset + '%',
            });
        if (dragging && this.elementRef) {
            this.elementRef.focus();
        }
        var classes = classJoin((_b = {},
            _b[classesPrefix + 'dragging'] = dragging,
            _b), [
            classesPrefix + 'handle',
            classesPrefix + "handle-" + index,
        ]);
        return (preact.h("div", { class: classes, style: style, role: "slider", tabIndex: disabled ? undefined : 0, "aria-orientation": vertical ? 'vertical' : 'horizontal', "aria-disabled": String(disabled), "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, ref: this.saveElement },
            preact.h("span", { class: classesPrefix + 'tip' }, children)));
    };
    return Handle;
}(preact.Component));

var Track = (function (_super) {
    __extends(Track, _super);
    function Track() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Track.prototype.render = function (_a) {
        var vertical = _a.vertical, included = _a.included, index = _a.index, offset = _a.offset, length = _a.length, classesPrefix = _a.classesPrefix;
        var style = {};
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
        return (preact.h("div", { class: classesPrefix + "track " + classesPrefix + "track-" + index, style: style }));
    };
    return Track;
}(preact.Component));

var Slider = (function (_super) {
    __extends(Slider, _super);
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
        var handle = (preact.h(Handle, { vertical: vertical, disabled: disabled, dragging: dragging, min: min, max: max, value: value, index: 1, offset: offset, classesPrefix: classesPrefix, ref: this.saveHandle, key: 'handle-0' }, tipFormatter(value)));
        var track = (preact.h(Track, { vertical: vertical, included: included, index: 1, offset: 0, length: offset, classesPrefix: classesPrefix, key: 'track-0' }));
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
        var mergedProps = __assign({}, this.props, nextProps);
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

var MultiSlider = (function (_super) {
    __extends(MultiSlider, _super);
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
        var handles = bounds.map(function (value, index) { return (preact.h(Handle, { vertical: vertical, disabled: disabled, dragging: handle === index, min: min, max: max, value: value, index: index + 1, offset: offsets[index], classesPrefix: classesPrefix, ref: function (component) { return _this.saveHandle(component, index); }, key: "handle-" + index }, tipFormatter(value))); });
        var tracks = bounds.slice(0, -1).map(function (_value, index) {
            var nextIndex = index + 1;
            return (preact.h(Track, { vertical: vertical, included: included, index: nextIndex, offset: offsets[index], length: offsets[nextIndex] - offsets[index], classesPrefix: classesPrefix, key: "track-" + index }));
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
        var data = __assign({}, this.state, state);
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
        var mergedProps = __assign({}, this.props, nextProps);
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
            var pointsObject = __assign({}, marks);
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
    MultiSlider.defaultProps = __assign({}, AbstractSlider.defaultProps, { count: 1, allowCross: true, pushable: false });
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

exports.Slider = Slider;
exports.MultiSlider = MultiSlider;

Object.defineProperty(exports, '__esModule', { value: true });

})));
