import { Trash } from 'lucide-react'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
} from '@/components/ui'

interface Props {
	transactionId: string
	onDelete: (id: string) => void
}

export const DeleteTransaction = ({ transactionId, onDelete }: Props) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="hover:bg-red-100 dark:hover:bg-red-900 transition-colors ease-in-out duration-300"
				>
					<Trash className="h-4 w-4 text-red-600 dark:text-red-400" />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="px-8 rounded-xl">
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Transaction?</AlertDialogTitle>

					<AlertDialogDescription>
						This action cannot be undone. Are you sure you want to delete this transaction?
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="gap-2">
					<AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>

					<AlertDialogAction onClick={() => onDelete(transactionId)} className="rounded-xl">
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
