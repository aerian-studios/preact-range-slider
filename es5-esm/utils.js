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
export function clampValueToSurroundingHandles(value, _a, _b) {
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
export { noop, clampValue, isValueOutOfRange, alignValue, getHandleCenterPosition, getMousePosition, getTouchPosition, isEventFromHandle, isNotCorrectTouchEvent, killEvent, };
//# sourceMappingURL=utils.js.map