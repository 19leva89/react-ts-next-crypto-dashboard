import Script from 'next/script'
import { PropsWithChildren } from 'react'

import { BaseDashboard } from './base-dashboard'

export default function DashboardLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<body>
				<BaseDashboard>{children}</BaseDashboard>

				<Script id="switch-theme" strategy="beforeInteractive">
					{`const documtElement = document.querySelector("html");
						const currentTheme = localStorage.getItem("theme");
						const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
						const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;    

						if(
								currentTheme && 
								(currentTheme === "light" || currentTheme === "dark")
						){
								currentTheme === "dark" ? 
								documtElement?.classList.add("dark") :
								documtElement?.classList.remove("dark");
						}else if(prefersDark){
								documtElement?.classList.add('dark');
						}else if(prefersLight){
								documtElement?.classList.remove('dark');
						}else{
								documtElement?.classList.remove('dark');
						}`}
				</Script>
			</body>
		</html>
	)
}
