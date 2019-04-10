import { Component, ComponentChildren } from 'preact';
export interface AbstractSliderProps {
    min: number;
    max: number;
    step: number;
    marks: SliderMarks;
    dots: boolean;
    included: boolean;
    vertical: boolean;
    disabled: boolean;
    className: string;
    classesPrefix: string;
    minSeekable?: number;
    maxSeekable?: number;
    onBeforeChange(value: SliderValue): void;
    onChange(value: SliderValue): void;
    onAfterChange(value: SliderValue): void;
    tipFormatter(value: number): ComponentChildren;
}
export interface SliderMarks {
    [key: number]: ComponentChildren;
}
export declare type SliderValue = number | number[];
export interface AbstractSliderState {
    dragging: boolean;
    value: number;
    toolTipDisplay: boolean;
    toolTipValue: number;
}
declare abstract class AbstractSlider<TProps extends Partial<AbstractSliderProps>, TState extends AbstractSliderState> extends Component<TProps, TState> {
    static defaultProps: Readonly<AbstractSliderProps>;
    dragOffset: number;
    protected handlesRefs: Element[];
    protected sliderRef: Element | undefined;
    static getDerivedStateFromProps: (_props: Partial<AbstractSliderProps>, _state: AbstractSliderState) => Partial<AbstractSliderState>;
    componentWillUnmount(): void;
    protected renderBase(tracks: ComponentChildren, handles: ComponentChildren): JSX.Element;
    protected saveSlider: (element: Element) => void;
    protected saveHandle: (component: Component<any, any> | null, index?: number) => void;
    protected getSliderStart(): number;
    protected getSliderLength(): number;
    protected calcValue(offset: number): number;
    protected calcValueByPos(position: number): number;
    protected calcOffset(value: number): number;
    protected abstract clampAlignValue(value: number, nextProps?: Partial<TProps>): number;
    protected abstract onChange<TKey extends keyof TState>(state: Pick<TState, TKey>): void;
    protected abstract onStart(position: number): void;
    protected abstract onMove(position: number): void;
    protected abstract onHover(position: number): void;
    protected abstract onEnd(): void;
    protected abstract getValue(): SliderValue;
    protected abstract getLowerBound(): number;
    protected abstract getUpperBound(): number;
    private calcMinValue;
    private calcMaxValue;
    private onMouseDown;
    private onTouchStart;
    private onDocumentMouseMove;
    private onSliderMouseMove;
    private onSliderMouseLeave;
    private onTouchMove;
    private onEventEnd;
    private addDocumentMouseEvents;
    private addDocumentTouchEvents;
    private removeDocumentEvents;
    private removeElementEvents;
}
export { AbstractSlider as default, };
