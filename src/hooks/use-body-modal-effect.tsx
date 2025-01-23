import { useEffect } from 'react'

export const useBodyModalEffect = (dependencies: any[], condition: boolean) => {
	useEffect(() => {
		const bodyEl = document.querySelector('body')
		if (condition) {
			bodyEl?.classList.add('overflow-hidden')
		} else {
			bodyEl?.classList.remove('overflow-hidden')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...dependencies])
}
