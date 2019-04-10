import { h } from 'preact';
import { alignValue, clampValue, clampValueToSurroundingHandles, isValueOutOfRange, } from '../utils';
import AbstractSlider from './AbstractSlider';
import Handle from './Handle';
import Track from './Track';
class MultiSlider extends AbstractSlider {
    constructor(props) {
        super(props);
        const { count, min, max } = props;
        const initialValue = [...Array(count + 1)].map(() => min);
        const values = ((props.value != null)
            ? props.value
            : ((props.defaultValue != null)
                ? props.defaultValue
                : initialValue));
        const bounds = values.map((value) => this.clampAlignValue(value));
        const recent = ((bounds[0] === max)
            ? 0
            : bounds.length - 1);
        this.state = {
            handle: null,
            recent,
            bounds,
            dragging: false,
            value: 0,
            toolTipDisplay: false,
            toolTipValue: 0,
        };
    }
    render({ min, max, vertical, included, disabled, classesPrefix, }, { handle, bounds }) {
        const offsets = bounds.map((value) => this.calcOffset(value));
        const handles = bounds.map((value, index) => (h(Handle, { vertical: vertical, disabled: disabled, dragging: handle === index, min: min, max: max, value: value, index: index + 1, offset: offsets[index], classesPrefix: classesPrefix, ref: (component) => this.saveHandle(component, index), key: `handle-${index}` })));
        const tracks = bounds.slice(0, -1).map((_value, index) => {
            const nextIndex = index + 1;
            return (h(Track, { vertical: vertical, included: included, index: nextIndex, offset: offsets[index], length: offsets[nextIndex] - offsets[index], classesPrefix: classesPrefix, key: `track-${index}` }));
        });
        return this.renderBase(tracks, handles);
    }
    getValue() {
        return this.state.bounds;
    }
    getLowerBound() {
        return this.state.bounds[0];
    }
    getUpperBound() {
        const { bounds } = this.state;
        return bounds[bounds.length - 1];
    }
    onChange(state) {
        const props = this.props;
        const isNotControlled = !('value' in props);
        const hasHandle = (s) => typeof s.handle !== 'undefined';
        if (isNotControlled) {
            this.setState(state);
        }
        else if (hasHandle(state)) {
            this.setState({ handle: state.handle });
        }
        const data = Object.assign({}, this.state, state);
        props.onChange(data.bounds);
    }
    onStart(position) {
        const props = this.props;
        const state = this.state;
        const bounds = this.getValue();
        props.onBeforeChange(bounds);
        const value = this.calcValueByPos(position);
        const closestBound = this.getClosestBound(value);
        const boundNeedMoving = this.getBoundNeedMoving(value, closestBound);
        this.setState({
            handle: boundNeedMoving,
            recent: boundNeedMoving,
        });
        const prevValue = bounds[boundNeedMoving];
        if (value === prevValue) {
            return;
        }
        const nextBounds = [...state.bounds];
        nextBounds[boundNeedMoving] = value;
        this.onChange({ bounds: nextBounds });
    }
    onHover(position) {
        const value = this.calcValueByPos(position);
        this.setState({
            toolTipValue: value,
            toolTipDisplay: false,
        });
    }
    onMove(position) {
        const props = this.props;
        const state = this.state;
        if (state.handle == null) {
            return;
        }
        const value = this.calcValueByPos(position);
        const oldValue = state.bounds[state.handle];
        if (value === oldValue) {
            return;
        }
        const nextBounds = [...state.bounds];
        nextBounds[state.handle] = value;
        let nextHandle = state.handle;
        if (props.pushable !== false) {
            const originalValue = state.bounds[nextHandle];
            this.pushSurroundingHandles(nextBounds, nextHandle, originalValue);
        }
        else if (props.allowCross) {
            nextBounds.sort((a, b) => a - b);
            nextHandle = nextBounds.indexOf(value);
        }
        this.onChange({
            handle: nextHandle,
            bounds: nextBounds,
        });
    }
    onEnd() {
        this.setState({ handle: null });
    }
    clampAlignValue(value, nextProps = {}) {
        const mergedProps = Object.assign({}, this.props, nextProps);
        return alignValue(this.clampValueToSurroundingHandles(clampValue(value, mergedProps), mergedProps), mergedProps);
    }
    getClosestBound(value) {
        const { bounds } = this.state;
        let closestBound = 0;
        for (let i = 1, n = bounds.length - 1; i < n; i++) {
            if (value > bounds[i]) {
                closestBound = i;
            }
        }
        if (Math.abs(bounds[closestBound + 1] - value)
            < Math.abs(bounds[closestBound] - value)) {
            closestBound += 1;
        }
        return closestBound;
    }
    getBoundNeedMoving(value, closestBound) {
        const { bounds, recent } = this.state;
        let boundNeedMoving = closestBound;
        const nextBound = closestBound + 1;
        const atTheSamePoint = (bounds[nextBound] === bounds[closestBound]);
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
    }
    pushSurroundingHandles(bounds, handle, originalValue) {
        const threshold = Number(this.props.pushable);
        const value = bounds[handle];
        let direction = 0;
        if ((bounds[handle + 1] - value) < threshold) {
            direction = +1;
        }
        if ((value - bounds[handle - 1]) < threshold) {
            direction = -1;
        }
        if (direction === 0) {
            return;
        }
        const nextHandle = handle + direction;
        const diffToNext = direction * (bounds[nextHandle] - value);
        if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
            bounds[handle] = originalValue;
        }
    }
    pushHandle(bounds, handle, direction, amount) {
        const originalValue = bounds[handle];
        let currentValue = bounds[handle];
        while ((direction * (currentValue - originalValue)) < amount) {
            if (!this.pushHandleOnePoint(bounds, handle, direction)) {
                bounds[handle] = originalValue;
                return false;
            }
            currentValue = bounds[handle];
        }
        return true;
    }
    pushHandleOnePoint(bounds, handle, direction) {
        const points = this.getPoints();
        const pointIndex = points.indexOf(bounds[handle]);
        const nextPointIndex = pointIndex + direction;
        if ((nextPointIndex >= points.length)
            || (nextPointIndex < 0)) {
            return false;
        }
        const nextHandle = handle + direction;
        const nextValue = points[nextPointIndex];
        const threshold = Number(this.props.pushable);
        const diffToNext = direction * (bounds[nextHandle] - nextValue);
        if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
            return false;
        }
        bounds[handle] = nextValue;
        return true;
    }
    getPoints() {
        const { marks, step, min, max } = this.props;
        const cache = this.pointsCache;
        if (!cache
            || (cache.marks !== marks)
            || (cache.step !== step)) {
            const pointsObject = Object.assign({}, marks);
            if ((step != null)
                && (step > 0)) {
                for (let point = min; point <= max; point += step) {
                    pointsObject[point] = String(point);
                }
            }
            const points = Object.keys(pointsObject).map(Number);
            points.sort((a, b) => a - b);
            this.pointsCache = { marks, step, points };
        }
        return this.pointsCache.points;
    }
    clampValueToSurroundingHandles(value, props) {
        return clampValueToSurroundingHandles(value, props, this.state);
    }
}
MultiSlider.defaultProps = Object.assign({}, AbstractSlider.defaultProps, { count: 1, allowCross: true, pushable: false });
MultiSlider.getDerivedStateFromProps = (nextProps, prevState) => {
    if (!(('value' in nextProps)
        || ('min' in nextProps)
        || ('max' in nextProps))) {
        return {};
    }
    const { bounds } = prevState;
    const value = nextProps.value || bounds;
    const nextBounds = value.map((singleValue) => alignValue(clampValueToSurroundingHandles(clampValue(singleValue, nextProps), nextProps, prevState), nextProps));
    if ((nextBounds.length === bounds.length)
        && nextBounds.every((singleValue, index) => (singleValue === bounds[index]))) {
        return {};
    }
    if (bounds.some((singleValue) => isValueOutOfRange(singleValue, nextProps))) {
        nextProps.onChange(nextBounds);
    }
    return { bounds: nextBounds };
};
export { MultiSlider as default, };
//# sourceMappingURL=MultiSlider.js.map