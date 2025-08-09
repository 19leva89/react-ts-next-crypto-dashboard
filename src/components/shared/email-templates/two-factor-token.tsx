interface Props {
	token: string
}

export const TwoFactorTokenTemplate = ({ token }: Props) => (
	<div>
		<p>
			Your 2FA code: <h2>{token}</h2>
		</p>
	</div>
)
