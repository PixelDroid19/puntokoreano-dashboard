import { ShoppingOutlined, WarningOutlined } from "@ant-design/icons";
import { Card, Rate, Statistic, Row, Col, Typography } from "antd";

const { Text } = Typography;

interface ReviewStatsProps {
  stats: {
    statusDistribution: Record<string, { count: number; avgRating: number }>;
    overall: {
      totalReviews: number;
      avgRating: number;
      verifiedCount: number;
    };
    reported: number;
  };
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  // Validate stats to prevent undefined errors
  if (!stats || !stats.overall) {
    return null;
  }

  const { overall, statusDistribution, reported } = stats;

  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Total Reviews"
            value={overall.totalReviews}
            suffix={
              <Text type="secondary" className="text-sm">
                ({statusDistribution?.approved?.count ?? 0} aprobadas)
              </Text>
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Calificación Promedio"
            value={overall.avgRating}
            precision={1}
            prefix={
              <Rate disabled defaultValue={overall.avgRating} count={1} />
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Compras Verificadas"
            value={overall.verifiedCount}
            prefix={<ShoppingOutlined className="text-green-500" />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Reviews Reportadas"
            value={reported}
            prefix={<WarningOutlined className="text-red-500" />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ReviewStats;
