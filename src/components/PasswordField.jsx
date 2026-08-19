import { useState } from 'react';
import { EyeIcon, EyeOffIcon, LockIcon } from './AuthIcons.jsx';
import styles from './AuthForm.module.css';

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = 'Digite sua senha',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={`${styles.inputWrap} ${styles.hasToggle}`}>
        <span className={styles.iconLeft}>
          <LockIcon />
        </span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
