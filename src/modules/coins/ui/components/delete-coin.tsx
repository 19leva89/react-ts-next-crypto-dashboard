import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'

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
import { useTRPC } from '@/trpc/client'
import { UserCoinData } from '@/app/api/types'

interface Props {
	coin: UserCoinData
	isOpen: boolean
	onClose: () => void
}

export const DeleteCoin = ({ coin, isOpen, onClose }: Props) => {
	const trpc = useTRPC()

	const deleteCoinMutation = useMutation(
		trpc.coins.deleteCoinFromUser.mutationOptions({
			onSuccess: () => {
				toast.success('Coin removed successfully')
				onClose()
			},
			onError: () => {
				toast.error('Failed to remove coin')
			},
		}),
	)

	const handleDelete = async () => {
		await deleteCoinMutation.mutateAsync(coin.coinId)
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
