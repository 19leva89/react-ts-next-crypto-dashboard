import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { useIsMobile } from '@/hooks/use-mobile'

// Mock media query list
const createMockMediaQueryList = (matches: boolean) => ({
	matches,
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	addListener: vi.fn(), // Deprecated but may be needed for older browsers
	removeListener: vi.fn(), // Deprecated but may be needed for older browsers
})

describe('useIsMobile', () => {
	let mockMatchMedia: ReturnType<typeof vi.fn>
	let mockMediaQueryList: ReturnType<typeof createMockMediaQueryList>
	let originalInnerWidth: number

	beforeEach(() => {
		// Store original innerWidth to restore later
		originalInnerWidth = window.innerWidth

		// Create mock media query list
		mockMediaQueryList = createMockMediaQueryList(false)

		// Mock window.matchMedia
		mockMatchMedia = vi.fn().mockReturnValue(mockMediaQueryList)
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: mockMatchMedia,
		})

		// Mock window.innerWidth (default to desktop size)
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 1024,
		})
	})

	afterEach(() => {
		vi.clearAllMocks()

		// Restore original innerWidth
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: originalInnerWidth,
		})
	})

	describe('initial state', () => {
		it('should start with undefined state and then set correct mobile state', () => {
			// Set mobile width
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 600,
			})

			const { result } = renderHook(() => useIsMobile())

			// Should return false initially (!!undefined = false)
			// Then should update to true after useEffect runs
			expect(result.current).toBe(true)
		})

		it('should initialize with desktop state correctly', () => {
			// Set desktop width
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 1024,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(result.current).toBe(false)
		})
	})

	describe('mobile breakpoint detection', () => {
		it('should return true for mobile width (< 768px)', () => {
			const mobileWidths = [320, 375, 414, 600, 767]

			mobileWidths.forEach((width) => {
				Object.defineProperty(window, 'innerWidth', {
					writable: true,
					configurable: true,
					value: width,
				})

				const { result } = renderHook(() => useIsMobile())

				expect(result.current).toBe(true)
			})
		})

		it('should return false for desktop width (>= 768px)', () => {
			const desktopWidths = [768, 769, 1024, 1280, 1440, 1920]

			desktopWidths.forEach((width) => {
				Object.defineProperty(window, 'innerWidth', {
					writable: true,
					configurable: true,
					value: width,
				})

				const { result } = renderHook(() => useIsMobile())

				expect(result.current).toBe(false)
			})
		})

		it('should handle exact breakpoint boundary (768px)', () => {
			// 768px should be considered desktop (not mobile)
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 768,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(result.current).toBe(false)
		})

		it('should handle one pixel below breakpoint (767px)', () => {
			// 767px should be considered mobile
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 767,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(result.current).toBe(true)
		})
	})

	describe('matchMedia API integration', () => {
		it('should call matchMedia with correct query string', () => {
			renderHook(() => useIsMobile())

			expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
		})

		it('should add event listener for media query changes', () => {
			renderHook(() => useIsMobile())

			expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
		})

		it('should remove event listener on cleanup', () => {
			const { unmount } = renderHook(() => useIsMobile())

			unmount()

			expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
		})

		it('should use the same function reference for add and remove listener', () => {
			const { unmount } = renderHook(() => useIsMobile())

			// Get the function passed to addEventListener
			const addedFunction = mockMediaQueryList.addEventListener.mock.calls[0][1]

			unmount()

			// Get the function passed to removeEventListener
			const removedFunction = mockMediaQueryList.removeEventListener.mock.calls[0][1]

			// Should be the same function reference
			expect(addedFunction).toBe(removedFunction)
		})
	})

	describe('responsive behavior', () => {
		it('should update state when media query change event fires', () => {
			// Start with desktop width
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 1024,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(result.current).toBe(false)

			// Simulate resize to mobile
			act(() => {
				Object.defineProperty(window, 'innerWidth', {
					writable: true,
					configurable: true,
					value: 600,
				})

				// Get the change handler function
				const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]

				// Call the change handler
				changeHandler()
			})

			expect(result.current).toBe(true)
		})

		it('should handle multiple resize events correctly', () => {
			const { result } = renderHook(() => useIsMobile())
			const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]

			// Start desktop -> mobile
			act(() => {
				Object.defineProperty(window, 'innerWidth', {
					value: 600,
				})
				changeHandler()
			})
			expect(result.current).toBe(true)

			// Mobile -> desktop
			act(() => {
				Object.defineProperty(window, 'innerWidth', {
					value: 1024,
				})
				changeHandler()
			})
			expect(result.current).toBe(false)

			// Desktop -> tablet (still desktop)
			act(() => {
				Object.defineProperty(window, 'innerWidth', {
					value: 800,
				})
				changeHandler()
			})
			expect(result.current).toBe(false)

			// Tablet -> mobile
			act(() => {
				Object.defineProperty(window, 'innerWidth', {
					value: 400,
				})
				changeHandler()
			})
			expect(result.current).toBe(true)
		})
	})

	describe('edge cases', () => {
		it('should handle very small screen widths', () => {
			Object.defineProperty(window, 'innerWidth', {
				value: 1,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(result.current).toBe(true)
		})

		it('should handle very large screen widths', () => {
			Object.defineProperty(window, 'innerWidth', {
				value: 4000,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(result.current).toBe(false)
		})

		it('should handle zero width', () => {
			Object.defineProperty(window, 'innerWidth', {
				value: 0,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(result.current).toBe(true)
		})

		it('should handle negative width (theoretical edge case)', () => {
			Object.defineProperty(window, 'innerWidth', {
				value: -100,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(result.current).toBe(true)
		})
	})

	describe('return value type coercion', () => {
		it('should coerce undefined state to boolean false', async () => {
			vi.resetModules()
			vi.doMock('react', async () => {
				const actual = await vi.importActual<typeof import('react')>('react')
				return { ...actual, useState: vi.fn().mockReturnValueOnce([undefined, vi.fn()]) }
			})

			const { useIsMobile: useIsMobilePatched } = await import('@/hooks/use-mobile')
			const { result } = renderHook(() => useIsMobilePatched())

			expect(result.current).toBe(false)
			expect(typeof result.current).toBe('boolean')

			vi.doUnmock('react')
		})

		it('should always return boolean type', () => {
			Object.defineProperty(window, 'innerWidth', {
				value: 600,
			})

			const { result } = renderHook(() => useIsMobile())

			expect(typeof result.current).toBe('boolean')
			expect(result.current === true || result.current === false).toBe(true)
		})
	})

	describe('hook lifecycle', () => {
		it('should not cause memory leaks on multiple mounts/unmounts', () => {
			const { unmount: unmount1 } = renderHook(() => useIsMobile())
			const { unmount: unmount2 } = renderHook(() => useIsMobile())
			const { unmount: unmount3 } = renderHook(() => useIsMobile())

			unmount1()
			unmount2()
			unmount3()

			// Should have called removeEventListener for each mount
			expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledTimes(3)
		})

		it('should set up fresh listeners on remount', () => {
			const { unmount } = renderHook(() => useIsMobile())

			unmount()

			// Reset mocks to verify fresh setup
			vi.clearAllMocks()
			mockMediaQueryList = createMockMediaQueryList(false)
			mockMatchMedia.mockReturnValue(mockMediaQueryList)

			renderHook(() => useIsMobile())

			expect(mockMediaQueryList.addEventListener).toHaveBeenCalledTimes(1)
		})
	})

	describe('matchMedia compatibility', () => {
		it('should handle matchMedia not being supported', () => {
			// Remove matchMedia to simulate unsupported browser
			Object.defineProperty(window, 'matchMedia', {
				value: undefined,
			})

			// Should throw error since matchMedia is required
			expect(() => {
				renderHook(() => useIsMobile())
			}).toThrow()
		})

		it('should work with matchMedia returning null (edge case)', () => {
			mockMatchMedia.mockReturnValue(null)

			// Should throw error when trying to call addEventListener on null
			expect(() => {
				renderHook(() => useIsMobile())
			}).toThrow()
		})
	})

	describe('performance considerations', () => {
		it('should only set up media query listener once per hook instance', () => {
			const { rerender } = renderHook(() => useIsMobile())

			// Rerender the hook multiple times
			rerender()
			rerender()
			rerender()

			// Should only call matchMedia and addEventListener once due to empty dependency array
			expect(mockMatchMedia).toHaveBeenCalledTimes(1)
			expect(mockMediaQueryList.addEventListener).toHaveBeenCalledTimes(1)
		})

		it('should maintain state across rerenders', () => {
			Object.defineProperty(window, 'innerWidth', {
				value: 600,
			})

			const { result, rerender } = renderHook(() => useIsMobile())

			const initialResult = result.current

			rerender()

			expect(result.current).toBe(initialResult)
			expect(result.current).toBe(true)
		})
	})
})
