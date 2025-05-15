interface Props {
	coins: {
		name: string
		currentPrice: number
		desiredPrice: number
	}[]
}

export const NotificationTemplate = ({ coins }: Props) => {
	return (
		<div>
			<h1>🎯 Target price reached!</h1>

			<p>The following coins have reached or exceeded your desired price:</p>

			<ul>
				{coins.map((coin, index) => (
					<li key={index}>
						<strong>{coin.name}</strong>: ${coin.currentPrice.toFixed(2)} (Target: $
						{coin.desiredPrice.toFixed(2)})
					</li>
				))}
			</ul>

			<p>Check your portfolio - it may be time to take profits 💰</p>
		</div>
	)
}
