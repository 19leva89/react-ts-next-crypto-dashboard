import {
	BellIcon,
	ChartNoAxesCombinedIcon,
	CreditCardIcon,
	FileTextIcon,
	HandCoinsIcon,
	HelpCircleIcon,
	HomeIcon,
	NewspaperIcon,
	WalletIcon,
	type LucideIcon,
} from 'lucide-react'

export type MenuItem = {
	title: string
	url: string
	icon: string
	private: boolean
}

export const iconMap: Record<string, LucideIcon> = {
	HomeIcon,
	NewspaperIcon,
	HandCoinsIcon,
	ChartNoAxesCombinedIcon,
	FileTextIcon,
	CreditCardIcon,
	WalletIcon,
	BellIcon,
	HelpCircleIcon,
}

export const firstSection: MenuItem[] = [
	{
		title: 'Dashboard',
		url: '/dashboard',
		icon: 'HomeIcon',
		private: false,
	},
	{
		title: 'News',
		url: '/news',
		icon: 'NewspaperIcon',
		private: false,
	},
	{
		title: 'Coins',
		url: '/coins',
		icon: 'HandCoinsIcon',
		private: true,
	},
	{
		title: 'Charts',
		url: '/charts',
		icon: 'ChartNoAxesCombinedIcon',
		private: true,
	},
	{
		title: 'Transactions',
		url: '/transactions',
		icon: 'FileTextIcon',
		private: true,
	},
	{
		title: 'Cards',
		url: '/cards',
		icon: 'CreditCardIcon',
		private: true,
	},
	{
		title: 'Billing',
		url: '/billing',
		icon: 'WalletIcon',
		private: true,
	},
]

export const secondSection: MenuItem[] = [
	{
		title: 'Notifications',
		url: '/notifications',
		icon: 'BellIcon',
		private: true,
	},
	{
		title: 'Help center',
		url: '/help',
		icon: 'HelpCircleIcon',
		private: false,
	},
]
