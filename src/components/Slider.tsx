import {h} from 'preact';
import {
	alignValue,
	clampValue,
	isValueOutOfRange,
} from '../utils';
import AbstractSlider, {
	AbstractSliderProps,
	AbstractSliderState,
} from './AbstractSlider';
import Handle from './Handle';
import Track from './Track';

/**
 * Component Properties.
 */
export interface SliderProps extends AbstractSliderProps
{
	/** Initial value of handle. */
	defaultValue: number;
	/** Current value of handle */
	value: number;
	/** Triggered before value is start to change (on mouse down, etc) */
	onBeforeChange( value: number ): void;
	/** Triggered while the value of Slider changing */
	onChange( value: number ): void;
	/** Triggered after slider changes stop (on mouse up, etc) */
	onAfterChange( value: number ): void;
}

/**
 * Component State.
 */
export interface SliderState extends AbstractSliderState
{
}

/**
 * Slider with single handle.
 */
class Slider extends AbstractSlider<SliderProps, SliderState>
{
	/**
	 * Slider with single handle.
	 */

	/**
	 * When component recieve properties.
	 */
	public static getDerivedStateFromProps = ( 
		nextProps: SliderProps, 
		prevState: SliderState,
	): Partial<SliderState> => {

		if (
			!(
				( 'value' in nextProps )
				|| ( 'min' in nextProps )
				|| ( 'max' in nextProps )
			)
		)
		{
			return {};
		}
		const prevValue = prevState.value;
		const value = (
			( nextProps.value == null )
			? prevValue
			: nextProps.value
		);
		const nextValue = alignValue(
			clampValue( value, nextProps ),
			nextProps,
		);

		if ( nextValue === prevValue )
		{
			return {};
		}
				
		if ( isValueOutOfRange( value, nextProps ) )
		{
			nextProps.onChange( nextValue );
		}

		return {value: nextValue};
	}

	public constructor( props: SliderProps )
	{
		super( props );
		const value = (
			( props.value != null )
			? props.value
			: (
				( props.defaultValue != null )
				? props.defaultValue
				: props.min
			)
		);
		
		this.state = {
			dragging: false,
			value: this.clampAlignValue( value ),
			toolTipDisplay: false,
			toolTipValue: this.clampAlignValue( value ),
		};
	}

	/**
	 * Render component.
	 */
	public render(
		{
			min, max, vertical, included, disabled, classesPrefix,
		}: SliderProps,
		{value, dragging}: SliderState,
	): JSX.Element
	{
		const offset = this.calcOffset( value );
		const handle = (
			<Handle
				vertical={vertical}
				disabled={disabled}
				dragging={dragging}
				min={min}
				max={max}
				value={value}
				index={1}
				offset={offset}
				classesPrefix={classesPrefix}
				ref={this.saveHandle}
				key={'handle-0'}
			/>
		);
		
		const track = (
			<Track
				vertical={vertical}
				included={included}
				index={1}
				offset={0}
				length={offset}
				classesPrefix={classesPrefix}
				key={'track-0'}
			/>
		);
		
		return this.renderBase( track, handle );
	}
	
	/**
	 * Get current value.
	 */
	protected getValue(): number
	{
		return this.state.value;
	}

	/**
	 * Get lower bound of current interval.
	 */
	protected getLowerBound(): number
	{
		// tslint:disable-next-line:no-non-null-assertion
		return this.props.min!;
	}
	
	/**
	 * Get upper bound of current interval.
	 */
	protected getUpperBound(): number
	{
		return this.state.value;
	}
	
	/**
	 * When value changed.
	 */
	protected onChange<TKey extends keyof SliderState>(
		state: Pick<SliderState, TKey>,
	): void
	{
		const props = this.props as SliderProps;
		const isControlled = ('value' in props);

		const hasValue = (
			s: Partial<SliderState>,
		): s is Pick<SliderState, 'value'> =>
			typeof s.value !== 'undefined';

		if ( isControlled && hasValue(state))
		{
			props.onChange( state.value );

			return;
		}
		this.setState( state, () => props.onChange( this.state.value ) );
	}
	
	/**
	 * On mouse/touch start.
	 */
	protected onStart( position: number ): void
	{
		this.setState( {dragging: true} );
		
		const prevValue = this.getValue();
		(this.props as SliderProps).onBeforeChange( prevValue );
		
		const value = this.calcValueByPos( position );
		
		if ( value === prevValue )
		{
			return;
		}

		this.setState({
			toolTipDisplay: true,
			toolTipValue: value,
		});
		
		this.onChange( {value} );
	}
	
	/**
	 * On mouse/touch move.
	 */
	protected onMove( position: number ): void
	{
		const value = this.calcValueByPos( position );
		const oldValue = this.state.value;
		
		if ( value === oldValue )
		{
			return;
		}

		this.setState({
			toolTipDisplay: true,
			toolTipValue: value,
		});
		
		this.onChange( {value} );
	}
	
	/**
	 * On mouse/touch move.
	 */
	protected onHover( position: number ): void
	{
		const value = this.calcValueByPos( position );
		const oldValue = this.state.value;
		
		if ( value === oldValue )
		{
			return;
		}

		this.setState({
			toolTipDisplay: true,
			toolTipValue: value,
		});

		if (this.state.dragging) {
			this.onChange( {value} );
		}
	}
	
	/**
	 * On mouse/touch end.
	 */
	protected onEnd(): void
	{
		this.setState({
			toolTipDisplay: false,
			dragging: false,
		});
	}
	
	/**
	 * Clamp current value to min-max interval on align to available values
	 * using step and marks.
	 */
	protected clampAlignValue(
		value: number,
		nextProps: Partial<SliderProps> = {},
	): number
	{
		const mergedProps = {...this.props, ...nextProps} as SliderProps;
		
		return alignValue(
			clampValue( value, mergedProps ),
			mergedProps,
		);
	}
	
}

/**
 * Module.
 */
export {
	Slider as default,
	// SliderProps,
	// SliderState,
};
