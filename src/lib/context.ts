import { createContext } from 'react'
import { themeModeOptions } from './definitions'

export const sidebarStateContext = createContext({ sidebarState: false, setSidebarState: () => {} })

export const themeContext = createContext<{ theme: themeModeOptions; setTheme: () => void }>({
	theme: 'light',
	setTheme: () => {},
})
