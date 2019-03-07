import AbstractSlider, { AbstractSliderProps, AbstractSliderState } from './AbstractSlider';
export interface SliderProps extends AbstractSliderProps {
    defaultValue: number;
    value: number;
    onBeforeChange(value: number): void;
    onChange(value: number): void;
    onAfterChange(value: number): void;
}
export interface SliderState extends AbstractSliderState {
    dragging: boolean;
    value: number;
}
declare class Slider extends AbstractSlider<SliderProps, SliderState> {
    static getDerivedStateFromProps: (nextProps: SliderProps, prevState: SliderState) => Partial<SliderState>;
    constructor(props: SliderProps);
    render({ min, max, vertical, included, disabled, classesPrefix, tipFormatter, }: SliderProps, { value, dragging }: SliderState): JSX.Element;
    protected getValue(): number;
    protected getLowerBound(): number;
    protected getUpperBound(): number;
    protected onChange<TKey extends keyof SliderState>(state: Pick<SliderState, TKey>): void;
    protected onStart(position: number): void;
    protected onMove(position: number): void;
    protected onEnd(): void;
    protected clampAlignValue(value: number, nextProps?: Partial<SliderProps>): number;
}
export { Slider as default, };
