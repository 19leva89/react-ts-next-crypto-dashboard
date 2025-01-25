'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

import { Button, Separator } from '@/components/ui'
import { BadgePercent, Bell, Heart, LogOut, Mail, MapPin, PackageOpen, User } from 'lucide-react'

export const Sidebar = () => {
	const onClickSignOut = () => {
		signOut({
			callbackUrl: '/',
		})
	}

	return (
		<div className="flex flex-col gap-5 ">
			<Link href="/user/profile">
				<Button variant="secondary" className="flex justify-start gap-3 text-base w-full" type="button">
					<User />
					Personal data
				</Button>
			</Link>

			<Link href="/user/orders">
				<Button variant="secondary" className="flex justify-start gap-3 text-base w-full" type="button">
					<PackageOpen />
					Order
				</Button>
			</Link>

			<Link href="/user/delivery">
				<Button variant="secondary" className="flex justify-start gap-3 text-base w-full" type="button">
					<MapPin />
					Delivery addresses
				</Button>
			</Link>

			<Link href="/user/discount">
				<Button variant="secondary" className="flex justify-start gap-3 text-base w-full" type="button">
					<BadgePercent />
					Discount
				</Button>
			</Link>

			<Link href="/user/wishlist">
				<Button variant="secondary" className="flex justify-start gap-3 text-base w-full" type="button">
					<Heart />
					Wishlist
				</Button>
			</Link>

			<Link href="/user/subscribes">
				<Button variant="secondary" className="flex justify-start gap-3 text-base w-full" type="button">
					<Mail />
					Newsletter
				</Button>
			</Link>

			<Link href="/user/notice">
				<Button variant="secondary" className="flex justify-start gap-3 text-base w-full" type="button">
					<Bell />
					Message
				</Button>
			</Link>

			<Separator />

			<Button
				variant="ghost"
				className="flex justify-start gap-3 text-base w-full"
				type="button"
				onClick={onClickSignOut}
			>
				<LogOut />
				Logout
			</Button>
		</div>
	)
}
