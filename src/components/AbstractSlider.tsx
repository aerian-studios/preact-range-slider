import classJoin from 'classjoin';
import { Component, ComponentChildren, h, PreactDOMAttributes } from 'preact';
import {
	getHandleCenterPosition,
	getMousePosition,
	getTouchPosition,
	isEventFromHandle,
	isNotCorrectTouchEvent,
	killEvent,
	noop,
} from '../utils';
import Marks from './Marks';
import Steps from './Steps';

/**
 * Component Properties.
 */
export interface AbstractSliderProps
{
	/** Minimum value */
	min: number;
	/** Maximum value */
	max: number;
	/** Value to be added or subtracted on each step the slider makes */
	step: number;
	/** Marks on the slider */
	marks: SliderMarks;
	/** Show dots on slider (with step as interval)? */
	dots: boolean;
	/** As continuous value interval (otherwise, as independent values)? */
	included: boolean;
	/** Vertical mode? */
	vertical: boolean;
	/** Control disabled? */
	disabled: boolean;
	/** Component main class name */
	className: string;
	/** Prefix for secondary class names in component */
	classesPrefix: string;
	/** Triggered before value is start to change (on mouse down, etc) */
	onBeforeChange( value: SliderValue ): void;
	/** Triggered while the value of Slider changing */
	onChange( value: SliderValue ): void;
	/** Triggered after slider changes stop (on mouse up, etc) */
	onAfterChange( value: SliderValue ): void;
	/** A function to format value on tooltip */
	tipFormatter( value: number ): ComponentChildren;
	/** Minimum value to be displayed that the slider can not access */
	minSeekable?: number;
	/** Maximum value to be displayed that the slider can not access */
	maxSeekable?: number;
}

/**
 * Marks on the slider. The key determines the position, and the value
 * determines what will show.
 */
export interface SliderMarks
{
	[key: number]: ComponentChildren;
}

/**
 * Allowed type of slider value.
 */
export type SliderValue = number | number[];

/**
 * Component State.
 */
// tslint:disable-next-line:no-empty-interface
export interface AbstractSliderState
{
	// Empty
}

/**
 * Buttons in MouseEvent.button.
 */
enum MouseButtons
{
	LEFT,
	MIDDLE,
	RIGHT,
	BACK,
	FORWARD,
}

/**
 * Abstract slider class (for single and multi slider).
 */
