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
import { useCoinActions } from '@/hooks'
import { UserCoinData } from '@/app/api/types'
import { deleteCoinFromUser } from '@/app/api/actions'

interface Props {
	coin: UserCoinData
	isOpen: boolean
	onClose: () => void
}

export const DeleteCoin = ({ coin, isOpen, onClose }: Props) => {
	const { handleAction } = useCoinActions()

	const handleDelete = async () => {
		await handleAction(
			async () => await deleteCoinFromUser(coin.coinId),
			'Coin removed successfully',
			'Failed to remove coin',
			true,
		)
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent className='rounded-xl px-8'>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete {coin.name}?</AlertDialogTitle>

					<AlertDialogDescription>
						Are you sure you want to delete this coin from your portfolio? This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className='gap-3'>
					<AlertDialogCancel className='rounded-xl'>Cancel</AlertDialogCancel>

					<AlertDialogAction onClick={handleDelete} className='rounded-xl'>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
