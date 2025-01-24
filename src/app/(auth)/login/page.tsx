import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Login',
}

const LoginPage = () => {
	return (
		<div className="h-screen flex justify-center items-start mx-2 my-10">
			<div className=" shadow-xl rounded-lg p-3 max-w-[350px] mx-auto">
				<form action="" method="post" className="mb-5">
					<div className="mb-3">
						<label htmlFor="email">Enter your email: </label>

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
						<label htmlFor="password">Enter your password: </label>

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
					<Link href={'/register'} className="hover:underline text-sm text-end">
						Create an account
					</Link>
				</div>

				<a
					href={'/dashboard'}
					className="block w-full mt-6 rounded-full p-3 bg-blue-500 text-white text-center hover:bg-blue-600"
				>
					Login
				</a>
			</div>
		</div>
	)
}

export default LoginPage
