import { Component, ComponentChildren } from 'preact';
export interface HandleProps {
    vertical: boolean;
    disabled: boolean;
    dragging: boolean;
    min: number;
    max: number;
    value: number;
    index: number;
    offset: number;
    classesPrefix: string;
    children?: ComponentChildren;
}
export interface HandleState {
    [key: string]: void;
}
declare class Handle extends Component<HandleProps, HandleState> {
    private elementRef;
    render({ min, max, value, vertical, disabled, dragging, index, offset, classesPrefix, children, }: HandleProps): JSX.Element;
    private saveElement;
}
export { Handle as default, };
