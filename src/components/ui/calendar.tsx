'use client'

import {
	Dispatch,
	HTMLAttributes,
	ReactNode,
	SetStateAction,
	TableHTMLAttributes,
	useCallback,
	useMemo,
	useState,
} from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { DayPicker, labelNext, labelPrevious, useDayPicker, type DayPickerProps } from 'react-day-picker'

import { cn } from '@/lib'
import { Button, buttonVariants } from '@/components/ui'

export type CalendarProps = DayPickerProps & {
	/**
	 * In the year view, the number of years to display at once.
	 * @default 12
	 */
	yearRange?: number

	/**
	 * Wether to show the year switcher in the caption.
	 * @default true
	 */
	showYearSwitcher?: boolean

	monthsClassName?: string
	monthCaptionClassName?: string
	weekdaysClassName?: string
	weekdayClassName?: string
	monthClassName?: string
	captionClassName?: string
	captionLabelClassName?: string
	buttonNextClassName?: string
	buttonPreviousClassName?: string
	navClassName?: string
	monthGridClassName?: string
	weekClassName?: string
	dayClassName?: string
	dayButtonClassName?: string
	rangeStartClassName?: string
	rangeEndClassName?: string
	selectedClassName?: string
	todayClassName?: string
	outsideClassName?: string
	disabledClassName?: string
	rangeMiddleClassName?: string
	hiddenClassName?: string
}

type NavView = 'days' | 'years'

/**
 * Calendar component with advanced navigation including year switching and month/year views
 * Built on top of react-day-picker with custom styling and enhanced functionality
 * @param props - Component props including styling, navigation, and display options
 * @param props.className - Additional CSS classes to merge with calendar styling
 * @param props.showOutsideDays - Whether to show days from adjacent months
 * @param props.showYearSwitcher - Whether to enable year switching functionality
 * @param props.yearRange - Number of years to display in year picker mode
 * @param props.numberOfMonths - Number of months to display simultaneously
 * @returns JSX element with fully-featured calendar component
 */
