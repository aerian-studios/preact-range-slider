import { h } from 'preact';
import { alignValue, clampValue, isValueOutOfRange, } from '../utils';
import AbstractSlider from './AbstractSlider';
import Handle from './Handle';
import Track from './Track';
class Slider extends AbstractSlider {
    constructor(props) {
        super(props);
        const value = ((props.value != null)
            ? props.value
            : ((props.defaultValue != null)
                ? props.defaultValue
                : props.min));
        this.state = {
            dragging: false,
            value: this.clampAlignValue(value),
            toolTipDisplay: false,
            toolTipValue: this.clampAlignValue(value),
        };
    }
    render({ min, max, vertical, included, disabled, classesPrefix, }, { value, dragging }) {
        const offset = this.calcOffset(value);
        const handle = (h(Handle, { vertical: vertical, disabled: disabled, dragging: dragging, min: min, max: max, value: value, index: 1, offset: offset, classesPrefix: classesPrefix, ref: this.saveHandle, key: 'handle-0' }));
        const track = (h(Track, { vertical: vertical, included: included, index: 1, offset: 0, length: offset, classesPrefix: classesPrefix, key: 'track-0' }));
        return this.renderBase(track, handle);
    }
    getValue() {
        return this.state.value;
    }
    getLowerBound() {
        return this.props.min;
    }
    getUpperBound() {
        return this.state.value;
    }
    onChange(state) {
        const props = this.props;
        const isControlled = ('value' in props);
        const hasValue = (s) => typeof s.value !== 'undefined';
        if (isControlled && hasValue(state)) {
            props.onChange(state.value);
            return;
        }
        this.setState(state, () => props.onChange(this.state.value));
    }
    onStart(position) {
        this.setState({ dragging: true });
        const prevValue = this.getValue();
        this.props.onBeforeChange(prevValue);
        const value = this.calcValueByPos(position);
        if (value === prevValue) {
            return;
        }
        this.setState({
            toolTipDisplay: true,
            toolTipValue: value,
        });
        this.onChange({ value });
    }
    onMove(position) {
        const value = this.calcValueByPos(position);
        const oldValue = this.state.value;
        if (value === oldValue) {
            return;
        }
        this.setState({
            toolTipDisplay: true,
            toolTipValue: value,
        });
        this.onChange({ value });
    }
    onHover(position) {
        const value = this.calcValueByPos(position);
        const oldValue = this.state.value;
        if (value === oldValue) {
            return;
        }
        this.setState({
            toolTipDisplay: true,
            toolTipValue: value,
        });
        if (this.state.dragging) {
            this.onChange({ value });
        }
    }
    onEnd() {
        this.setState({
            toolTipDisplay: false,
            dragging: false,
        });
    }
    clampAlignValue(value, nextProps = {}) {
        const mergedProps = Object.assign({}, this.props, nextProps);
        return alignValue(clampValue(value, mergedProps), mergedProps);
    }
}
Slider.getDerivedStateFromProps = (nextProps, prevState) => {
    if (!(('value' in nextProps)
        || ('min' in nextProps)
        || ('max' in nextProps))) {
        return {};
    }
    const prevValue = prevState.value;
    const value = ((nextProps.value == null)
        ? prevValue
        : nextProps.value);
    const nextValue = alignValue(clampValue(value, nextProps), nextProps);
    if (nextValue === prevValue) {
        return {};
    }
    if (isValueOutOfRange(value, nextProps)) {
        nextProps.onChange(nextValue);
    }
    return { value: nextValue };
};
export { Slider as default, };
//# sourceMappingURL=Slider.js.map