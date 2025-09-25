import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { useMetaColor, META_THEME_COLORS } from '@/hooks/use-meta-color'

// Mock next-themes
const mockUseTheme = vi.fn()
vi.mock('next-themes', () => ({
	useTheme: () => mockUseTheme(),
}))

// Mock DOM methods
const mockSetAttribute = vi.fn()
const mockQuerySelector = vi.fn()

describe('useMetaColor', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Setup DOM mocks
		mockQuerySelector.mockReturnValue({
			setAttribute: mockSetAttribute,
		})

		// Mock document.querySelector
		Object.defineProperty(document, 'querySelector', {
			value: mockQuerySelector,
			writable: true,
		})

		// Default theme mock setup
		mockUseTheme.mockReturnValue({
			resolvedTheme: 'light',
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('META_THEME_COLORS constants', () => {
		it('should have correct color values', () => {
			expect(META_THEME_COLORS.light).toBe('#ffffff')
			expect(META_THEME_COLORS.dark).toBe('#09090b')
		})
	})

	describe('metaColor computation', () => {
		it('should return light color for light theme', () => {
			mockUseTheme.mockReturnValue({
				resolvedTheme: 'light',
			})

			const { result } = renderHook(() => useMetaColor())

			expect(result.current.metaColor).toBe(META_THEME_COLORS.light)
			expect(result.current.metaColor).toBe('#ffffff')
		})

		it('should return dark color for dark theme', () => {
			mockUseTheme.mockReturnValue({
				resolvedTheme: 'dark',
			})

			const { result } = renderHook(() => useMetaColor())

			expect(result.current.metaColor).toBe(META_THEME_COLORS.dark)
			expect(result.current.metaColor).toBe('#09090b')
		})

		it('should return light color for undefined theme', () => {
			mockUseTheme.mockReturnValue({
				resolvedTheme: undefined,
			})

			const { result } = renderHook(() => useMetaColor())

			expect(result.current.metaColor).toBe(META_THEME_COLORS.light)
		})

		it('should return light color for system theme (not dark)', () => {
			mockUseTheme.mockReturnValue({
				resolvedTheme: 'system',
			})

			const { result } = renderHook(() => useMetaColor())

			expect(result.current.metaColor).toBe(META_THEME_COLORS.light)
		})

		it('should return light color for any non-dark theme', () => {
			const nonDarkThemes = ['light', 'auto', 'system', 'custom', null, undefined]

			nonDarkThemes.forEach((theme) => {
				mockUseTheme.mockReturnValue({
					resolvedTheme: theme,
				})

				const { result } = renderHook(() => useMetaColor())

				expect(result.current.metaColor).toBe(META_THEME_COLORS.light)
			})
		})
	})

	describe('setMetaColor function', () => {
		it('should call querySelector with correct selector', () => {
			const { result } = renderHook(() => useMetaColor())

			result.current.setMetaColor('#ff0000')

			expect(mockQuerySelector).toHaveBeenCalledWith('meta[name="theme-color"]')
		})

		it('should set attribute on meta tag when element exists', () => {
			const { result } = renderHook(() => useMetaColor())
			const testColor = '#ff0000'

			result.current.setMetaColor(testColor)

			expect(mockSetAttribute).toHaveBeenCalledWith('content', testColor)
		})

		it('should handle case when meta tag does not exist', () => {
			mockQuerySelector.mockReturnValue(null)

			const { result } = renderHook(() => useMetaColor())

			// Should not throw error when meta tag doesn't exist
			expect(() => {
				result.current.setMetaColor('#ff0000')
			}).not.toThrow()

			expect(mockSetAttribute).not.toHaveBeenCalled()
		})

		it('should work with different color formats', () => {
			const { result } = renderHook(() => useMetaColor())
			const testColors = [
				'#ffffff',
				'#000',
				'rgb(255, 255, 255)',
				'rgba(0, 0, 0, 0.5)',
				'hsl(0, 0%, 100%)',
				'red',
			]

			testColors.forEach((color) => {
				result.current.setMetaColor(color)
				expect(mockSetAttribute).toHaveBeenLastCalledWith('content', color)
			})

			expect(mockSetAttribute).toHaveBeenCalledTimes(testColors.length)
		})
	})

	describe('memoization behavior', () => {
		it('should memoize metaColor when theme does not change', () => {
			mockUseTheme.mockReturnValue({
				resolvedTheme: 'light',
			})

			const { result, rerender } = renderHook(() => useMetaColor())
			const firstMetaColor = result.current.metaColor

			rerender()

			const secondMetaColor = result.current.metaColor

			// Should return the same reference due to useMemo
			expect(firstMetaColor).toBe(secondMetaColor)
			expect(firstMetaColor).toBe(META_THEME_COLORS.light)
		})

		it('should update metaColor when theme changes', () => {
			// Start with light theme
			mockUseTheme.mockReturnValue({
				resolvedTheme: 'light',
			})

			const { result, rerender } = renderHook(() => useMetaColor())
			const lightColor = result.current.metaColor

			expect(lightColor).toBe(META_THEME_COLORS.light)

			// Change to dark theme
			mockUseTheme.mockReturnValue({
				resolvedTheme: 'dark',
			})

			rerender()

			const darkColor = result.current.metaColor

			expect(darkColor).toBe(META_THEME_COLORS.dark)
			expect(lightColor).not.toBe(darkColor)
		})

		it('should maintain setMetaColor function reference stability', () => {
			const { result, rerender } = renderHook(() => useMetaColor())
			const firstSetMetaColor = result.current.setMetaColor

			rerender()

			const secondSetMetaColor = result.current.setMetaColor

			// Should be the same reference due to useCallback
			expect(firstSetMetaColor).toBe(secondSetMetaColor)
		})
	})

	describe('integration behavior', () => {
		it('should provide both metaColor and setMetaColor functions', () => {
			const { result } = renderHook(() => useMetaColor())

			expect(result.current).toHaveProperty('metaColor')
			expect(result.current).toHaveProperty('setMetaColor')
			expect(typeof result.current.metaColor).toBe('string')
			expect(typeof result.current.setMetaColor).toBe('function')
		})

		it('should work with theme switching workflow', () => {
			// Start with light theme
			mockUseTheme.mockReturnValue({
				resolvedTheme: 'light',
			})

			const { result, rerender } = renderHook(() => useMetaColor())

			// Should get light color initially
			expect(result.current.metaColor).toBe(META_THEME_COLORS.light)

			// Set a custom color using setMetaColor
			result.current.setMetaColor(result.current.metaColor)
			expect(mockSetAttribute).toHaveBeenCalledWith('content', META_THEME_COLORS.light)

			// Switch to dark theme
			mockUseTheme.mockReturnValue({
				resolvedTheme: 'dark',
			})

			rerender()

			// Should get dark color after theme change
			expect(result.current.metaColor).toBe(META_THEME_COLORS.dark)

			// Set the new dark color
			result.current.setMetaColor(result.current.metaColor)
			expect(mockSetAttribute).toHaveBeenLastCalledWith('content', META_THEME_COLORS.dark)
		})
	})

	describe('edge cases', () => {
		it('should handle empty string color', () => {
			const { result } = renderHook(() => useMetaColor())

			result.current.setMetaColor('')

			expect(mockSetAttribute).toHaveBeenCalledWith('content', '')
		})

		it('should handle multiple consecutive setMetaColor calls', () => {
			const { result } = renderHook(() => useMetaColor())
			const colors = ['#ff0000', '#00ff00', '#0000ff']

			colors.forEach((color) => {
				result.current.setMetaColor(color)
			})

			expect(mockSetAttribute).toHaveBeenCalledTimes(colors.length)
			expect(mockSetAttribute).toHaveBeenLastCalledWith('content', '#0000ff')
		})

		it('should handle case when querySelector throws error', () => {
			mockQuerySelector.mockImplementation(() => {
				throw new Error('DOM error')
			})

			const { result } = renderHook(() => useMetaColor())

			// Should throw error when DOM operation fails
			expect(() => {
				result.current.setMetaColor('#ff0000')
			}).toThrow('DOM error')
		})

		it('should handle case when setAttribute throws error', () => {
			mockSetAttribute.mockImplementation(() => {
				throw new Error('setAttribute error')
			})

			const { result } = renderHook(() => useMetaColor())

			// Should throw error when setAttribute fails
			expect(() => {
				result.current.setMetaColor('#ff0000')
			}).toThrow('setAttribute error')
		})
	})

	describe('theme dependency', () => {
		it('should re-compute metaColor when resolvedTheme changes', () => {
			let currentTheme = 'light'
			mockUseTheme.mockImplementation(() => ({
				resolvedTheme: currentTheme,
			}))

			const { result, rerender } = renderHook(() => useMetaColor())

			// Initial state - light theme
			expect(result.current.metaColor).toBe(META_THEME_COLORS.light)

			// Change theme to dark
			currentTheme = 'dark'
			rerender()

			expect(result.current.metaColor).toBe(META_THEME_COLORS.dark)

			// Change back to light
			currentTheme = 'light'
			rerender()

			expect(result.current.metaColor).toBe(META_THEME_COLORS.light)
		})

		it('should handle rapid theme changes', () => {
			const themes = ['light', 'dark', 'light', 'dark', 'system']
			let themeIndex = 0

			mockUseTheme.mockImplementation(() => ({
				resolvedTheme: themes[themeIndex],
			}))

			const { result, rerender } = renderHook(() => useMetaColor())

			themes.forEach((expectedTheme, index) => {
				themeIndex = index
				rerender()

				const expectedColor = expectedTheme === 'dark' ? META_THEME_COLORS.dark : META_THEME_COLORS.light

				expect(result.current.metaColor).toBe(expectedColor)
			})
		})
	})
})