abstract class AbstractSlider<
		TProps extends Partial<AbstractSliderProps>,
		TState extends AbstractSliderState
	>
	extends Component<TProps, TState>
{
	/**
	 * Default property values.
	 */
	public static defaultProps: Readonly<AbstractSliderProps> = {
		min: 0,
		max: 100,
		step: 1,
		marks: {},
		dots: false,
		included: true,
		vertical: false,
		disabled: false,
		className: 'range-slider',
		classesPrefix: '',
		onBeforeChange: noop,
		onChange: noop,
		onAfterChange: noop,
		tipFormatter: String,
		minSeekable: undefined,
		maxSeekable: undefined,
	};
	
	/**
	 * Current cursor offset while dragging.
	 */
	public dragOffset: number = 0;
	
	/**
	 * References to handles in DOM.
	 */
	protected handlesRefs: Element[] = [];
	/**
	 * Reference to slider in DOM.
	 */
	protected sliderRef: Element | undefined;

	public static getDerivedStateFromProps = (
		_props: Partial<AbstractSliderProps>, 
		_state: AbstractSliderState,
		): Partial<AbstractSliderState> => ({})

	/**
	 * Before component will be unmounted and destroyed.
	 */
	public componentWillUnmount(): void
	{
		this.removeDocumentEvents();
	}

	private calcMinValue = (value: number, seekable?: number) => 
		seekable && seekable > value ? seekable : value;

	private calcMaxValue = (value: number, seekable?: number) => 
		seekable && seekable < value ? seekable : value;
	
	/**
	 * Render base markup of the component.
	 * 
	 * @param tracks Tracks on slider.
	 * @param handles Handles on slider.
	 */
	protected renderBase(
		tracks: ComponentChildren,
		handles: ComponentChildren,
	): JSX.Element
	{
		const {
			min,
			max,
			step,
			marks,
			dots,
			included,
			vertical,
			disabled,
			className,
			classesPrefix,
			children,
			minSeekable,
			maxSeekable,
		} = this.props as AbstractSliderProps & PreactDOMAttributes; 
		
		const lowerBound = this.getLowerBound();
		const upperBound = this.getUpperBound();
		
		const classes = classJoin(
			{
				[classesPrefix + 'with-marks']: Object.keys( marks ).length as any,
				[classesPrefix + 'vertical']: vertical,
				[classesPrefix + 'disabled']: disabled,
			},
			[className],
		);

		const unSeekableStyles = () => {
			const marginLeft = minSeekable ? (minSeekable / max) * 100 : 0;
			const marginRight = maxSeekable ? ((max - maxSeekable) / max) * 100  : 0;
			const scrubberWidth = 100 - (marginRight + marginLeft);

			return { 
				margin: `0 ${marginRight}% 0 ${marginLeft}%`,
				width: `${scrubberWidth}%`,
			};
		};

		const maxValue = this.calcMaxValue(max, maxSeekable);
		const minValue = this.calcMinValue(min, minSeekable);
		
		return (
			<div class={'slider-container'}>
				<div
					class={classes}
					ref={this.saveSlider}
					onTouchStart={disabled ? noop : this.onTouchStart}
					onMouseDown={disabled ? noop : this.onMouseDown}
					style={unSeekableStyles()}
				>
					<div class={classesPrefix + 'rail'} />
					{tracks}
					<Steps
						vertical={vertical}
						marks={marks}
						dots={dots}
						step={step}
						included={included}
						lowerBound={lowerBound}
						upperBound={upperBound}
						max={maxValue}
						min={minValue}
						classesPrefix={classesPrefix}
					/>
					{handles}
					<Marks
						vertical={vertical}
						marks={marks}
						included={included}
						lowerBound={lowerBound}
						upperBound={upperBound}
						max={maxValue}
						min={minValue}
						classesPrefix={classesPrefix}
					/>
					{children}
				</div>
			</div>
		);
	}
	
	/**
	 * Save reference to slider element.
	 */
	protected saveSlider = ( element: Element ): void =>
	{
		this.sliderRef = element;
	}
	
	/**
	 * Save reference to handle element.
	 */
	protected saveHandle = (
		component: Component<any, any> | null,
		index: number = 0,
	): void =>
	{
		if ( component == null || component.base === undefined)
		{
			delete this.handlesRefs[index];
		}
		else
		{
			this.handlesRefs[index] = component.base;
		}
	}
	
	/**
	 * Get position, where slider starts in document (pixels).
	 */
	protected getSliderStart(): number
	{
		const slider = this.sliderRef;
		
		if ( !slider )
		{
			return 0;
		}
		
		const rect = slider.getBoundingClientRect();
		
		return (
			this.props.vertical
			? rect.top
			: rect.left
		);
	}
	
	/**
	 * Get length of the slider in document (pixels).
	 */
	protected getSliderLength(): number
	{
		const slider = this.sliderRef;
		
		if ( !slider )
		{
			return 0;
		}
		
		return (
			this.props.vertical
			? slider.clientHeight
			: slider.clientWidth
		);
	}

	/**
	 * Calc slider value based on offset from slider element start.
	 */
	protected calcValue( offset: number ): number
	{
		const { vertical, min, max, minSeekable, maxSeekable } = this.props as AbstractSliderProps;
		const minValue = this.calcMinValue(min, minSeekable);
		const maxValue = this.calcMaxValue(max, maxSeekable);
		const ratio = Math.abs( Math.max( offset, 0 ) / this.getSliderLength() );

		const value = (
			vertical
			? ( (1 - ratio) * (maxValue - minValue) + minValue )
			: ( ratio * (maxValue - minValue) + minValue )
		);
		
		return maxSeekable ? value <= maxSeekable ? value : maxSeekable : value;
	}
	
	/**
	 * Calc slider value based on a position in document.
	 */
	protected calcValueByPos( position: number ): number
	{
		const pixelOffset = position - this.getSliderStart();
		const nextValue = this.clampAlignValue(
			this.calcValue( pixelOffset ),
		);
		
		return nextValue;
	}
	
	/**
	 * Calc offset in slider element based on a value.
	 */
	protected calcOffset( value: number ): number
	{
		const { min, max, minSeekable, maxSeekable } = this.props as AbstractSliderProps;
		const minValue = this.calcMinValue(min, minSeekable);
		const maxValue = this.calcMaxValue(max, maxSeekable);
		const ratio = (value - minValue) / (maxValue - minValue);
		
		return ratio * 100;
	}
	
	/**
	 * Clamp current value to min-max interval on align to available values
	 * using step and marks.
	 */
	protected abstract clampAlignValue(
		value: number,
		nextProps?: Partial<TProps>,
	): number;
	
	/**
	 * When value changed.
	 */
	protected abstract onChange<TKey extends keyof TState>(
		state: Pick<TState, TKey>,
	): void;
	/**
	 * On mouse/touch start.
	 */
	protected abstract onStart( position: number ): void;
	/**
	 * On mouse/touch move.
	 */
	protected abstract onMove( position: number ): void;
	/**
	 * On mouse/touch end.
	 */
	protected abstract onEnd(): void;
	/**
	 * Get current value.
	 */
	protected abstract getValue(): SliderValue;
	/**
	 * Get lower bound of current interval.
	 */
	protected abstract getLowerBound(): number;
	/**
	 * Get upper bound of current interval.
	 */
	protected abstract getUpperBound(): number;
	
	/**
	 * Start mouse event.
	 */
	private onMouseDown = ( event: MouseEvent ): void =>
	{
		if ( event.button !== MouseButtons.LEFT )
		{
			return;
		}
		
		// tslint:disable-next-line:no-non-null-assertion
		const vertical = this.props.vertical!;
		let position: number = getMousePosition( vertical, event );
		
		if ( isEventFromHandle( event, this.handlesRefs ) )
		{
			const handlePosition = getHandleCenterPosition(
				vertical,
				event.target as Element,
			);
			this.dragOffset = position - handlePosition;
			position = handlePosition;
		}
		else
		{
			this.dragOffset = 0;
		}
		
		this.onStart( position );
		this.addDocumentMouseEvents();
		killEvent( event );
	}
	
	/**
	 * Start touch event.
	 */
	private onTouchStart = ( event: TouchEvent ): void =>
	{
		if ( isNotCorrectTouchEvent( event ) )
		{
			return;
		}
		
		// tslint:disable-next-line:no-non-null-assertion
		const vertical = this.props.vertical!;
		let position: number = getTouchPosition( vertical, event );
		
		if ( isEventFromHandle( event, this.handlesRefs ) )
		{
			const handlePosition = getHandleCenterPosition(
				vertical,
				event.target as Element,
			);
			this.dragOffset = position - handlePosition;
			position = handlePosition;
		}
		else
		{
			this.dragOffset = 0;
		}
		
		this.onStart( position );
		this.addDocumentTouchEvents();
		killEvent( event );
	}
	
	/**
	 * Mouse moving.
	 */
	private onMouseMove = ( event: MouseEvent ): void =>
	{
		if ( !this.sliderRef )
		{
			this.onEnd();
			
			return;
		}
		
		// tslint:disable-next-line:no-non-null-assertion
		const position = getMousePosition( this.props.vertical!, event );
		this.onMove( position - this.dragOffset );
		killEvent( event );
	}
	
	/**
	 * Touch moving.
	 */
	private onTouchMove = ( event: TouchEvent ): void =>
	{
		if (
			!this.sliderRef
			|| isNotCorrectTouchEvent( event )
		)
		{
			this.onEnd();
			
			return;
		}
		
		// tslint:disable-next-line:no-non-null-assertion
		const position = getTouchPosition( this.props.vertical!, event );
		this.onMove( position - this.dragOffset );
		killEvent( event );
	}
	
	/**
	 * Stop mouse/touch event.
	 */
	private onEventEnd = (): void =>
	{
		this.removeDocumentEvents();
		this.onEnd();
		(this.props as AbstractSliderProps).onAfterChange( this.getValue() );
	}
	
	/**
	 * Add mouse events to the document.
	 */
	private addDocumentMouseEvents(): void
	{
		document.addEventListener( 'mousemove', this.onMouseMove );
		document.addEventListener( 'mouseup', this.onEventEnd );
	}
	
	/**
	 * Add touch events to the document.
	 */
	private addDocumentTouchEvents(): void
	{
		document.addEventListener( 'touchmove', this.onTouchMove );
		document.addEventListener( 'touchend', this.onEventEnd );
	}
	
	/**
	 * Remove mouse and touch events from the document.
	 */
	private removeDocumentEvents(): void
	{
		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseup', this.onEventEnd );
		
		document.removeEventListener( 'touchmove', this.onTouchMove );
		document.removeEventListener( 'touchend', this.onEventEnd );
	}
	
}

/**
 * Module.
 */
export {
	AbstractSlider as default,
	// AbstractSliderProps,
	// AbstractSliderState,
	// SliderMarks,
};
