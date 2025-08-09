import { absoluteUrl } from '@/lib'

interface Props {
	token: string
}

export const PasswordResetTemplate = ({ token }: Props) => (
	<div>
		<p>
			Click <a href={absoluteUrl(`/auth/new-password?token=${token}`)}>here</a> to reset your password.
		</p>
	</div>
)
