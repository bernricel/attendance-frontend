export default function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  options,
  disabled = false,
}) {
  return (
    <label className="field-block" htmlFor={id}>
      <span className="field-label">{label}</span>
      {options ? (
        <select id={id} value={value} onChange={onChange} disabled={disabled}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </label>
  )
}
