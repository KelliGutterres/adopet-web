import styles from './AuthForm.module.css';

export default function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  placeholder,
  name,
  icon,
  maxLength,
  className,
}) {
  const wrapClass = [styles.inputWrap, icon ? '' : styles.noIcon].filter(Boolean).join(' ');
  const fieldClass = [styles.field, className].filter(Boolean).join(' ');

  return (
    <div className={fieldClass}>
      <label htmlFor={id}>{label}</label>
      <div className={wrapClass}>
        {icon ? <span className={styles.iconLeft}>{icon}</span> : null}
        <input
          id={id}
          type={type}
          name={name}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
}
