import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-neutral-300 hover:text-white hover:border-neutral-600') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
