import { absoluteUrl } from '@/lib'

interface Props {
	token: string
}

export const VerificationUserTemplate = ({ token }: Props) => (
	<div>
		<p>
			Confirmation code: <h2>{token}</h2>
		</p>

		<p>
			<a href={absoluteUrl(`/api/auth/verify?token=${token}`)}>Confirm registration</a>
		</p>
	</div>
)
