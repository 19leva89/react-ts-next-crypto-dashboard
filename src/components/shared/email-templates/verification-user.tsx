interface Props {
	code: string
}

export const VerificationUserTemplate = ({ code }: Props) => (
	<div>
		<p>
			Confirmation code: <h2>{code}</h2>
		</p>

		<p>
			<a
				href={`${process.env.NEXT_PUBLIC_DOMAIN_URL}${process.env.NEXT_PUBLIC_API_URL}/auth/verify?code=${code}`}
			>
				Confirm registration
			</a>
		</p>
	</div>
)
