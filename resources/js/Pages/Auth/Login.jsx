import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Centered content with minimal styling */}
            <div className="flex flex-col items-center justify-center min-h-screen py-12 px-6 lg:px-8">
                {/* Logo */}
                <div className="mb-6">
                    <img src="/AccountsParadiseLogo.png" alt="Accounts Paradise" className="w-32 h-32" />
                </div>

                {/* Status Message */}
                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <div className="w-full max-w-md">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email or Username */}
                        <div>
                            <InputLabel htmlFor="login" value="Email or Username" />

                            <TextInput
                                id="login"
                                name="login"
                                value={data.login}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                                autoComplete="username"
                                isFocused
                                onChange={(e) => setData('login', e.target.value)}
                                required
                            />

                            <InputError message={errors.login} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Remember me */}
                        <div className="block">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    Forgot your password?
                                </Link>
                            )}

                            <PrimaryButton disabled={processing}>
                                Log in
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Register Link */}
                    <div className="text-center text-sm text-gray-600">
                        <span>Don't have an account?</span>
                        <Link
                            href="/register"
                            className="text-sm text-blue-600 underline hover:text-blue-800"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
