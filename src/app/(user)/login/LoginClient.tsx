"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { GhostButton, IconButton, PrimaryButton } from "@/components/ui/Buttons";
import { IconField } from "@/components/ui/Inputs";
import MenuPanel from "@/components/ui/MenuPanel";
import { DiscordIcon, GithubIcon, GoogleIcon, TwitchIcon } from "@/components/ui/SVG";
import { login, loginProvider, signup } from "@/lib/actions/auth";
import { deferHook } from "@/lib/util/client/func";

const providers = [
	{ name: "Google", icon: GoogleIcon, slug: "google" },
	{ name: "GitHub", icon: GithubIcon, slug: "github" },
	{ name: "Twitch", icon: TwitchIcon, slug: "twitch" },
	{ name: "Discord", icon: DiscordIcon, slug: "discord" },
];

const authErrorMessages: Record<string, string> = {
	AccessDenied: "Access denied. Please try another sign-in method.",
	AccountNotLinked: "An account with this email already exists. Sign in first, then link this provider.",
	CallbackRouteError: "Sign in failed. Please try again.",
	CredentialsSignin: "Invalid email or password.",
	OAuthAccountNotLinked: "An account with this email already exists. Sign in first, then link this provider.",
	OAuthCallbackError: "The provider sign-in failed. Please try again.",
	OAuthSignInError: "The provider sign-in failed. Please try again.",
	OAuthUsernameRequired: "Use 1-32 letters, numbers, underscores, or hyphens.",
	OAuthUsernameTaken: "That username is already in use.",
};

