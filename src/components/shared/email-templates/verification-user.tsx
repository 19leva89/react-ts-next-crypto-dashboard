import { absoluteUrl } from '@/lib'

interface Props {
	token: string
}

export const VerificationUserTemplate = ({ token }: Props) => (
	<div>
		<p>
			Click <a href={absoluteUrl(`/auth/new-verification?token=${token}`)}>here</a> to confirm your email.
		</p>
	</div>
)
