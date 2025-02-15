import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui'
import { CryptoData } from './crypto-card'

interface Props {
	coin: CryptoData
	isOpen: boolean
	onClose: () => void
	onDelete: () => void
}

export const DeleteDialog = ({ coin, isOpen, onClose, onDelete }: Props) => (
	<Dialog open={isOpen} onOpenChange={onClose}>
		<DialogContent className="px-8 rounded-xl">
			<DialogHeader>
				<DialogTitle>Delete {coin.name}</DialogTitle>

				<DialogDescription>Are you sure you want to delete this coin from your portfolio?</DialogDescription>
			</DialogHeader>

			<DialogFooter className="gap-4">
				<Button variant="outline" onClick={() => onClose()} className="rounded-xl">
					Cancel
				</Button>

				<Button onClick={onDelete} variant="destructive" className="rounded-xl">
					Delete
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
)
