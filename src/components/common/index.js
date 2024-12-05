import { jsx as _jsx } from "react/jsx-runtime";
// src/components/common/index.tsx
import React from 'react';
import { Input, Button } from 'antd';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
// Custom Input Component
export const CustomInput = styled(Input) `
  border-radius: 6px;
  
  &:hover {
    border-color: #40a9ff;
  }
  
  &.ant-input-focused {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;
// Custom Button Component
export const CustomButton = styled(Button) `
  border-radius: 6px;
  
  &.ant-btn-link {
    padding: 4px 8px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }
  }
`;
export const YearInput = React.forwardRef((props, ref) => (_jsx(NumericFormat, { ...props, getInputRef: ref, allowNegative: false, decimalScale: 0, maxLength: 4, placeholder: "YYYY", format: "####", customInput: CustomInput, onValueChange: (values) => {
        props.onChange?.(values.value);
    }, className: "year-input" })));
