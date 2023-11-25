import React from "react";

interface EmailProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
}

const FieldEmail: React.FC<EmailProps> = ({ value, onChange, error }) => {
  return (
    <div className="form__item">
      <label className="field__label">Email</label>
      <input
        className={`field__input ${error ? "error" : ""}`}
        type="email"
        name="email"
        value={value}
        onChange={onChange}
        placeholder="example@gmail.co|"
      />
      <span className="form__error" id="emailError">
        {error}
      </span>
    </div>
  );
};

export default FieldEmail;