function Calendar({
	className,
	showOutsideDays = true,
	showYearSwitcher = true,
	yearRange = 12,
	numberOfMonths,
	...props
}: CalendarProps) {
	const [navView, setNavView] = useState<NavView>('days')
	const [displayYears, setDisplayYears] = useState<{
		from: number
		to: number
	}>(
		useMemo(() => {
			const currentYear = new Date().getFullYear()
			return {
				from: currentYear - Math.floor(yearRange / 2 - 1),
				to: currentYear + Math.ceil(yearRange / 2),
			}
		}, [yearRange]),
	)

	const { onPrevClick, startMonth, endMonth } = props

	const columnsDisplayed = navView === 'years' ? 1 : numberOfMonths

	const _monthsClassName = cn('relative flex', props.monthsClassName)
	const _monthCaptionClassName = cn(
		'relative mx-10 flex h-7 items-center justify-center',
		props.monthCaptionClassName,
	)
	const _weekdaysClassName = cn('flex flex-row', props.weekdaysClassName)
	const _weekdayClassName = cn('w-8 text-sm font-normal text-muted-foreground', props.weekdayClassName)
	const _monthClassName = cn('w-full', props.monthClassName)
	const _captionClassName = cn('relative flex items-center justify-center pt-1', props.captionClassName)
	const _captionLabelClassName = cn('truncate text-sm font-medium', props.captionLabelClassName)
	const buttonNavClassName = buttonVariants({
		variant: 'outline',
		className: 'absolute size-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-xl',
	})
	const _buttonNextClassName = cn(buttonNavClassName, 'right-0', props.buttonNextClassName)
	const _buttonPreviousClassName = cn(buttonNavClassName, 'left-0', props.buttonPreviousClassName)
	const _navClassName = cn('flex items-start', props.navClassName)
	const _monthGridClassName = cn('mx-auto mt-4', props.monthGridClassName)
	const _weekClassName = cn('mt-2 flex w-max items-start', props.weekClassName)
	const _dayClassName = cn('flex size-8 flex-1 items-center justify-center p-0 text-sm', props.dayClassName)
	const _dayButtonClassName = cn(
		buttonVariants({ variant: 'ghost' }),
		'size-8 rounded-xl p-0 font-normal transition-none aria-selected:opacity-100',
		props.dayButtonClassName,
	)
	const buttonRangeClassName =
		'bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground hover:[&>button]:bg-primary hover:[&>button]:text-primary-foreground'
	const _rangeStartClassName = cn(
		buttonRangeClassName,
		'day-range-start rounded-s-xl',
		props.rangeStartClassName,
	)
	const _rangeEndClassName = cn(buttonRangeClassName, 'day-range-end rounded-e-xl', props.rangeEndClassName)
	const _rangeMiddleClassName = cn(
		'bg-accent text-foreground! [&>button]:bg-transparent [&>button]:text-foreground! hover:[&>button]:bg-transparent hover:[&>button]:text-foreground!',
		props.rangeMiddleClassName,
	)
	const _selectedClassName = cn(
		'[&>button]:rounded-xl [&>button]:bg-primary [&>button]:text-primary-foreground hover:[&>button]:bg-primary hover:[&>button]:text-primary-foreground',
		props.selectedClassName,
	)
	const _todayClassName = cn(
		'[&>button]:rounded-xl [&>button]:bg-accent [&>button]:text-accent-foreground',
		props.todayClassName,
	)
	const _outsideClassName = cn(
		'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
		props.outsideClassName,
	)
	const _disabledClassName = cn('text-muted-foreground opacity-50', props.disabledClassName)
	const _hiddenClassName = cn('invisible flex-1', props.hiddenClassName)

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn('p-3', className)}
			style={{
				width: 248.8 * (columnsDisplayed ?? 1) + 'px',
			}}
			classNames={{
				months: _monthsClassName,
				month_caption: _monthCaptionClassName,
				weekdays: _weekdaysClassName,
				weekday: _weekdayClassName,
				month: _monthClassName,
				caption: _captionClassName,
				caption_label: _captionLabelClassName,
				button_next: _buttonNextClassName,
				button_previous: _buttonPreviousClassName,
				nav: _navClassName,
				month_grid: _monthGridClassName,
				week: _weekClassName,
				day: _dayClassName,
				day_button: _dayButtonClassName,
				range_start: _rangeStartClassName,
				range_middle: _rangeMiddleClassName,
				range_end: _rangeEndClassName,
				selected: _selectedClassName,
				today: _todayClassName,
				outside: _outsideClassName,
				disabled: _disabledClassName,
				hidden: _hiddenClassName,
			}}
			components={{
				Chevron: ({ orientation }) => {
					const Icon = orientation === 'left' ? ChevronLeftIcon : ChevronRightIcon
					return <Icon className='size-4' />
				},
				Nav: ({ className }) => (
					<Nav
						className={className}
						displayYears={displayYears}
						navView={navView}
						setDisplayYears={setDisplayYears}
						startMonth={startMonth}
						endMonth={endMonth}
						onPrevClick={onPrevClick}
					/>
				),
				CaptionLabel: (props) => (
					<CaptionLabel
						showYearSwitcher={showYearSwitcher}
						navView={navView}
						setNavView={setNavView}
						displayYears={displayYears}
						{...props}
					/>
				),
				MonthGrid: ({ className, children, ...props }) => (
					<MonthGrid
						className={className}
						displayYears={displayYears}
						startMonth={startMonth}
						endMonth={endMonth}
						navView={navView}
						setNavView={setNavView}
						{...props}
					>
						{children}
					</MonthGrid>
				),
			}}
			numberOfMonths={columnsDisplayed}
			{...props}
		/>
	)
}
Calendar.displayName = 'Calendar'

/**
 * Navigation component for calendar with support for month and year navigation
 * Handles navigation between months/years with proper boundary checking
 * @param props - Navigation component props
 * @param props.className - Additional CSS classes for styling
 * @param props.navView - Current navigation view (days or years)
 * @param props.startMonth - Minimum selectable month boundary
 * @param props.endMonth - Maximum selectable month boundary
 * @param props.displayYears - Range of years currently displayed
 * @param props.displayYears.from - Starting year of displayed year range
 * @param props.displayYears.to - Ending year of displayed year range
 * @param props.setDisplayYears - Function to update displayed year range
 * @param props.onPrevClick - Callback for previous navigation click
 * @param props.onNextClick - Callback for next navigation click
 * @returns JSX element with navigation controls
 */
