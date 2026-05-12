import { useState } from 'react';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function Input({ label, error, id, className = '', as: Comp = 'input', type, passwordToggle, ...rest }) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || rest.name || label?.replace(/\s+/g, '-').toLowerCase();
  const isPasswordField = Comp === 'input' && type === 'password' && passwordToggle;
  const resolvedType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  const fieldClassName = `w-full rounded-xl border bg-white py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
    error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
  } ${Comp === 'textarea' ? 'min-h-[120px] resize-y px-4' : ''} ${
    isPasswordField ? 'px-4 pr-12' : Comp === 'input' ? 'px-4' : ''
  }`;

  const field = (
    <Comp id={inputId} type={resolvedType} className={fieldClassName} {...rest} />
  );

  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      ) : null}
      {isPasswordField ? (
        <div className="relative">
          {field}
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      ) : (
        field
      )}
      {error ? <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
    </label>
  );
}
