import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  LinearScale,
  Title,
  Tooltip,
  PieController,
  ArcElement,
  Legend,
  ChartData,
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
  Title,
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
        aspectRatio: 4 / 3,

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