function Nav({
	className,
	navView,
	startMonth,
	endMonth,
	displayYears,
	setDisplayYears,
	onPrevClick,
	onNextClick,
}: {
	className?: string
	navView: NavView
	startMonth?: Date
	endMonth?: Date
	displayYears: { from: number; to: number }
	setDisplayYears: Dispatch<SetStateAction<{ from: number; to: number }>>
	onPrevClick?: (date: Date) => void
	onNextClick?: (date: Date) => void
}) {
	const { nextMonth, previousMonth, goToMonth } = useDayPicker()

	const isPreviousDisabled = (() => {
		if (navView === 'years') {
			return (
				(startMonth && differenceInCalendarDays(new Date(displayYears.from - 1, 0, 1), startMonth) < 0) ||
				(endMonth && differenceInCalendarDays(new Date(displayYears.from - 1, 0, 1), endMonth) > 0)
			)
		}
		return !previousMonth
	})()

	const isNextDisabled = (() => {
		if (navView === 'years') {
			return (
				(startMonth && differenceInCalendarDays(new Date(displayYears.to + 1, 0, 1), startMonth) < 0) ||
				(endMonth && differenceInCalendarDays(new Date(displayYears.to + 1, 0, 1), endMonth) > 0)
			)
		}
		return !nextMonth
	})()

	const handlePreviousClick = useCallback(() => {
		if (!previousMonth) return
		if (navView === 'years') {
			setDisplayYears((prev) => ({
				from: prev.from - (prev.to - prev.from + 1),
				to: prev.to - (prev.to - prev.from + 1),
			}))
			onPrevClick?.(new Date(displayYears.from - (displayYears.to - displayYears.from), 0, 1))
			return
		}
		goToMonth(previousMonth)
		onPrevClick?.(previousMonth)
	}, [previousMonth, goToMonth, navView, displayYears.from, displayYears.to, onPrevClick, setDisplayYears])

	const handleNextClick = useCallback(() => {
		if (!nextMonth) return
		if (navView === 'years') {
			setDisplayYears((prev) => ({
				from: prev.from + (prev.to - prev.from + 1),
				to: prev.to + (prev.to - prev.from + 1),
			}))
			onNextClick?.(new Date(displayYears.from + (displayYears.to - displayYears.from), 0, 1))
			return
		}
		goToMonth(nextMonth)
		onNextClick?.(nextMonth)
	}, [nextMonth, goToMonth, navView, displayYears.from, displayYears.to, onNextClick, setDisplayYears])
	return (
		<nav className={cn('flex items-center', className)}>
			<Button
				variant='outline'
				type='button'
				tabIndex={isPreviousDisabled ? undefined : -1}
				disabled={isPreviousDisabled}
				aria-label={
					navView === 'years'
						? `Go to the previous ${displayYears.to - displayYears.from + 1} years`
						: labelPrevious(previousMonth)
				}
				onClick={handlePreviousClick}
				className='absolute left-0 size-7 rounded-xl bg-transparent p-0 opacity-80 hover:opacity-100'
			>
				<ChevronLeftIcon className='size-4' />
			</Button>

			<Button
				variant='outline'
				type='button'
				tabIndex={isNextDisabled ? undefined : -1}
				disabled={isNextDisabled}
				aria-label={
					navView === 'years'
						? `Go to the next ${displayYears.to - displayYears.from + 1} years`
						: labelNext(nextMonth)
				}
				onClick={handleNextClick}
				className='absolute right-0 size-7 rounded-xl bg-transparent p-0 opacity-80 hover:opacity-100'
			>
				<ChevronRightIcon className='size-4' />
			</Button>
		</nav>
	)
}

/**
 * Caption label component that displays current month/year and enables view switching
 * Shows month name in days view, year range in years view
 * @param props - Caption label props
 * @param props.children - Month/year text content to display
 * @param props.showYearSwitcher - Whether year switching is enabled
 * @param props.navView - Current navigation view mode
 * @param props.setNavView - Function to toggle between days and years view
 * @param props.displayYears - Current year range being displayed
 * @returns JSX element with clickable caption label or plain span
 */
