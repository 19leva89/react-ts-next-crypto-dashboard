import { InfoBlock } from '@/components/shared/info-block'

export default function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center mt-40">
			<InfoBlock
				title="Page not found"
				text="Please check the address entered is correct or try again later"
				imageUrl="/img/not-found.png"
			/>
		</div>
	)
}
