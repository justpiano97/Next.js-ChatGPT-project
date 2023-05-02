import React, { ChangeEvent } from "react";

type InputProps = {
  name?: string;
  value?: string;
  disabled?: boolean;
  isEditable?: boolean;
  placeholder?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  register: any;
};

const Input: React.FC<InputProps> = ({
  name,
  value,
  isEditable = false,
  disabled = false,
  onChange,
  register,
  placeholder,
  error,
}) => {
  return (
    <>
      <input
        type="text"
        name={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-md py-2 bg-transparent outline-none ${
          !isEditable ? "border-none ring-0 px-0" : "border px-2 mt-2"
        }`}
        onChange={onChange}
        {...register(name)}
      />
      {!!error && <p className="text-sm text-red-500">{error}</p>}
    </>
  );
};

export default Input;
