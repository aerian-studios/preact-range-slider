import { SliderMarks } from './components/AbstractSlider';
declare function noop(..._rest: any[]): void;
declare function clampValue(value: number, { min, max }: {
    min: number;
    max: number;
}): number;
declare function isValueOutOfRange(value: number, { min, max }: {
    min: number;
    max: number;
}): boolean;
export declare function clampValueToSurroundingHandles(value: number, { allowCross }: {
    allowCross: boolean;
}, { handle, bounds }: {
    handle: number | null;
    bounds: number[];
}): number;
export interface AlignValueProps {
    marks: SliderMarks;
    step: number;
    min: number;
}
declare function alignValue(value: number, props: AlignValueProps): number;
declare function getHandleCenterPosition(vertical: boolean, handle: Element): number;
declare function getMousePosition(vertical: boolean, event: MouseEvent): number;
declare function getTouchPosition(vertical: boolean, event: TouchEvent): number;
declare function isEventFromHandle(event: Event, handles: Element[]): boolean;
declare function isNotCorrectTouchEvent(event: TouchEvent): boolean;
declare function killEvent(event: Event): void;
export { noop, clampValue, isValueOutOfRange, alignValue, getHandleCenterPosition, getMousePosition, getTouchPosition, isEventFromHandle, isNotCorrectTouchEvent, killEvent, };
