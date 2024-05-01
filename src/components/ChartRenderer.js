import React from 'react';
import PropTypes from 'prop-types';
import { useCubeQuery } from '@cubejs-client/react';
import { Spin, Row, Col, Statistic, Table } from 'antd';
import {
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { useDeepCompareMemo } from 'use-deep-compare';
const CartesianChart = ({ resultSet, children, ChartComponent }) => (
  <ResponsiveContainer width="100%" height={350}>
    <ChartComponent data={resultSet.chartPivot()}>
      <XAxis dataKey="x" />
      <YAxis />
      <CartesianGrid />
      {children}
      <Legend />
      <Tooltip />
    </ChartComponent>
  </ResponsiveContainer>
);
const colors = ['#FF6492', '#141446', '#7A77FF'];
const stackedChartData = (resultSet) => {
  const data = resultSet
    .pivot()
    .map(({ xValues, yValuesArray }) =>
      yValuesArray.map(([yValues, m]) => ({
        x: resultSet.axisValuesString(xValues, ', '),
        color: resultSet.axisValuesString(yValues, ', '),
        measure: m && Number.parseFloat(m),
      }))
    )
    .reduce((a, b) => a.concat(b), []);
  return data;
};
const formatTableData = (columns, data) => {
  function flatten(columns = []) {
    return columns.reduce((memo, column) => {
      if (column.children) {
        return [...memo, ...flatten(column.children)];
      }
      return [...memo, column];
    }, []);
  }
  const typeByIndex = flatten(columns).reduce((memo, column) => {
    return {
      ...memo,
      [column.dataIndex]: column,
    };
  }, {});
  function formatValue(value, { type, format } = {}) {
    if (value == undefined) {
      return value;
    }
    if (type === 'boolean') {
      if (typeof value === 'boolean') {
        return value.toString();
      } else if (typeof value === 'number') {
        return Boolean(value).toString();
      }
      return value;
    }
    if (type === 'number' && format === 'percent') {
      return [parseFloat(value).toFixed(2), '%'].join('');
    }
    return value.toString();
  }
  function format(row) {
    return Object.fromEntries(
      Object.entries(row).map(([dataIndex, value]) => {
        return [dataIndex, formatValue(value, typeByIndex[dataIndex])];
      })
    );
  }
  return data.map(format);
};
const TableRenderer = ({ resultSet, pivotConfig }) => {
  const [tableColumns, dataSource] = useDeepCompareMemo(() => {
    const columns = resultSet.tableColumns(pivotConfig);
    return [
      columns,
      formatTableData(columns, resultSet.tablePivot(pivotConfig)),
    ];
  }, [resultSet, pivotConfig]);
  return (
    <Table pagination={false} columns={tableColumns} dataSource={dataSource} />
  );
};
const TypeToChartComponent = {
  line: ({ resultSet }) => {
    return (
      <CartesianChart resultSet={resultSet} ChartComponent={LineChart}>
        {resultSet.seriesNames().map((series, i) => (
          <Line
            key={series.key}
            stackId="a"
            dataKey={series.key}
            name={series.title}
            stroke={colors[i]}
          />
        ))}
      </CartesianChart>
    );
  },
  bar: ({ resultSet }) => {
    return (
      <CartesianChart resultSet={resultSet} ChartComponent={BarChart}>
        {resultSet.seriesNames().map((series, i) => (
          <Bar
            key={series.key}
            stackId="a"
            dataKey={series.key}
            name={series.title}
            fill={colors[i]}
          />
        ))}
      </CartesianChart>
    );
  },
  area: ({ resultSet }) => {
    return (
      <CartesianChart resultSet={resultSet} ChartComponent={AreaChart}>
        {resultSet.seriesNames().map((series, i) => (
          <Area
            key={series.key}
            stackId="a"
            dataKey={series.key}
            name={series.title}
            stroke={colors[i]}
            fill={colors[i]}
          />
        ))}
      </CartesianChart>
    );
  },
  pie: ({ resultSet }) => {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            isAnimationActive={false}
            data={resultSet.chartPivot()}
            nameKey="x"
            dataKey={resultSet.seriesNames()[0].key}
            fill="#8884d8"
          >
            {resultSet.chartPivot().map((e, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  },
  number: ({ resultSet }) => {
    return (
      <Row
        type="flex"
        justify="center"
        align="middle"
        style={{
          height: '100%',
        }}
      >
        <Col>
          {resultSet.seriesNames().map((s) => (
            <Statistic value={resultSet.totalRow()[s.key]} />
          ))}
        </Col>
      </Row>
    );
  },
  table: ({ resultSet, pivotConfig }) => {
    return <TableRenderer resultSet={resultSet} pivotConfig={pivotConfig} />;
  },
};
const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
  .map((key) => ({
    [key]: React.memo(TypeToChartComponent[key]),
  }))
  .reduce((a, b) => ({
    ...a,
    ...b,
  }));
const renderChart =
  (Component) =>
  ({ resultSet, error, pivotConfig }) =>
    (resultSet && (
      <Component resultSet={resultSet} pivotConfig={pivotConfig} />
    )) ||
    (error && error.toString()) || <Spin />;
const ChartRenderer = ({ vizState }) => {
  const { query, chartType, pivotConfig } = vizState;
  const component = TypeToMemoChartComponent[chartType];
  const renderProps = useCubeQuery(query);
  return (
    component &&
    renderChart(component)({
      ...renderProps,
      pivotConfig,
    })
  );
};
ChartRenderer.propTypes = {
  vizState: PropTypes.object,
  cubejsApi: PropTypes.object,
};
ChartRenderer.defaultProps = {
  vizState: {},
  cubejsApi: null,
};
export default ChartRenderer;
