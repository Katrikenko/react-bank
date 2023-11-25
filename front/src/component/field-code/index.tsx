import React from "react";

interface CodeProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
}

const FieldCode: React.FC<CodeProps> = ({ value, onChange, error }) => {
  return (
    <div className="form__item">
      <label className="field__label">Code</label>
      <input
        className={`field__input ${error ? "error" : ""}`}
        type="number"
        name="code"
        value={value}
        onChange={onChange}
        placeholder="123456"
      />
      <span className="form__error" id="codeError">
        {error}
      </span>
    </div>
  );
};

export default FieldCode;
