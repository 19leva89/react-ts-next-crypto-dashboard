import { absoluteUrl } from '@/lib'

interface Props {
	coins: {
		name: string
		image: string
		currentPrice: number
		desiredPrice: number
	}[]
}

export const NotificationTemplate = ({ coins }: Props) => {
	return (
		<div>
			<h1>🎯 Target price reached!</h1>

			<p>The following coins have reached or exceeded your desired price:</p>

			<ul style={{ paddingLeft: 0, listStyleType: 'none' }}>
				{coins.map((coin, index) => (
					<li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
						<img
							src={coin.image}
							alt={coin.name}
							width='18'
							height='18'
							style={{ marginRight: '8px', borderRadius: '50%' }}
						/>

						<span>
							<strong>{coin.name}</strong>: ${coin.currentPrice.toFixed(2)} (Target: $
							{coin.desiredPrice.toFixed(2)})
						</span>
					</li>
				))}
			</ul>

			<hr style={{ margin: '24px 0' }} />

			<p style={{ fontSize: '14px', color: '#666' }}>
				Check your{' '}
				<a href={absoluteUrl('/')} target='_blank' rel='noopener noreferrer'>
					crypto portfolio
				</a>{' '}
				- it may be time to take profits 💰
			</p>
		</div>
	)
}
