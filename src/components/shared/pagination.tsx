'use client'

import { ChevronDown } from 'lucide-react'
import { Dispatch, useEffect, useState } from 'react'

import { cn } from '@/lib'

interface PaginationProps {
	datas: any[]
	rows: number
	setCurrentDatas: Dispatch<any>
}

export const Pagination = ({ datas, setCurrentDatas, rows }: PaginationProps) => {
	const [totalSrceen, setTotalSrceen] = useState<number>(0)
	const [currentScreen, setCurrentScreen] = useState<number>(1)
	const [previousScreen, setPreviousScreen] = useState<number>(0)
	const [rowsPerScreen, setRowsPerScreen] = useState<number>(rows)
	const [totalSrceenArray, setTotalSrceenArray] = useState<number[]>([])

	useEffect(() => {
		if (rows <= 0) {
			setTotalSrceen(0)
			setTotalSrceenArray([])
			setCurrentDatas([])
			return
		}

		setCurrentDatas(datas?.slice(0, rows))
		setCurrentScreen(1)
		setPreviousScreen(0)
		updateTotalScreen(rows)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rows, setCurrentDatas])

	useEffect(() => {
		const totalScreen = updateTotalScreen(rowsPerScreen)
		if (currentScreen >= totalScreen) {
			const currentRange = datas?.slice((totalScreen - 1) * rowsPerScreen, totalScreen * rowsPerScreen)
			setCurrentDatas(currentRange)
			setPreviousScreen(totalScreen - 1)
			setCurrentScreen(totalScreen)
		} else {
			setCurrentDatas(datas?.slice(previousScreen * rowsPerScreen, currentScreen * rowsPerScreen))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [datas])

	const updateTotalScreen = (rows: number) => {
		if (rows >= datas?.length) {
			setTotalSrceen(1)
			setTotalSrceenArray([1])
			return 1
		}

		let screens = datas?.length / rows
		// check if it is a float
		const splitted = screens.toString().split('.')
		if (splitted.length > 1) {
			screens = parseInt(screens.toString()) + 1
		}

		// create screen index array
		const screenIndexArray = Array.from({ length: screens }).map((value, index) => index + 1)

		setTotalSrceen(screens)
		setTotalSrceenArray(screenIndexArray)

		return screens
	}

	const goToNextPage = () => {
		if (currentScreen === totalSrceen) {
			return
		}

		const nexScreen = currentScreen + 1
		const startIndex = rowsPerScreen * currentScreen
		const stopIndex = rowsPerScreen * nexScreen

		setCurrentDatas(datas.slice(startIndex, stopIndex))
		setCurrentScreen(nexScreen)
		setPreviousScreen(currentScreen)
	}

	const goToPreviousPage = () => {
		if (currentScreen === 1) {
			return
		}

		const backScreen = previousScreen - 1
		const startIndex = rowsPerScreen * backScreen
		const stopIndex = rowsPerScreen * previousScreen

		setCurrentDatas(datas.slice(startIndex, stopIndex))
		setCurrentScreen(previousScreen)
		setPreviousScreen(backScreen)
	}

	const goToXPage = (x: number) => {
		if (currentScreen === x) {
			// we are on the current screen already
			return
		}

		const nexScreen = x
		const previousScreen = x - 1
		const startIndex = rowsPerScreen * previousScreen
		const stopIndex = rowsPerScreen * nexScreen

		setCurrentDatas(datas.slice(startIndex, stopIndex))
		setCurrentScreen(nexScreen)
		setPreviousScreen(previousScreen)
	}

	const onrowsChange = (e: any) => {
		if (e.target.value.length <= 0) {
			return
		}

		const value = parseInt(e.target.value)
		if (isNaN(value)) {
			e.target.value = ''
			return
		}

		setRowsPerScreen(value)
		if (value <= 0) {
			setTotalSrceen(0)
			setTotalSrceenArray([])
			setCurrentDatas([])
			return
		}

		const totalScreen = updateTotalScreen(value)
		if (currentScreen >= totalScreen) {
			// show the lastest data range
			setCurrentDatas(datas.slice((totalScreen - 1) * value, totalScreen * value))
			setCurrentScreen(totalScreen)
			setPreviousScreen(totalScreen - 1)
		} else {
			// update data to show the current and previous range
			setCurrentDatas(datas.slice(previousScreen * value, currentScreen * value))
		}
	}

	const onrowsBlur = (e: any) => {
		if (e.target.value.length <= 0) {
			e.target.value = rowsPerScreen
			return
		}

		const value = parseInt(e.target.value)
		if (!isNaN(value)) {
			e.target.value = value
			return
		}
	}

	const dataInfo = (
		<p className="text-sm">
			Showing {previousScreen * rowsPerScreen} to{' '}
			{currentScreen * rowsPerScreen > datas.length ? datas.length : currentScreen * rowsPerScreen} of{' '}
			{datas.length} results
		</p>
	)

	const inputRowsPerScreen = (
		<div className="flex justify-center items-center gap-x-2">
			<span className="text-gray-600 dark:text-white text-sm">Rows: </span>

			<input
				type="text"
				name="per-screen"
				id="per-screen"
				className="border-2 dark:bg-transparent dark:border-gray-700 py-2 w-16 rounded-xl text-center"
				onChange={onrowsChange}
				defaultValue={rowsPerScreen}
				onBlur={onrowsBlur}
			/>
		</div>
	)

	return (
		datas?.length > 0 && (
			<>
				<div className="mt-10 lg:gap-14 xl:gap-24 flex items-center justify-center font-medium">
					<div className="hidden lg:block">{dataInfo}</div>

					{totalSrceen > 0 && (
						<div className="flex items-center gap-0 min-[300px]:gap-3 min-[340px]:gap-5 max-[340px]:text-xs">
							<button
								className="disabled:text-gray-600"
								onClick={goToPreviousPage}
								disabled={currentScreen === 1}
							>
								<ChevronDown size={16} className="rotate-90" />
							</button>

							<div className="flex gap-x-1 items-center *:rounded-lg *:px-4 *:py-2 font-medium">
								{totalSrceen <= 4
									? totalSrceenArray.map((value) => (
											<button
												key={value}
												onClick={() => {
													goToXPage(value)
												}}
												className={cn(
													value === currentScreen
														? 'bg-blue-500 text-white'
														: 'text-blue-500 dark:border-2 dark:border-gray-700',
												)}
											>
												{value}
											</button>
										))
									: totalSrceen > 4 && (
											<>
												{
													<button
														onClick={() => {
															const firstPage = totalSrceenArray.at(0)

															if (firstPage !== undefined) {
																goToXPage(firstPage)
															}
														}}
														className={cn(
															totalSrceenArray.at(0) === currentScreen
																? 'bg-blue-500 text-white'
																: 'text-blue-500 dark:border-2 dark:border-gray-700',
														)}
													>
														{totalSrceenArray.at(0)}
													</button>
												}

												{currentScreen === (totalSrceenArray.at(-2) ?? 0) - 1 && (
													<span className="text-blue-500 dark:border-2 dark:border-gray-700">...</span>
												)}

												{currentScreen === totalSrceenArray.at(0) ||
												currentScreen === totalSrceenArray.at(1) ||
												currentScreen === totalSrceenArray.at(-1) ||
												currentScreen === totalSrceenArray.at(-2) ? (
													<button
														onClick={() => {
															const page = totalSrceenArray.at(1)
															if (page !== undefined) {
																goToXPage(page)
															}
														}}
														className={cn(
															totalSrceenArray.at(1) === currentScreen
																? 'bg-blue-500 text-white'
																: 'text-blue-500 dark:border-2 dark:border-gray-700',
														)}
													>
														{totalSrceenArray.at(1)}
													</button>
												) : (
													<button
														onClick={() => {
															goToXPage(currentScreen)
														}}
														className="bg-blue-500 text-white"
													>
														{currentScreen}
													</button>
												)}
												{currentScreen !== (totalSrceenArray.at(-2) ?? 0) - 1 && (
													<span className="text-blue-500 dark:border-2 dark:border-gray-700">...</span>
												)}
												{totalSrceenArray.slice(totalSrceen - 2).map((value) => (
													<button
														key={value}
														onClick={() => {
															goToXPage(value)
														}}
														className={cn(
															value === currentScreen
																? 'bg-blue-500 text-white'
																: 'text-blue-500 dark:border-2 dark:border-gray-700',
														)}
													>
														{value}
													</button>
												))}
											</>
										)}
							</div>

							<button
								className="disabled:text-gray-600"
								onClick={goToNextPage}
								disabled={currentScreen === totalSrceen}
							>
								<ChevronDown size={16} className="-rotate-90" />
							</button>
						</div>
					)}

					<div className="hidden lg:block">{inputRowsPerScreen}</div>
				</div>

				<div className="mt-5 flex flex-wrap lg:hidden justify-center items-center gap-6 font-medium">
					{dataInfo}

					{inputRowsPerScreen}
				</div>
			</>
		)
	)
}
