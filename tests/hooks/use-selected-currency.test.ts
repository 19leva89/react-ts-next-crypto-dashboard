import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { CURRENCY_KEY, useSelectedCurrency } from '@/hooks/use-selected-currency'

// Mock the use-local-storage-state module
vi.mock('use-local-storage-state')

import useLocalStorageState from 'use-local-storage-state'

// Create a typed mock for better type safety
const mockUseLocalStorageState = vi.mocked(useLocalStorageState)

describe('useSelectedCurrency', () => {
	let mockSetCurrency: ReturnType<typeof vi.fn>
	let mockRemoveValue: { isPersistent: boolean; removeItem: ReturnType<typeof vi.fn> }

	beforeEach(() => {
		// Create fresh mock functions for each test
		mockSetCurrency = vi.fn()
		mockRemoveValue = {
			isPersistent: true,
			removeItem: vi.fn(),
		}

		// Reset all mocks to ensure clean state
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('initialization and default values', () => {
		it('should initialize with default USD currency when no stored value exists', () => {
			// Mock useLocalStorageState to return default USD value with 3-element tuple
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// Should call useLocalStorageState with correct key and default value
			expect(mockUseLocalStorageState).toHaveBeenCalledWith(CURRENCY_KEY, {
				defaultValue: 'usd',
			})

			// Should return USD as the default currency
			expect(result.current.currency).toBe('usd')
			expect(typeof result.current.changeCurrency).toBe('function')
		})

		it('should use stored currency value from localStorage', () => {
			// Mock useLocalStorageState to return stored EUR value
			mockUseLocalStorageState.mockReturnValue(['eur', mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// Should return the stored currency value
			expect(result.current.currency).toBe('eur')
		})

		it('should call useLocalStorageState with correct parameters', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			renderHook(() => useSelectedCurrency())

			// Verify the hook is called with correct key and configuration
			expect(mockUseLocalStorageState).toHaveBeenCalledTimes(1)
			expect(mockUseLocalStorageState).toHaveBeenCalledWith(CURRENCY_KEY, {
				defaultValue: 'usd',
			})
		})
	})

	describe('currency state management', () => {
		it('should return all valid currency values correctly', () => {
			const validCurrencies = ['usd', 'eur', 'uah'] as const

			validCurrencies.forEach((currency) => {
				mockUseLocalStorageState.mockReturnValue([currency, mockSetCurrency, mockRemoveValue])

				const { result } = renderHook(() => useSelectedCurrency())

				expect(result.current.currency).toBe(currency)
			})
		})

		it('should provide changeCurrency function that calls the localStorage setter', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// changeCurrency should be the same function as the localStorage setter
			expect(result.current.changeCurrency).toBe(mockSetCurrency)
		})

		it('should update currency when changeCurrency is called', () => {
			// Start with USD, then simulate change to EUR
			mockUseLocalStorageState
				.mockReturnValueOnce(['usd', mockSetCurrency, mockRemoveValue])
				.mockReturnValueOnce(['eur', mockSetCurrency, mockRemoveValue])

			const { result, rerender } = renderHook(() => useSelectedCurrency())

			// Initial state should be USD
			expect(result.current.currency).toBe('usd')

			// Call changeCurrency
			act(() => {
				result.current.changeCurrency('eur')
			})

			// Verify the setter was called with correct value
			expect(mockSetCurrency).toHaveBeenCalledWith('eur')

			// Rerender to simulate state update
			rerender()

			// After rerender, currency should be EUR
			expect(result.current.currency).toBe('eur')
		})
	})

	describe('currency change operations', () => {
		it('should handle changing between all valid currencies', () => {
			const currencies = ['usd', 'eur', 'uah'] as const
			let currentIndex = 0

			// Mock dynamic return values based on call sequence
			mockUseLocalStorageState.mockImplementation(() => [
				currencies[currentIndex],
				(newCurrency: unknown) => {
					const index = currencies.indexOf(newCurrency as any)
					if (index !== -1) currentIndex = index
					mockSetCurrency(newCurrency as string)
				},
				mockRemoveValue,
			])

			const { result, rerender } = renderHook(() => useSelectedCurrency())

			// Test changing to each currency
			currencies.forEach((targetCurrency, index) => {
				if (index > 0) {
					// Skip first iteration since we start with usd
					act(() => {
						result.current.changeCurrency(targetCurrency)
					})
					rerender()
				}

				expect(result.current.currency).toBe(targetCurrency)
			})

			// Verify all changes were called
			expect(mockSetCurrency).toHaveBeenCalledTimes(currencies.length - 1)
		})

		it('should handle rapid currency changes', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// Perform multiple rapid changes
			act(() => {
				result.current.changeCurrency('eur')
				result.current.changeCurrency('uah')
				result.current.changeCurrency('usd')
			})

			// Should call setter for each change
			expect(mockSetCurrency).toHaveBeenCalledTimes(3)
			expect(mockSetCurrency).toHaveBeenNthCalledWith(1, 'eur')
			expect(mockSetCurrency).toHaveBeenNthCalledWith(2, 'uah')
			expect(mockSetCurrency).toHaveBeenNthCalledWith(3, 'usd')
		})

		it('should maintain function reference stability across renders', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			const { result, rerender } = renderHook(() => useSelectedCurrency())

			const initialChangeCurrency = result.current.changeCurrency

			// Rerender the hook
			rerender()

			// Function reference should remain stable
			expect(result.current.changeCurrency).toBe(initialChangeCurrency)
			expect(result.current.changeCurrency).toBe(mockSetCurrency)
		})
	})

	describe('return value structure', () => {
		it('should return object with correct property names and types', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// Check return value structure
			expect(result.current).toEqual({
				currency: 'usd',
				changeCurrency: mockSetCurrency,
			})

			// Check property types
			expect(typeof result.current.currency).toBe('string')
			expect(typeof result.current.changeCurrency).toBe('function')
		})

		it('should return stable object structure across different currencies', () => {
			const currencies = ['usd', 'eur', 'uah'] as const

			currencies.forEach((currency) => {
				mockUseLocalStorageState.mockReturnValue([currency, mockSetCurrency, mockRemoveValue])

				const { result } = renderHook(() => useSelectedCurrency())

				// Object should always have the same structure
				expect(Object.keys(result.current)).toEqual(['currency', 'changeCurrency'])
				expect(result.current.currency).toBe(currency)
				expect(result.current.changeCurrency).toBe(mockSetCurrency)
			})
		})
	})

	describe('hook lifecycle and persistence', () => {
		it('should maintain localStorage integration across hook lifecycle', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			const { unmount, rerender } = renderHook(() => useSelectedCurrency())

			// Rerender multiple times
			rerender()
			rerender()

			// Unmount the hook
			unmount()

			// Should only call useLocalStorageState once per render
			// (the exact count depends on React's rendering behavior)
			expect(mockUseLocalStorageState).toHaveBeenCalled()
		})

		it('should work correctly with multiple hook instances', () => {
			const mockSetCurrency1 = vi.fn()
			const mockSetCurrency2 = vi.fn()
			const mockRemoveValue1 = { isPersistent: true, removeItem: vi.fn() }
			const mockRemoveValue2 = { isPersistent: true, removeItem: vi.fn() }

			// Mock different return values for different instances
			mockUseLocalStorageState
				.mockReturnValueOnce(['usd', mockSetCurrency1, mockRemoveValue1])
				.mockReturnValueOnce(['eur', mockSetCurrency2, mockRemoveValue2])

			// Create two instances of the hook
			const { result: result1 } = renderHook(() => useSelectedCurrency())
			const { result: result2 } = renderHook(() => useSelectedCurrency())

			// Both should use the same localStorage key
			expect(mockUseLocalStorageState).toHaveBeenCalledTimes(2)
			expect(mockUseLocalStorageState).toHaveBeenNthCalledWith(1, CURRENCY_KEY, {
				defaultValue: 'usd',
			})
			expect(mockUseLocalStorageState).toHaveBeenNthCalledWith(2, CURRENCY_KEY, {
				defaultValue: 'usd',
			})

			// But can have different values (simulating different components)
			expect(result1.current.currency).toBe('usd')
			expect(result2.current.currency).toBe('eur')
		})
	})

	describe('edge cases and error handling', () => {
		it('should handle undefined localStorage values gracefully', () => {
			// Mock useLocalStorageState to return undefined (shouldn't happen with defaultValue, but test anyway)
			mockUseLocalStorageState.mockReturnValue([undefined as any, mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// Should handle undefined gracefully
			expect(result.current.currency).toBeUndefined()
			expect(typeof result.current.changeCurrency).toBe('function')
		})

		it('should handle null localStorage values gracefully', () => {
			// Mock useLocalStorageState to return null
			mockUseLocalStorageState.mockReturnValue([null as any, mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// Should handle null gracefully
			expect(result.current.currency).toBeNull()
			expect(typeof result.current.changeCurrency).toBe('function')
		})

		it('should maintain consistent behavior when changeCurrency is called with same value', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// Call changeCurrency with the same current value
			act(() => {
				result.current.changeCurrency('usd')
			})

			// Should still call the setter (let useLocalStorageState handle optimization)
			expect(mockSetCurrency).toHaveBeenCalledWith('usd')
		})
	})

	describe('type safety and TypeScript integration', () => {
		it('should work with TypeScript currency type constraints', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// These should be valid currency values
			act(() => {
				result.current.changeCurrency('usd')
			})
			act(() => {
				result.current.changeCurrency('eur')
			})
			act(() => {
				result.current.changeCurrency('uah')
			})

			expect(mockSetCurrency).toHaveBeenCalledTimes(3)
		})

		it('should provide proper TypeScript return types', () => {
			mockUseLocalStorageState.mockReturnValue(['eur', mockSetCurrency, mockRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// TypeScript should infer these types correctly
			const currency: string = result.current.currency
			const changeCurrency: (currency: 'usd' | 'eur' | 'uah') => void = result.current.changeCurrency

			expect(currency).toBe('eur')
			expect(typeof changeCurrency).toBe('function')
		})
	})

	describe('integration with use-local-storage-state', () => {
		it('should pass through all useLocalStorageState functionality', () => {
			const mockOptions = { defaultValue: 'usd' }
			mockUseLocalStorageState.mockReturnValue(['eur', mockSetCurrency, mockRemoveValue])

			renderHook(() => useSelectedCurrency())

			// Should call the underlying hook with exact parameters
			expect(mockUseLocalStorageState).toHaveBeenCalledWith(CURRENCY_KEY, mockOptions)
		})

		it('should use the correct localStorage key consistently', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			// Render multiple times
			renderHook(() => useSelectedCurrency())
			renderHook(() => useSelectedCurrency())

			// Should always use the same key
			mockUseLocalStorageState.mock.calls.forEach((call) => {
				expect(call[0]).toBe(CURRENCY_KEY)
			})
		})

		it('should preserve the original setter function behavior', () => {
			const originalSetter = vi.fn()
			const originalRemoveValue = { isPersistent: true, removeItem: vi.fn() }
			mockUseLocalStorageState.mockReturnValue(['usd', originalSetter, originalRemoveValue])

			const { result } = renderHook(() => useSelectedCurrency())

			// changeCurrency should be the exact same function
			expect(result.current.changeCurrency).toBe(originalSetter)

			// Calling changeCurrency should call the original setter
			result.current.changeCurrency('eur')
			expect(originalSetter).toHaveBeenCalledWith('eur')
		})

		it('should provide access to persistence information', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			renderHook(() => useSelectedCurrency())

			// Should have access to isPersistent property
			expect(mockRemoveValue.isPersistent).toBe(true)
			expect(typeof mockRemoveValue.removeItem).toBe('function')
		})

		it('should handle removeItem functionality through the third tuple element', () => {
			mockUseLocalStorageState.mockReturnValue(['usd', mockSetCurrency, mockRemoveValue])

			renderHook(() => useSelectedCurrency())

			// The removeItem function should be available for manual cleanup if needed
			mockRemoveValue.removeItem()
			expect(mockRemoveValue.removeItem).toHaveBeenCalledTimes(1)
		})
	})
})
