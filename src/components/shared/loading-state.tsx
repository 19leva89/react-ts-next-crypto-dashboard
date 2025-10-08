import { Spinner } from '@/components/ui'

interface Props {
	title: string
	description: string
}

export const LoadingState = ({ title, description }: Props) => {
	return (
		<div className='flex flex-1 items-center justify-center px-8 py-4'>
			<div className='flex flex-col items-center justify-center gap-6 p-10'>
				<Spinner className='size-6' />

				<div className='flex flex-col gap-2 text-center'>
					<h6 className='text-lg font-medium'>{title}</h6>

					<p className='text-sm'>{description}</p>
				</div>
			</div>
		</div>
	)
}
