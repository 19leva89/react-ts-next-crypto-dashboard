'use client'

import {
	Controller,
	FormProvider,
	useFormContext,
	useFormState,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
} from 'react-hook-form'
import { Slot } from '@radix-ui/react-slot'
import * as LabelPrimitive from '@radix-ui/react-label'
import { ComponentProps, createContext, useContext, useId } from 'react'

import { cn } from '@/lib'
import { Label } from '@/components/ui'

const Form = FormProvider

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName
}

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	)
}

const useFormField = () => {
	const fieldContext = useContext(FormFieldContext)
	const itemContext = useContext(FormItemContext)
	const { getFieldState } = useFormContext()
	const formState = useFormState({ name: fieldContext.name })
	const fieldState = getFieldState(fieldContext.name, formState)

	if (!fieldContext) {
		throw new Error('useFormField should be used within <FormField>')
	}

	const { id } = itemContext

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	}
}

type FormItemContextValue = {
	id: string
}

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue)

/**
 * Form item wrapper component that provides context for form field elements
 * Handles unique ID generation and context sharing for accessibility connections
 * @param props - Form item component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to div element
 * @returns JSX element with form item context provider and grid layout
 */
function FormItem({ className, ...props }: ComponentProps<'div'>) {
	const id = useId()

	return (
		<FormItemContext.Provider value={{ id }}>
			<div data-slot='form-item' className={cn('grid gap-2', className)} {...props} />
		</FormItemContext.Provider>
	)
}

/**
 * Form label component with error state styling and accessibility attributes
 * Handles label presentation with automatic error styling and form field association
 * @param props - Form label component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to LabelPrimitive.Root
 * @returns JSX element with accessible form label and error state styling
 */
function FormLabel({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
	const { error, formItemId } = useFormField()

	return (
		<Label
			data-slot='form-label'
			data-error={!!error}
			className={cn('data-[error=true]:text-destructive', className)}
			htmlFor={formItemId}
			{...props}
		/>
	)
}

/**
 * Form control component that wraps form inputs with accessibility attributes
 * Handles ARIA attributes for form validation and description associations
 * @param props - Form control component props
 * @param props....props - All other props forwarded to Slot component
 * @returns JSX element with form control wrapper and accessibility attributes
 */
function FormControl({ ...props }: ComponentProps<typeof Slot>) {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

	return (
		<Slot
			data-slot='form-control'
			id={formItemId}
			aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
			aria-invalid={!!error}
			{...props}
		/>
	)
}

/**
 * Form description component for providing helpful text about form fields
 * Handles descriptive text with proper ID association for screen readers
 * @param props - Form description component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to p element
 * @returns JSX element with form field description text
 */
function FormDescription({ className, ...props }: ComponentProps<'p'>) {
	const { formDescriptionId } = useFormField()

	return (
		<p
			data-slot='form-description'
			id={formDescriptionId}
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	)
}

/**
 * Form message component for displaying validation errors and feedback
 * Handles error message display with automatic error text extraction and styling
 * @param props - Form message component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to p element
 * @returns JSX element with form validation message or null if no message
 */
function FormMessage({ className, ...props }: ComponentProps<'p'>) {
	const { error, formMessageId } = useFormField()
	const body = error ? String(error?.message ?? '') : props.children

	if (!body) {
		return null
	}

	return (
		<p
			data-slot='form-message'
			id={formMessageId}
			className={cn('text-sm text-destructive', className)}
			{...props}
		>
			{body}
		</p>
	)
}

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
