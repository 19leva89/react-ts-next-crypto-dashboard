/* eslint-disable @next/next/no-img-element */
import { absoluteUrl, formatValue } from '@/lib'

interface Props {
	coins: {
		name: string
		image: string
		currentPrice: number
		desiredPrice: number
	}[]
}

export const NotificationPriceTemplate = ({ coins }: Props) => {
	return (
		<div>
			<h1>🎯 Target price reached!</h1>

			<p>The following coins have reached or exceeded your desired price:</p>

			<ul style={{ paddingLeft: 0, listStyleType: 'none' }}>
				{coins.map((coin, i) => (
					<li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
						<img
							src={coin.image}
							alt={coin.name}
							width='18'
							height='18'
							style={{ marginRight: '8px', borderRadius: '50%' }}
						/>

						<span>
							<strong>{coin.name}</strong>: ${formatValue(coin.currentPrice, true)} (Target: $
							{formatValue(coin.desiredPrice, true)})
						</span>
					</li>
				))}
			</ul>

			<hr style={{ margin: '24px 0' }} />

			<p style={{ fontSize: '14px', color: '#666' }}>
				Check your{' '}
				<a href={absoluteUrl('/coins')} target='_blank' rel='noopener noreferrer'>
					crypto portfolio
				</a>{' '}
				- it may be time to take profits 💰
			</p>
		</div>
	)
}
