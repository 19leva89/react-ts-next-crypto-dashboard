export default function Overlay({
	showOverlay,
	onOverlayClick,
}: {
	showOverlay: boolean
	onOverlayClick: () => void
}) {
	return (
		<div
			className={`fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] dark:bg-slate-50 dark:opacity-30 z-[9960] ${showOverlay ? 'block' : 'hidden'}`}
			onClick={onOverlayClick}
		></div>
	)
}
