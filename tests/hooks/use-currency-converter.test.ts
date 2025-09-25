import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { useTRPC } from '@/trpc/client'
import { useSelectedCurrency } from '@/hooks/use-selected-currency'
import { useCurrencyConverter } from '@/hooks/use-currency-converter'

// Mock dependencies - declare functions that will be used in vi.mock
vi.mock('@tanstack/react-query', () => ({
	useQuery: vi.fn(),
}))

vi.mock('@/trpc/client', () => ({
	useTRPC: vi.fn(),
}))

vi.mock('@/hooks/use-selected-currency', () => ({
	useSelectedCurrency: vi.fn(),
}))

// Get typed mocks after mocking
const mockUseQuery = vi.mocked(useQuery)
const mockUseSelectedCurrency = vi.mocked(useSelectedCurrency)
const mockUseTRPC = vi.mocked(useTRPC)

// Helper function to create a complete UseQueryResult mock
const createMockQueryResult = (overrides: any = {}) => ({
	data: overrides.data,
	error: null,
	isError: false,
	isLoading: false,
	isPending: false,
	isSuccess: true,
	isFetching: false,
	isRefetching: false,
	isPlaceholderData: false,
	isInitialLoading: false,
	status: 'success' as const,
	fetchStatus: 'idle' as const,
	refetch: vi.fn(),
	remove: vi.fn(),
	...overrides,
})

