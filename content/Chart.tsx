import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } from "recharts";
  
  const COLORS = [
    "#abcef5",
    "#95b4e9",
    "#809add",
    "#6d81d1",
    "#5a67c4",
    "#494cb6",
    "#3b2fa9",
  ];
  
  export function Chart1() {
    return (
      <>
        <p className="text-lg font-medium text-center">
          Số văn bản theo lĩnh vực
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={[
              { linhvuc: "Giáo dục", count: 16755 },
              { linhvuc: "Trách nhiệm hình sự", count: 1642 },
              { linhvuc: "Đầu tư", count: 13565 },
              { linhvuc: "Giao thông - Vận tải", count: 15821 },
              { linhvuc: "Bộ máy hành chính", count: 107027 },
              { linhvuc: "Quyền dân sự", count: 5895 },
              { linhvuc: "Lao động - Tiền lương", count: 15208 },
              { linhvuc: "Xây dựng - Đô thị", count: 22264 },
              { linhvuc: "Tài nguyên - Môi trường", count: 26885 },
              { linhvuc: "Tài chính nhà nước", count: 43387 },
              { linhvuc: "Lĩnh vực khác", count: 9057 },
              { linhvuc: "Thương mại", count: 24369 },
              { linhvuc: "Thủ tục Tố tụng", count: 2586 },
              { linhvuc: "Sở hữu trí tuệ", count: 1118 },
              { linhvuc: "Doanh nghiệp", count: 14181 },
              { linhvuc: "Thể thao - Y tế", count: 20906 },
              { linhvuc: "Xuất nhập khẩu", count: 12944 },
              { linhvuc: "Thuế - Phí - Lệ Phí", count: 19339 },
              { linhvuc: "Công nghệ thông tin", count: 12915 },
              { linhvuc: "Bảo hiểm", count: 3045 },
              { linhvuc: "Bất động sản", count: 21525 },
              { linhvuc: "Tiền tệ - Ngân hàng", count: 6378 },
              { linhvuc: "Văn hóa - Xã hội", count: 39845 },
              { linhvuc: "Dịch vụ pháp lý", count: 2734 },
              { linhvuc: "Vi phạm hành chính", count: 2670 },
              { linhvuc: "Kế toán - Kiểm toán", count: 2043 },
              { linhvuc: "Chứng khoán", count: 1066 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="linhvuc" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS[3]} />
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  }
  
  export function Chart2() {
    const data = [
      { status: "Còn hiệu lực", count: 171822 },
      { status: "Hết hiệu lực", count: 88043 },
      { status: "Không xác định", count: 35951 },
      { status: "Không còn phù hợp", count: 21803 },
      { status: "Chưa xác định", count: 586 },
      { status: "Chưa có hiệu lực", count: 174 },
      { status: "Ngừng hiệu lực", count: 138 },
    ];
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
    }: any) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };
    return (
      <>
        <p className="text-lg font-medium text-center">
          Số văn bản theo tình trạng hiệu lực
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Tooltip />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
            <Pie
              label={renderCustomizedLabel}
              dataKey="count"
              nameKey="status"
              data={data}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </>
    );
  }
  
  export function Chart3() {
    const data = [
      { label: "2018-01", data: 1480 },
      { label: "2018-02", data: 999 },
      { label: "2018-03", data: 1529 },
      { label: "2018-04", data: 1320 },
      { label: "2018-05", data: 1795 },
      { label: "2018-06", data: 1358 },
      { label: "2018-07", data: 1920 },
      { label: "2018-08", data: 1452 },
      { label: "2018-09", data: 1129 },
      { label: "2018-10", data: 1470 },
      { label: "2018-11", data: 1390 },
      { label: "2018-12", data: 2847 },
      { label: "2019-01", data: 1451 },
      { label: "2019-02", data: 886 },
      { label: "2019-03", data: 1431 },
      { label: "2019-04", data: 1286 },
      { label: "2019-05", data: 1465 },
      { label: "2019-06", data: 1382 },
      { label: "2019-07", data: 1909 },
      { label: "2019-08", data: 1269 },
      { label: "2019-09", data: 1103 },
      { label: "2019-10", data: 1328 },
      { label: "2019-11", data: 1281 },
      { label: "2019-12", data: 2892 },
      { label: "2020-01", data: 1348 },
      { label: "2020-02", data: 1426 },
      { label: "2020-03", data: 2043 },
      { label: "2020-04", data: 1683 },
      { label: "2020-05", data: 1373 },
      { label: "2020-06", data: 1477 },
      { label: "2020-07", data: 1947 },
      { label: "2020-08", data: 1533 },
      { label: "2020-09", data: 1408 },
      { label: "2020-10", data: 1423 },
      { label: "2020-11", data: 1352 },
      { label: "2020-12", data: 3286 },
      { label: "2021-01", data: 1596 },
      { label: "2021-02", data: 1239 },
      { label: "2021-03", data: 1916 },
      { label: "2021-04", data: 1549 },
      { label: "2021-05", data: 1593 },
      { label: "2021-06", data: 1763 },
      { label: "2021-07", data: 2152 },
      { label: "2021-08", data: 2416 },
      { label: "2021-09", data: 1812 },
      { label: "2021-10", data: 1750 },
      { label: "2021-11", data: 1790 },
      { label: "2021-12", data: 3897 },
      { label: "2022-01", data: 2029 },
      { label: "2022-02", data: 1194 },
      { label: "2022-03", data: 1936 },
      { label: "2022-04", data: 1801 },
      { label: "2022-05", data: 1681 },
      { label: "2022-06", data: 1727 },
      { label: "2022-07", data: 2504 },
      { label: "2022-08", data: 1851 },
      { label: "2022-09", data: 1590 },
      { label: "2022-10", data: 1690 },
      { label: "2022-11", data: 1667 },
      { label: "2022-12", data: 3226 },
    ];
    return (
      <>
        <p className="text-lg font-medium text-center">
          Số văn bản ban hành theo tháng
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="data" fill={COLORS[3]} />
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  }
  
  export function Chart4() {
    const data = [
      { label: 1924, count: 2 },
      { label: 1926, count: 1 },
      { label: 1929, count: 2 },
      { label: 1930, count: 1 },
      { label: 1944, count: 1 },
      { label: 1945, count: 120 },
      { label: 1946, count: 320 },
      { label: 1947, count: 111 },
      { label: 1948, count: 129 },
      { label: 1949, count: 116 },
      { label: 1950, count: 131 },
      { label: 1951, count: 50 },
      { label: 1952, count: 30 },
      { label: 1953, count: 34 },
      { label: 1954, count: 6 },
      { label: 1955, count: 49 },
      { label: 1956, count: 238 },
      { label: 1957, count: 359 },
      { label: 1958, count: 305 },
      { label: 1959, count: 362 },
      { label: 1960, count: 277 },
      { label: 1961, count: 347 },
      { label: 1962, count: 289 },
      { label: 1963, count: 272 },
      { label: 1964, count: 329 },
      { label: 1965, count: 112 },
      { label: 1966, count: 125 },
      { label: 1967, count: 82 },
      { label: 1968, count: 98 },
      { label: 1969, count: 103 },
      { label: 1970, count: 99 },
      { label: 1971, count: 104 },
      { label: 1972, count: 79 },
      { label: 1973, count: 86 },
      { label: 1974, count: 159 },
      { label: 1975, count: 129 },
      { label: 1976, count: 110 },
      { label: 1977, count: 348 },
      { label: 1978, count: 316 },
      { label: 1979, count: 307 },
      { label: 1980, count: 226 },
      { label: 1981, count: 306 },
      { label: 1982, count: 303 },
      { label: 1983, count: 255 },
      { label: 1984, count: 273 },
      { label: 1985, count: 388 },
      { label: 1986, count: 315 },
      { label: 1987, count: 311 },
      { label: 1988, count: 331 },
      { label: 1989, count: 384 },
      { label: 1990, count: 480 },
      { label: 1991, count: 520 },
      { label: 1992, count: 637 },
      { label: 1993, count: 612 },
      { label: 1994, count: 962 },
      { label: 1995, count: 1094 },
      { label: 1996, count: 1131 },
      { label: 1997, count: 1448 },
      { label: 1998, count: 1936 },
      { label: 1999, count: 2462 },
      { label: 2000, count: 2347 },
      { label: 2001, count: 2621 },
      { label: 2002, count: 2899 },
      { label: 2003, count: 4215 },
      { label: 2004, count: 4766 },
      { label: 2005, count: 4908 },
      { label: 2006, count: 8054 },
      { label: 2007, count: 9568 },
      { label: 2008, count: 10912 },
      { label: 2009, count: 10583 },
      { label: 2010, count: 10287 },
      { label: 2011, count: 11434 },
      { label: 2012, count: 12593 },
      { label: 2013, count: 16164 },
      { label: 2014, count: 17307 },
      { label: 2015, count: 16833 },
      { label: 2016, count: 22009 },
      { label: 2017, count: 18992 },
      { label: 2018, count: 18689 },
      { label: 2019, count: 17683 },
      { label: 2020, count: 20299 },
      { label: 2021, count: 23473 },
      { label: 2022, count: 22896 },
      { label: 2023, count: 8473 },
    ];
    return (
      <>
        <p className="text-lg font-medium text-center">
          Số văn bản ban hành theo năm
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS[3]} />
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  }
  
  export function Chart5() {
    const data = {
      "Quyết định": 192618,
      "Nghị quyết": 31207,
      "Kế hoạch": 23248,
      "Thông tư": 20409,
      "Chỉ thị": 13731,
      "Thông báo": 13492,
      "Nghị định": 7898,
      "Thông tư liên tịch": 3061,
      "Văn bản hợp nhất": 2353,
      "Hướng dẫn": 1792,
      "Báo cáo": 1492,
      "Điều ước quốc tế": 1369,
      "Công điện": 1265,
      "Sắc lệnh": 992,
      Luật: 942,
      "Văn bản khác": 916,
      Lệnh: 793,
      "Pháp lệnh": 351,
      "Quy định": 255,
      "Quy chế": 158,
      "Thông tri": 34,
      "Công ước": 19,
      "Điều lệ": 17,
      "Hiến pháp": 7,
      "Hiệp định": 6,
      "Sắc luật": 5,
      "Thoả thuận": 5,
      "Văn bản WTO": 68,
    };
    const middle_index = Math.floor(Object.keys(data).length / 2);
    return (
      <div>
        <p className="mb-0 font-semibold text-center">
          Số lượng văn bản theo loại văn bản
        </p>
        <div className="flex gap-3">
          <table className="table mt-2">
            <thead>
              <tr>
                <th>Loại văn bản</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data)
                .sort(([, a], [, b]) => b - a)
                .slice(0, middle_index)
                .map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <table className="table mt-2">
            <thead>
              <tr>
                <th>Loại văn bản</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data)
                .sort(([, a], [, b]) => b - a)
                .slice(middle_index)
                .map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  