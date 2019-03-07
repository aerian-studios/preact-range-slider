import { SliderMarks } from './AbstractSlider';
export interface StepsProps {
    min: number;
    max: number;
    step: number;
    lowerBound: number;
    upperBound: number;
    marks: SliderMarks;
    dots: boolean;
    included: boolean;
    vertical: boolean;
    classesPrefix: string;
}
declare function Steps({ min, max, step, lowerBound, upperBound, marks, dots, included, vertical, classesPrefix, }: StepsProps): JSX.Element;
export { Steps as default, };
