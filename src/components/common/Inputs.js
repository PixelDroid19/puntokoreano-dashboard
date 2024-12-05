import { jsx as _jsx } from "react/jsx-runtime";
import { Input } from 'antd';
import { NumericFormat } from 'react-number-format';
export const YearInput = ({ value, onChange, placeholder = "YYYY" }) => {
    return (_jsx(NumericFormat, { value: value, onValueChange: (values) => {
            onChange?.(values.value);
        }, thousandSeparator: false, decimalScale: 0, allowNegative: false, maxLength: 4, placeholder: placeholder, customInput: Input, className: "year-input" }));
};
export const FilterInput = ({ value, onChange, placeholder, maxLength }) => {
    const handleChange = (e) => {
        const newValue = e.target.value.replace(/[^a-zA-Z0-9À-ÿ\s\-_.]/g, '');
        onChange?.(newValue);
    };
    return (_jsx(Input, { value: value, onChange: handleChange, placeholder: placeholder, maxLength: maxLength, className: "filter-input" }));
};
