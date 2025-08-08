import { absoluteUrl } from '@/lib'

interface Props {
	code: string
}

export const VerificationUserTemplate = ({ code }: Props) => (
	<div>
		<p>
			Confirmation code: <h2>{code}</h2>
		</p>

		<p>
			<a href={absoluteUrl(`/api/auth/verify?code=${code}`)}>Confirm registration</a>
		</p>
	</div>
)