function CaptionLabel({
	children,
	showYearSwitcher,
	navView,
	setNavView,
	displayYears,
	...props
}: {
	showYearSwitcher?: boolean
	navView: NavView
	setNavView: Dispatch<SetStateAction<NavView>>
	displayYears: { from: number; to: number }
} & HTMLAttributes<HTMLSpanElement>) {
	if (!showYearSwitcher) return <span {...props}>{children}</span>
	return (
		<Button
			variant='ghost'
			size='sm'
			onClick={() => setNavView((prev) => (prev === 'days' ? 'years' : 'days'))}
			className='h-7 w-full truncate rounded-xl text-sm font-medium'
		>
			{navView === 'days' ? children : displayYears.from + ' - ' + displayYears.to}
		</Button>
	)
}

/**
 * Month grid component that renders either calendar days or year selection grid
 * Switches between table layout for days and grid layout for years
 * @param props - Month grid props
 * @param props.className - Additional CSS classes for styling
 * @param props.children - Child elements to render (calendar days)
 * @param props.displayYears - Range of years for year selection mode
 * @param props.startMonth - Minimum selectable month boundary
 * @param props.endMonth - Maximum selectable month boundary
 * @param props.navView - Current navigation view (days or years)
 * @param props.setNavView - Function to change navigation view
 * @returns JSX element with either table for days or YearGrid for years
 */
function MonthGrid({
	className,
	children,
	displayYears,
	startMonth,
	endMonth,
	navView,
	setNavView,
	...props
}: {
	className?: string
	children: ReactNode
	displayYears: { from: number; to: number }
	startMonth?: Date
	endMonth?: Date
	navView: NavView
	setNavView: Dispatch<SetStateAction<NavView>>
} & TableHTMLAttributes<HTMLTableElement>) {
	if (navView === 'years') {
		return (
			<YearGrid
				displayYears={displayYears}
				startMonth={startMonth}
				endMonth={endMonth}
				setNavView={setNavView}
				navView={navView}
				className={className}
				{...props}
			/>
		)
	}
	return (
		<table className={className} {...props}>
			{children}
		</table>
	)
}

/**
 * Year grid component that displays selectable years in a 4-column grid layout
 * Handles year selection with boundary validation and current year highlighting
 * @param props - Year grid props
 * @param props.className - Additional CSS classes for styling
 * @param props.displayYears - Range of years to display in the grid
 * @param props.startMonth - Minimum selectable date boundary
 * @param props.endMonth - Maximum selectable date boundary
 * @param props.setNavView - Function to switch back to days view after year selection
 * @param props.navView - Current navigation view mode
 * @returns JSX element with grid of selectable year buttons
 */
function YearGrid({
	className,
	displayYears,
	startMonth,
	endMonth,
	setNavView,
	navView,
	...props
}: {
	className?: string
	displayYears: { from: number; to: number }
	startMonth?: Date
	endMonth?: Date
	setNavView: Dispatch<SetStateAction<NavView>>
	navView: NavView
} & HTMLAttributes<HTMLDivElement>) {
	const { goToMonth, selected } = useDayPicker()

	return (
		<div className={cn('grid grid-cols-4 gap-y-2', className)} {...props}>
			{Array.from({ length: displayYears.to - displayYears.from + 1 }, (_, i) => {
				const isBefore = differenceInCalendarDays(new Date(displayYears.from + i, 11, 31), startMonth!) < 0

				const isAfter = differenceInCalendarDays(new Date(displayYears.from + i, 0, 0), endMonth!) > 0

				const isDisabled = isBefore || isAfter
				return (
					<Button
						key={i}
						variant='ghost'
						onClick={() => {
							setNavView('days')
							goToMonth(new Date(displayYears.from + i, (selected as Date | undefined)?.getMonth() ?? 0))
						}}
						disabled={navView === 'years' ? isDisabled : undefined}
						className={cn(
							'h-7 w-full rounded-xl text-sm font-normal text-foreground',
							displayYears.from + i === new Date().getFullYear() &&
								'bg-accent font-medium text-accent-foreground',
						)}
					>
						{displayYears.from + i}
					</Button>
				)
			})}
		</div>
	)
}

export { Calendar }
