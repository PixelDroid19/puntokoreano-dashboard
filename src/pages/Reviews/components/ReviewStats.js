import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { ShoppingOutlined, WarningOutlined } from "@ant-design/icons";
import { Card, Rate, Statistic, Row, Col, Typography } from "antd";
const { Text } = Typography;
const ReviewStats = ({ stats }) => {
    // Validate stats to prevent undefined errors
    if (!stats || !stats.overall) {
        return null;
    }
    const { overall, statusDistribution, reported } = stats;
    return (_jsxs(Row, { gutter: [16, 16], className: "mb-6", children: [_jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Total Reviews", value: overall.totalReviews, suffix: _jsxs(Text, { type: "secondary", className: "text-sm", children: ["(", statusDistribution?.approved?.count ?? 0, " aprobadas)"] }) }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Calificaci\u00F3n Promedio", value: overall.avgRating, precision: 1, prefix: _jsx(Rate, { disabled: true, defaultValue: overall.avgRating, count: 1 }) }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Compras Verificadas", value: overall.verifiedCount, prefix: _jsx(ShoppingOutlined, { className: "text-green-500" }) }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Reviews Reportadas", value: reported, prefix: _jsx(WarningOutlined, { className: "text-red-500" }) }) }) })] }));
};
export default ReviewStats;
