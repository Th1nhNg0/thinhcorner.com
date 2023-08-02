import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Title as ChartTitle,
  Colors,
  Legend,
  LinearScale,
  PieController,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PieController,
  ArcElement,
  Legend,
  Tooltip,
  ChartTitle,
  Colors
);

export function Chart1() {
  return (
    <Bar
      data={{
        datasets: [
          {
            data: [
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
            ],
          },
        ],
      }}
      options={{
        maintainAspectRatio: true,
        aspectRatio: 4 / 3,
        parsing: {
          xAxisKey: "linhvuc",
          yAxisKey: "count",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
          title: {
            display: true,
            text: "Số lượng văn bản theo lĩnh vực",
          },
        },
      }}
    />
  );
}

export function Chart2() {
  return (
    <Pie
      data={{
        labels: [
          "Còn hiệu lực",
          "Hết hiệu lực",
          "Không xác định",
          "Không còn phù hợp",
          "Chưa xác định",
          "Chưa có hiệu lực",
          "Ngừng hiệu lực",
        ],
        datasets: [
          {
            data: [171822, 88043, 35951, 21803, 586, 174, 138],
          },
        ],
      }}
      options={{
        maintainAspectRatio: true,
        aspectRatio: 5 / 3,

        plugins: {
          tooltip: {
            enabled: true,
          },
          legend: {
            display: true,
            position: "right",
          },
          title: {
            display: true,
            text: "Số lượng văn bản theo tình trạng hiệu lực",
          },
        },
      }}
    />
  );
}

export function Chart3() {
  return (
    <Bar
      data={{
        labels: [
          "2018-01",
          "2018-02",
          "2018-03",
          "2018-04",
          "2018-05",
          "2018-06",
          "2018-07",
          "2018-08",
          "2018-09",
          "2018-10",
          "2018-11",
          "2018-12",
          "2019-01",
          "2019-02",
          "2019-03",
          "2019-04",
          "2019-05",
          "2019-06",
          "2019-07",
          "2019-08",
          "2019-09",
          "2019-10",
          "2019-11",
          "2019-12",
          "2020-01",
          "2020-02",
          "2020-03",
          "2020-04",
          "2020-05",
          "2020-06",
          "2020-07",
          "2020-08",
          "2020-09",
          "2020-10",
          "2020-11",
          "2020-12",
          "2021-01",
          "2021-02",
          "2021-03",
          "2021-04",
          "2021-05",
          "2021-06",
          "2021-07",
          "2021-08",
          "2021-09",
          "2021-10",
          "2021-11",
          "2021-12",
          "2022-01",
          "2022-02",
          "2022-03",
          "2022-04",
          "2022-05",
          "2022-06",
          "2022-07",
          "2022-08",
          "2022-09",
          "2022-10",
          "2022-11",
          "2022-12",
        ],
        datasets: [
          {
            data: [
              1480, 999, 1529, 1320, 1795, 1358, 1920, 1452, 1129, 1470, 1390,
              2847, 1451, 886, 1431, 1286, 1465, 1382, 1909, 1269, 1103, 1328,
              1281, 2892, 1348, 1426, 2043, 1683, 1373, 1477, 1947, 1533, 1408,
              1423, 1352, 3286, 1596, 1239, 1916, 1549, 1593, 1763, 2152, 2416,
              1812, 1750, 1790, 3897, 2029, 1194, 1936, 1801, 1681, 1727, 2504,
              1851, 1590, 1690, 1667, 3226,
            ],
          },
        ],
      }}
      options={{
        maintainAspectRatio: true,
        aspectRatio: 16 / 9,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
          title: {
            display: true,
            text: "Số lượng văn bản ban hành theo tháng",
          },
        },
      }}
    />
  );
}

export function Chart4() {
  return (
    <Bar
      data={{
        labels: [
          1924, 1926, 1929, 1930, 1944, 1945, 1946, 1947, 1948, 1949, 1950,
          1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961,
          1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972,
          1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983,
          1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994,
          1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005,
          2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
          2017, 2018, 2019, 2020, 2021, 2022, 2023,
        ],
        datasets: [
          {
            data: [
              2, 1, 2, 1, 1, 120, 320, 111, 129, 116, 131, 50, 30, 34, 6, 49,
              238, 359, 305, 362, 277, 347, 289, 272, 329, 112, 125, 82, 98,
              103, 99, 104, 79, 86, 159, 129, 110, 348, 316, 307, 226, 306, 303,
              255, 273, 388, 315, 311, 331, 384, 480, 520, 637, 612, 962, 1094,
              1131, 1448, 1936, 2462, 2347, 2621, 2899, 4215, 4766, 4908, 8054,
              9568, 10912, 10583, 10287, 11434, 12593, 16164, 17307, 16833,
              22009, 18992, 18689, 17683, 20299, 23473, 22896, 8473,
            ],
          },
        ],
      }}
      options={{
        maintainAspectRatio: true,
        aspectRatio: 16 / 9,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
          title: {
            display: true,
            text: "Số lượng văn bản ban hành theo năm",
          },
        },
      }}
    />
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
