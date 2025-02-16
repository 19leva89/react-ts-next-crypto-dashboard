import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui'
import { CryptoData } from './crypto-card'

interface Props {
	coin: CryptoData
	isOpen: boolean
	onClose: () => void
	onDelete: () => void
}

export const DeleteCrypto = ({ coin, isOpen, onClose, onDelete }: Props) => (
	<AlertDialog open={isOpen} onOpenChange={onClose}>
		<AlertDialogContent className="px-8 rounded-xl">
			<AlertDialogHeader>
				<AlertDialogTitle>Delete {coin.name}?</AlertDialogTitle>

				<AlertDialogDescription>
					Are you sure you want to delete this coin from your portfolio? This action cannot be undone.
				</AlertDialogDescription>
			</AlertDialogHeader>

			<AlertDialogFooter className="gap-2">
				<AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>

				<AlertDialogAction onClick={onDelete} className="rounded-xl">
					Delete
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
)
