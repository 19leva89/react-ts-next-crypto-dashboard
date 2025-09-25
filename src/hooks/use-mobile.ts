import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Custom hook for detecting mobile screen size with responsive breakpoint monitoring
 * Tracks viewport width changes and determines mobile state based on MOBILE_BREAKPOINT constant
 * Uses matchMedia API for efficient media query listening and automatic cleanup
 * @returns Boolean indicating whether current viewport is mobile size (true) or desktop/tablet (false)
 */
export function useIsMobile() {
	const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
		}

		mql.addEventListener('change', onChange)

		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

		return () => mql.removeEventListener('change', onChange)
	}, [])

	return !!isMobile
}
