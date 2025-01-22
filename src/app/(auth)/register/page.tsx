import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Create account',
}

export default function RegistrationPage() {
	return (
		<div className="h-screen flex justify-center items-start mx-2 my-10 overflow-auto">
			<div className=" shadow-xl rounded-lg p-3 max-w-[350px] mx-auto">
				<form action="" method="post" className="mb-5">
					<div className="mb-3">
						<label htmlFor="first_name">First name: </label>

						<input
							type="text"
							name="first_name"
							id="first_name"
							placeholder="First name"
							className="rounded-lg border-0 shadow-lg p-3 w-full mt-2"
							required
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="last_name">Last name: </label>

						<input
							type="text"
							name="last_name"
							id="last_name"
							placeholder="Last name"
							className="rounded-lg border-0 shadow-lg p-3 w-full mt-2"
							required
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="email">Email: </label>

						<input
							type="email"
							name="email"
							id="email"
							placeholder="Email"
							className="rounded-lg border-0 shadow-lg p-3 w-full mt-2"
							required
						/>
					</div>

					<div>
						<label htmlFor="password">Create a password: </label>

						<input
							type="password"
							name="password"
							id="password"
							placeholder="Password"
							className="rounded-lg border-0 shadow-lg p-3 w-full mt-2"
							required
						/>
					</div>
				</form>

				<div className="flex justify-end">
					<Link href={'/login'} className="hover:underline text-sm text-end">
						Already have an account? Login
					</Link>
				</div>

				<a
					href={'/dashboard'}
					className="block w-full mt-6 rounded-full p-3 bg-blue-500 text-white text-center
                hover:bg-blue-600"
				>
					Create account
				</a>
			</div>
		</div>
	)
}