export default function LoginClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [mode, setMode] = useState<"login" | "register">("login");
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; passwordConfirm?: string }>({});
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [providerSignup, setProviderSignup] = useState<(typeof providers)[number] | null>(null);
	const [providerUsername, setProviderUsername] = useState("");
	const [providerUsernameError, setProviderUsernameError] = useState("");
	const isRegister = mode === "register";
	const passwordMessage = isRegister && password.length > 0 && password.length < 8 ? "Password must be at least 8 characters." : fieldErrors.password;

	useEffect(() => {
		const defer = deferHook(() => {
			setMode(searchParams.get("mode") === "register" ? "register" : "login");
		});
		const authError = searchParams.get("error");

		if (authError) {
			return deferHook(() => {
				setErrorMessage(authErrorMessages[authError] ?? "Sign in failed. Please try again.");
			});
		}

		return defer();
	}, [searchParams]);

	function switchTo(nextMode: "login" | "register") {
		setErrorMessage("");
		setFieldErrors({});
		setPassword("");
		setProviderSignup(null);
		setProviderUsername("");
		setProviderUsernameError("");
		setMode(nextMode);
		router.replace(`/login?mode=${nextMode}`);
	}

	async function handleSubmit(formData: FormData) {
		const response = isRegister ? await signup(formData) : await login(formData);

		if (response?.error) {
			setErrorMessage(response.error);
			setFieldErrors(response.fieldErrors ?? {});
			return;
		}

		setErrorMessage("");
		setFieldErrors({});
	}

	async function handleProvider(provider: (typeof providers)[number]) {
		if (isRegister) {
			setErrorMessage("");
			setFieldErrors({});
			setProviderSignup(provider);
			setProviderUsername("");
			setProviderUsernameError("");
			return;
		}

		const formData = new FormData();
		formData.set("mode", mode);

		const response = await loginProvider(provider.slug, formData);

		if (response?.error) {
			setErrorMessage(response.error);
			setFieldErrors(response.fieldErrors ?? {});
			return;
		}

		setErrorMessage("");
		setFieldErrors({});
	}

	async function handleProviderSignup(formData: FormData) {
		if (!providerSignup) return;

		formData.set("mode", "register");
		const response = await loginProvider(providerSignup.slug, formData);

		if (response?.error) {
			setProviderUsernameError(response.fieldErrors?.name ?? response.error);
			return;
		}

		setProviderUsernameError("");
	}

	return (
		<div className="w-full max-w-md rounded bg-bg-secondary p-5 sm:p-6">
			<div className="mb-4">
				<h1 className="pb-5 text-center text-2xl font-bold text-text sm:text-3xl">{isRegister ? "Join" : "Login"}</h1>
			</div>
			{errorMessage && (
				<div className="mb-2 rounded border-2 border-error/50 bg-error/20 p-5 text-error">
					<p className="text-sm">{errorMessage}</p>
				</div>
			)}
			<form action={handleSubmit} key={mode} className="animate-auth-mode-in flex flex-col gap-4">
				{isRegister && (
					<IconField
						icon={User}
						label="Username"
						id="name"
						name="name"
						type="text"
						autoComplete="username"
						placeholder="Your display name"
						maxLength={32}
						pattern="[A-Za-z0-9_\-]+"
						value={name}
						onChange={(event) => setName(event.target.value)}
						error={fieldErrors.name}
					/>
				)}

				<IconField icon={Mail} label="Email" id="email" name="email" type="email" autoComplete="email" placeholder="Email address" error={fieldErrors.email} />

				<IconField
					icon={Lock}
					label="Password"
					id="password"
					name="password"
					type={showPassword ? "text" : "password"}
					autoComplete={isRegister ? "new-password" : "current-password"}
					placeholder="Password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					error={passwordMessage}
					endAdornment={
						<IconButton
							onClick={() => setShowPassword((value) => !value)}
							pressed={showPassword}
							label="Toggle password"
							icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							className="absolute top-1/2 right-2 -translate-y-1/2"
						/>
					}
				/>

				{isRegister && (
					<IconField
						icon={Lock}
						label="Confirm password"
						id="passwordConfirm"
						name="passwordConfirm"
						type={showPassword ? "text" : "password"}
						autoComplete="new-password"
						placeholder="Repeat your password"
						error={fieldErrors.passwordConfirm}
					/>
				)}

				{!isRegister && (
					<a href="/login" className="w-fit cursor-pointer text-sm font-bold text-primary transition-colors hover:text-primary-hover">
						Forgot password?
					</a>
				)}

				<PrimaryButton type="submit" className="mt-1 h-10 text-sm">
					{isRegister ? "Create account" : "Log in"}
				</PrimaryButton>
			</form>

			<div className="my-4 flex items-center gap-3 text-xs font-bold tracking-normal text-text-faint uppercase">
				<span className="h-px flex-1 bg-border" />
				<span>{isRegister ? "Or register with" : "Or use"}</span>
				<span className="h-px flex-1 bg-border" />
			</div>

			<div className="grid grid-cols-2 gap-2 sm:gap-3">
				{providers.map((provider) => {
					const Icon = provider.icon;

					return (
						<GhostButton key={provider.slug} type="button" onClick={() => handleProvider(provider)}>
							<Icon size={16} aria-hidden="true" />
							<span>{provider.name}</span>
						</GhostButton>
					);
				})}
			</div>

			<p className="mt-4 text-center text-sm text-text-muted">
				{isRegister ? "Already have an account?" : "Need an account?"}{" "}
				<button
					type="button"
					onClick={() => switchTo(isRegister ? "login" : "register")}
					className="cursor-pointer font-bold text-primary transition-colors hover:text-primary-hover"
				>
					{isRegister ? "Log in" : "Register"}
				</button>
			</p>

			<MenuPanel open={Boolean(providerSignup)} onClose={() => setProviderSignup(null)} title={providerSignup ? `Register with ${providerSignup.name}` : ""} width="24rem">
				<form action={handleProviderSignup}>
					<IconField
						icon={User}
						label="Username"
						id="provider-username"
						name="name"
						type="text"
						autoComplete="username"
						placeholder="profile-name"
						maxLength={32}
						pattern="[A-Za-z0-9_\-]+"
						value={providerUsername}
						onChange={(event) => {
							setProviderUsername(event.target.value);
							setProviderUsernameError("");
						}}
						error={providerUsernameError}
					/>
					<div className="mt-5 flex justify-end gap-2">
						<GhostButton type="button" onClick={() => setProviderSignup(null)} className="px-4 py-2">
							Cancel
						</GhostButton>
						<PrimaryButton type="submit" className="text-sm">
							Continue with {providerSignup?.name ?? "provider"}
						</PrimaryButton>
					</div>
				</form>
			</MenuPanel>
		</div>
	);
}
