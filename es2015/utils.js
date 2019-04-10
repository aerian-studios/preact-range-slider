function noop(..._rest) {
}
function clampValue(value, { min, max }) {
    if (value <= min) {
        return min;
    }
    if (value >= max) {
        return max;
    }
    return value;
}
function isValueOutOfRange(value, { min, max }) {
    return ((value < min)
        || (value > max));
}
function getPrecision(step) {
    const stepString = step.toString();
    const dotIndex = stepString.indexOf('.');
    let precision = 0;
    if (dotIndex !== -1) {
        precision = stepString.length - dotIndex - 1;
    }
    return precision;
}
export function clampValueToSurroundingHandles(value, { allowCross }, { handle, bounds }) {
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
function getClosestPoint(value, { marks, step, min }) {
    const points = Object.keys(marks).map(Number);
    if ((step != null)
        && (step > 0)) {
        const closestStep = Math.round((value - min) / step) * step + min;
        points.push(closestStep);
    }
    const diffs = points.map((point) => Math.abs(value - point));
    return (points[diffs.indexOf(Math.min(...diffs))]
        || min);
}
function alignValue(value, props) {
    const { step } = props;
    const closestPoint = getClosestPoint(value, props);
    return (((step == null)
        || (step <= 0))
        ? closestPoint
        : Number(closestPoint.toFixed(getPrecision(step))));
}
function getHandleCenterPosition(vertical, handle) {
    const coords = handle.getBoundingClientRect();
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
    return (handles.some((handle) => event.target === handle));
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
const ONEHOUR = 3600;
export const zeroPad = (num) => num >= 100 ? `${Math.floor(num)}` : `00${Math.floor(num)}`.slice(-2);
export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) {
        return '';
    }
    if (seconds > 604800) {
        const date = new Date(seconds * 1000);
        return (zeroPad(date.getHours()) +
            ':' +
            zeroPad(date.getMinutes()) +
            ':' +
            zeroPad(date.getSeconds()));
    }
    let sign = '';
    if (seconds < 0) {
        seconds = Math.abs(seconds);
        sign = '-';
    }
    if (seconds < ONEHOUR) {
        return sign + zeroPad(seconds / 60) + ':' + zeroPad(seconds % 60);
    }
    const formatted = Math.floor(seconds / ONEHOUR) +
        ':' +
        zeroPad((seconds % ONEHOUR) / 60) +
        ':' +
        zeroPad(seconds % 60);
    return `${sign}${formatted}`;
};
//# sourceMappingURL=utils.js.map