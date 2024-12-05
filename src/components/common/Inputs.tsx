// src/components/common/Inputs.tsx

import React from 'react';
import { Input } from 'antd';
import { NumericFormat } from 'react-number-format';

interface YearInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const YearInput: React.FC<YearInputProps> = ({ value, onChange, placeholder = "YYYY" }) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        onChange?.(values.value);
      }}
      thousandSeparator={false}
      decimalScale={0}
      allowNegative={false}
      maxLength={4}
      placeholder={placeholder}
      customInput={Input}
      className="year-input"
    />
  );
};

interface FilterInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export const FilterInput: React.FC<FilterInputProps> = ({
  value,
  onChange,
  placeholder,
  maxLength
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^a-zA-Z0-9À-ÿ\s\-_.]/g, '');
    onChange?.(newValue);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="filter-input"
    />
  );
};