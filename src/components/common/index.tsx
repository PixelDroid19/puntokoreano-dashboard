import React from "react";
import { Input, Button } from "antd";
import { NumericFormat } from "react-number-format";
import styled from "styled-components";

// Custom Input Component
export const CustomInput = styled(Input).attrs({
  type: "text", // Aseguramos que el tipo sea "text" por defecto
})`
  border-radius: 6px;

  &:hover {
    border-color: #40a9ff;
  }

  &.ant-input-focused {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

// Custom Button Component
export const CustomButton = styled(Button)`
  border-radius: 6px;

  &.ant-btn-link {
    padding: 4px 8px;

    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }
  }
`;

export const YearInput = (props, ref) => (
  <NumericFormat
    {...props}
    getInputRef={ref}
    allowNegative={false}
    decimalScale={0}
    maxLength={4}
    placeholder="YYYY"
    customInput={CustomInput}
    onValueChange={(values) => {
      // Pasar el valor como string a la función onChange
      if (props.onChange) {
        props.onChange(values.value as string);
      }
    }}
    className="year-input"
  />
);
