import React from "react";

interface PasswordProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  placeholder: string;
  showPassword: boolean;
  label: string;
  onTogglePassword: () => void;
}

const FieldPassword: React.FC<PasswordProps> = ({
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
  placeholder,
  label,
}) => {
  return (
    <div className="form__item">
      <label className="field__label">{label}</label>
      <div className="field__wrapper">
        <input
          className={`field__input ${error ? "error" : ""}`}
          type={showPassword ? "text" : "password"}
          name="password"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <span
          className={`field__icon ${showPassword ? "show" : ""}`}
          onClick={onTogglePassword}></span>
      </div>
      <span className="form__error" id="passwordError">
        {error}
      </span>
    </div>
  );
};

export default FieldPassword;
