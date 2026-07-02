/**
 * Reusable Input component.
 * Props: label, error, type, placeholder, value, onChange, name, required, className, icon, rightElement
 */
export default function Input({
  label,
  error,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  required = false,
  className = '',
  icon: Icon,
  rightElement,
  disabled = false,
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="label" htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            ${error ? 'input-field-error' : 'input-field'}
            ${Icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
