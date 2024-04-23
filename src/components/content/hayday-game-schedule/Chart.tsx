"use client";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import machines from "./machines.json";
import goods from "./goods.json";

const COLORS = [
  "#abcef5",
  "#95b4e9",
  "#809add",
  "#6d81d1",
  "#5a67c4",
  "#494cb6",
  "#3b2fa9",
];

export default function Chart() {
  const maxLevel = useMemo(() => {
    const maxMachineLevel = Math.max(
      ...machines.map((machine) => machine.Level)
    );
    const maxGoodLevel = Math.max(...goods.map((good) => parseInt(good.level)));
    return Math.max(maxMachineLevel, maxGoodLevel);
  }, []);

  const data = useMemo(() => {
    // {machineCount: 0, goodCount: 0, level: 0}
    const result = [];
    for (let i = 0; i <= maxLevel; i++) {
      result.push({
        level: i,
        machineCount: machines.filter((machine) => machine.Level === i).length,
        goodCount: goods.filter((good) => parseInt(good.level) === i).length,
      });
    }
    // accumulate machineCount and goodCount
    result.forEach((item, index) => {
      if (index > 0) {
        item.machineCount += result[index - 1].machineCount;
        item.goodCount += result[index - 1].goodCount;
      }
    });
    return result;
  }, [maxLevel]);

  return (
    <>
      <ResponsiveContainer height={300}>
        <LineChart
          data={data}
          syncId="1"
          margin={{
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="level"
            label={{
              value: "Level",
              position: "bottom",
              offset: 0,
            }}
          />
          <YAxis
            label={{
              value: "Machine Count",
              angle: -90,
              position: "insideLeft",
              offset: 10,
            }}
          />
          <Tooltip
            labelClassName="text-black"
            formatter={(value) => [value, "Machine Count"]}
          />
          <Line
            dataKey="machineCount"
            dot={false}
            type="monotone"
            stroke={COLORS[3]}
          />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer height={300}>
        <LineChart
          data={data}
          syncId="1"
          margin={{
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="level"
            label={{
              value: "Level",
              position: "bottom",
              offset: 0,
            }}
          />
          <YAxis
            label={{
              value: "Good Count",
              angle: -90,
              offset: 10,
              position: "insideLeft",
            }}
          />
          <Tooltip
            labelClassName="text-black"
            formatter={(value) => [value, "Good Count"]}
          />
          <Line
            dataKey="goodCount"
            dot={false}
            type="monotone"
            stroke={COLORS[3]}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
