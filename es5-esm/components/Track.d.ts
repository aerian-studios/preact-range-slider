import { Component } from 'preact';
export interface TrackProps {
    vertical: boolean;
    included: boolean;
    index: number;
    offset: number;
    length: number;
    classesPrefix: string;
}
export interface TrackState {
    [key: string]: void;
}
declare class Track extends Component<TrackProps, TrackState> {
    render({ vertical, included, index, offset, length, classesPrefix }: TrackProps): JSX.Element;
}
export { Track as default, };