describe('useCurrencyConverter', () => {
	const mockExchangeRateData = {
		vsCurrencies: {
			eur: 0.85,
			uah: 36.5, // Ukrainian Hryvnia exchange rate
		},
	}

	const mockQueryOptions = vi.fn()
	const mockChangeCurrency = vi.fn()

	beforeEach(() => {
		// Setup mock returns
		mockQueryOptions.mockReturnValue({
			queryKey: ['getExchangeRate'],
			queryFn: vi.fn(),
		})

		// Mock useTRPC to return our mock query options
		mockUseTRPC.mockReturnValue({
			helpers: {
				getExchangeRate: {
					queryOptions: mockQueryOptions,
				},
			},
		} as any)

		mockUseQuery.mockReturnValue(
			createMockQueryResult({
				data: mockExchangeRateData,
			}),
		)

		mockUseSelectedCurrency.mockReturnValue({
			currency: 'usd',
			changeCurrency: mockChangeCurrency,
		})
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Hook initialization', () => {
		it('should call TRPC helpers and useQuery with correct parameters', () => {
			renderHook(() => useCurrencyConverter())

			expect(mockUseTRPC).toHaveBeenCalled()
			expect(mockQueryOptions).toHaveBeenCalled()
			expect(mockUseQuery).toHaveBeenCalledWith({
				queryKey: ['getExchangeRate'],
				queryFn: expect.any(Function),
			})
		})

		it('should call useSelectedCurrency hook', () => {
			renderHook(() => useCurrencyConverter())

			expect(mockUseSelectedCurrency).toHaveBeenCalled()
		})
	})

	describe('getExchangeRate internal logic', () => {
		it('should return 1 for USD currency', () => {
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'usd',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(1)
		})

		it('should return correct exchange rate for EUR', () => {
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'eur',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(0.85)
		})

		it('should return correct exchange rate for UAH', () => {
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'uah',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(36.5)
		})

		it('should return 1 as fallback when currency not found in exchange rates', () => {
			// Test with a valid currency that's not in our mock data
			mockUseQuery.mockReturnValue(
				createMockQueryResult({
					data: { vsCurrencies: { eur: 0.85 } },
				}),
			)
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'uah',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(1) // fallback
		})

		it('should return 1 as fallback when exchange rate data is null', () => {
			mockUseQuery.mockReturnValue(createMockQueryResult({ data: null }))
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'eur',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(1)
		})

		it('should return 1 as fallback when vsCurrencies is undefined', () => {
			mockUseQuery.mockReturnValue(createMockQueryResult({ data: {} }))
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'eur',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(1)
		})
	})

	describe('fromUSD function', () => {
		it('should return same amount when selected currency is USD', () => {
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'usd',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.fromUSD(100)).toBe(100)
			expect(result.current.fromUSD(0)).toBe(0)
			expect(result.current.fromUSD(-50)).toBe(-50)
		})

		it('should convert USD to EUR correctly', () => {
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'eur',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.fromUSD(100)).toBe(85) // 100 * 0.85
			expect(result.current.fromUSD(50)).toBe(42.5) // 50 * 0.85
			expect(result.current.fromUSD(0)).toBe(0)
		})

		it('should convert USD to UAH correctly', () => {
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'uah',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.fromUSD(100)).toBe(3650) // 100 * 36.5
			expect(result.current.fromUSD(200)).toBe(7300) // 200 * 36.5
		})

		it('should handle negative amounts', () => {
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'eur',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.fromUSD(-100)).toBe(-85) // -100 * 0.85
		})

		it('should handle decimal amounts', () => {
			mockUseSelectedCurrency.mockReturnValue({
				currency: 'eur',
				changeCurrency: mockChangeCurrency,
			})

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.fromUSD(100.5)).toBe(85.425) // 100.50 * 0.85
		})
	})

	describe('toUSD function', () => {
		it('should return same amount when selected currency is USD', () => {
			mockUseSelectedCurrency.mockReturnValue({ currency: 'usd', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.toUSD(100)).toBe(100)
			expect(result.current.toUSD(0)).toBe(0)
			expect(result.current.toUSD(-50)).toBe(-50)
		})

		it('should convert EUR to USD correctly', () => {
			mockUseSelectedCurrency.mockReturnValue({ currency: 'eur', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.toUSD(85)).toBeCloseTo(100, 10) // 85 / 0.85
			expect(result.current.toUSD(42.5)).toBeCloseTo(50, 10) // 42.5 / 0.85
			expect(result.current.toUSD(0)).toBe(0)
		})

		it('should convert UAH to USD correctly', () => {
			mockUseSelectedCurrency.mockReturnValue({ currency: 'uah', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.toUSD(3650)).toBeCloseTo(100, 10) // 3650 / 36.5
			expect(result.current.toUSD(7300)).toBeCloseTo(200, 10) // 7300 / 36.5
		})

		it('should handle negative amounts', () => {
			mockUseSelectedCurrency.mockReturnValue({ currency: 'eur', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.toUSD(-85)).toBeCloseTo(-100, 10) // -85 / 0.85
		})

		it('should handle decimal amounts', () => {
			mockUseSelectedCurrency.mockReturnValue({ currency: 'eur', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.toUSD(85.425)).toBeCloseTo(100.5, 10) // 85.425 / 0.85
		})
	})

	describe('convert function', () => {
		it('should return same amount when from and to currencies are the same', () => {
			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.convert(100, 'usd', 'usd')).toBe(100)
			expect(result.current.convert(100, 'eur', 'eur')).toBe(100)
			expect(result.current.convert(50.5, 'uah', 'uah')).toBe(50.5)
		})

		it('should convert from USD to other currencies correctly', () => {
			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.convert(100, 'usd', 'eur')).toBe(85) // 100 * 0.85
			expect(result.current.convert(100, 'usd', 'uah')).toBe(3650) // 100 * 36.5
		})

		it('should convert from other currencies to USD correctly', () => {
			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.convert(85, 'eur', 'usd')).toBeCloseTo(100, 10) // 85 / 0.85
			expect(result.current.convert(3650, 'uah', 'usd')).toBeCloseTo(100, 10) // 3650 / 36.5
		})

		it('should convert between non-USD currencies via USD', () => {
			const { result } = renderHook(() => useCurrencyConverter())

			// EUR to UAH: 100 EUR -> 100/0.85 = 117.647 USD -> 117.647 * 36.5 = 4294.118 UAH
			expect(result.current.convert(100, 'eur', 'uah')).toBeCloseTo(4294.118, 3)

			// UAH to EUR: 100 UAH -> 100/36.5 = 2.740 USD -> 2.740 * 0.85 = 2.329 EUR
			expect(result.current.convert(100, 'uah', 'eur')).toBeCloseTo(2.329, 3)
		})

		it('should handle currencies not in exchange rate data', () => {
			const { result } = renderHook(() => useCurrencyConverter())

			// For the convert function, we can test with any string currencies
			// as the convert function should handle unknown currencies gracefully
			expect(result.current.convert(100, 'unknown1' as any, 'usd')).toBe(100) // 100 / 1
			expect(result.current.convert(100, 'usd', 'unknown2' as any)).toBe(100) // 100 * 1
			expect(result.current.convert(100, 'unknown1' as any, 'unknown2' as any)).toBe(100) // 100 / 1 * 1
		})

		it('should handle zero and negative amounts', () => {
			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.convert(0, 'eur', 'uah')).toBe(0)
			expect(result.current.convert(-100, 'eur', 'uah')).toBeCloseTo(-4294.118, 3)
		})

		it('should handle decimal amounts', () => {
			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.convert(100.5, 'usd', 'eur')).toBe(85.425) // 100.50 * 0.85
		})
	})

	describe('Return values', () => {
		it('should return selectedCurrency from hook', () => {
			mockUseSelectedCurrency.mockReturnValue({ currency: 'eur', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.selectedCurrency).toBe('eur')
		})

		it('should return exchangeRate for current currency', () => {
			mockUseSelectedCurrency.mockReturnValue({ currency: 'uah', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(36.5)
		})

		it('should return isLoading as false when data is available', () => {
			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.isLoading).toBe(false)
		})

		it('should return isLoading as true when data is not available', () => {
			mockUseQuery.mockReturnValue(
				createMockQueryResult({
					data: undefined,
					isLoading: true,
					isSuccess: false,
				}),
			)

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.isLoading).toBe(true)
		})

		it('should return isLoading as true when data is null', () => {
			mockUseQuery.mockReturnValue(
				createMockQueryResult({
					data: null,
					isLoading: true,
					isSuccess: false,
				}),
			)

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.isLoading).toBe(true)
		})
	})

	describe('Edge cases', () => {
		it('should handle missing vsCurrencies object', () => {
			mockUseQuery.mockReturnValue(
				createMockQueryResult({
					data: { someOtherProperty: 'value' },
				}),
			)
			mockUseSelectedCurrency.mockReturnValue({ currency: 'eur', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			// Should fallback to rate of 1
			expect(result.current.exchangeRate).toBe(1)
			expect(result.current.fromUSD(100)).toBe(100)
			expect(result.current.toUSD(100)).toBe(100)
		})

		it('should handle exchange rate of 0 by falling back to 1', () => {
			const dataWithZeroRate = {
				vsCurrencies: {
					eur: 0,
				},
			}
			mockUseQuery.mockReturnValue(createMockQueryResult({ data: dataWithZeroRate }))
			mockUseSelectedCurrency.mockReturnValue({ currency: 'eur', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			// The hook should treat 0 as invalid and fallback to 1
			expect(result.current.exchangeRate).toBe(1)
			expect(result.current.fromUSD(100)).toBe(100) // 100 * 1 (fallback)
			expect(result.current.toUSD(100)).toBe(100) // 100 / 1 (fallback)
		})

		it('should handle very small exchange rates', () => {
			const dataWithSmallRate = {
				vsCurrencies: {
					eur: 0.000001,
				},
			}
			mockUseQuery.mockReturnValue(createMockQueryResult({ data: dataWithSmallRate }))
			mockUseSelectedCurrency.mockReturnValue({ currency: 'eur', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(0.000001)
			expect(result.current.fromUSD(1)).toBe(0.000001) // 1 * 0.000001
			expect(result.current.toUSD(0.000001)).toBeCloseTo(1, 10) // 0.000001 / 0.000001
		})

		it('should handle very large exchange rates', () => {
			const dataWithLargeRate = {
				vsCurrencies: {
					uah: 1000000,
				},
			}
			mockUseQuery.mockReturnValue(createMockQueryResult({ data: dataWithLargeRate }))
			mockUseSelectedCurrency.mockReturnValue({ currency: 'uah', changeCurrency: mockChangeCurrency })

			const { result } = renderHook(() => useCurrencyConverter())

			expect(result.current.exchangeRate).toBe(1000000)
			expect(result.current.fromUSD(1)).toBe(1000000) // 1 * 1000000
			expect(result.current.toUSD(1000000)).toBeCloseTo(1, 10) // 1000000 / 1000000
		})
	})

	describe('Function references stability', () => {
		it('should provide consistent function behavior across re-renders', () => {
			const { result, rerender } = renderHook(() => useCurrencyConverter())

			const initialFromUSDResult = result.current.fromUSD(100)
			const initialToUSDResult = result.current.toUSD(100)
			const initialConvertResult = result.current.convert(100, 'usd', 'eur')

			// Trigger re-render
			rerender()

			// Functions should behave consistently even if references change
			expect(result.current.fromUSD(100)).toBe(initialFromUSDResult)
			expect(result.current.toUSD(100)).toBe(initialToUSDResult)
			expect(result.current.convert(100, 'usd', 'eur')).toBe(initialConvertResult)
		})
	})
})
