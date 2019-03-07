import AbstractSlider, { AbstractSliderProps, AbstractSliderState } from './AbstractSlider';
export interface MultiSliderProps extends AbstractSliderProps {
    defaultValue: number[];
    value: number[];
    count: number;
    pushable: boolean | number;
    allowCross: boolean;
    onBeforeChange(value: number[]): void;
    onChange(value: number[]): void;
    onAfterChange(value: number[]): void;
}
export interface MultiSliderState extends AbstractSliderState {
    handle: number | null;
    recent: number;
    bounds: number[];
}
export interface MultiSliderDefaultProps extends AbstractSliderProps {
    count: number;
    pushable: boolean | number;
    allowCross: boolean;
}
declare class MultiSlider extends AbstractSlider<Partial<MultiSliderProps>, MultiSliderState> {
    static defaultProps: Readonly<MultiSliderDefaultProps>;
    private pointsCache;
    static getDerivedStateFromProps: (nextProps: MultiSliderProps, prevState: MultiSliderState) => Partial<MultiSliderState>;
    constructor(props: MultiSliderProps);
    render({ min, max, vertical, included, disabled, classesPrefix, tipFormatter, }: MultiSliderProps, { handle, bounds }: MultiSliderState): JSX.Element;
    protected getValue(): number[];
    protected getLowerBound(): number;
    protected getUpperBound(): number;
    protected onChange<TKey extends keyof MultiSliderState>(state: Pick<MultiSliderState, TKey>): void;
    protected onStart(position: number): void;
    protected onMove(position: number): void;
    protected onEnd(): void;
    protected clampAlignValue(value: number, nextProps?: Partial<MultiSliderProps>): number;
    private getClosestBound;
    private getBoundNeedMoving;
    private pushSurroundingHandles;
    private pushHandle;
    private pushHandleOnePoint;
    private getPoints;
    private clampValueToSurroundingHandles;
}
export { MultiSlider as default, };
