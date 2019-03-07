import { SliderMarks } from './AbstractSlider';
export interface MarksProps {
    min: number;
    max: number;
    lowerBound: number;
    upperBound: number;
    marks: SliderMarks;
    included: boolean;
    vertical: boolean;
    classesPrefix: string;
}
declare function Marks({ min, max, lowerBound, upperBound, marks, included, vertical, classesPrefix, }: MarksProps): JSX.Element;
export { Marks as default, };
