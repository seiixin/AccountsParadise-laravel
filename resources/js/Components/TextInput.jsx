import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-blue-600 focus:ring-blue-600 focus:ring-1 ' +
                className
            }
            ref={localRef}
        />
    );
});
