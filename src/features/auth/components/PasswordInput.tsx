import { useState } from 'react';
import { UI_COPY } from '../../../ui/ui-copy';

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoComplete: string;
  disabled?: boolean;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
};

/** Password field with a visibility toggle. */
export function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  autoComplete,
  disabled,
  placeholder,
  invalid,
  describedBy,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-input">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? UI_COPY.hidePassword : UI_COPY.showPassword}
        aria-pressed={visible}
        disabled={disabled}
      >
        {visible ? UI_COPY.hide : UI_COPY.show}
      </button>
    </span>
  );
}
