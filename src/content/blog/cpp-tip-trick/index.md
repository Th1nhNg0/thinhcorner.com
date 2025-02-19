---
title: C++ tips & tricks
date: 2020-11-05
description: Tóm tắt lại vài thủ thuật hay ho mà mình học được khi chuyển từ pascal sang C++. Đa số những thủ thuật này được sử dụng trong CP (Competitive programming).
lang: vi
---

## Mở đầu

Xin chào, bài viết này tóm tắt lại vài thủ thuật hay ho mà mình học được khi chuyển từ pascal sang C++. Đa số những thủ thuật này được sử dụng trong CP (Competitive programming).

## Template mình thường dùng

```cpp
#include <bits/stdc++.h> // inlucde tất cả thư viện có thể sử dụng khi đi CP
using namespace std;

int main()
{
    freopen("input.txt", "r", stdin); // Đọc file bằng cin
    freopen("output.txt", "w", stdout); // Xuất file bằng cout
    ios_base::sync_with_stdio(false); cin.tie(NULL); // Đọc xuất file nhanh
    // Code ở đây



    // Thời gian chạy của thuật toán
    cerr << "time taken : " << (float)clock() / CLOCKS_PER_SEC << " secs \n";
    return 0;
}
```

## Sử dụng marco để code nhanh hơn

Ví dụ:

```cpp
long long x=4;
pair<long long,long long> k;
vector<long long> a;
```

Có thể chuyển thành

```cpp
#define ll long long
ll x=4;
pair<ll, ll> k;
vector<ll> a;
```

## So sánh "endl" và "\n"

```cpp
cout<<endl; // In ký tự xuống dòng và flush stream
cout<<'\n'; // Chỉ in ký tự xuống dòng
```

Ta thấy, sử dụng **'\n'** sẽ nhanh hơn rất nhiều khi in một lượng lớn ký tự xuống dòng.
Thực vậy, thử với 2 chương trình sau:

```cpp
for (int i = 0; i < 1000000; i++)
    cout << endl;
// Run time: 2.463 secs
```

```cpp
for (int i = 0; i < 1000000; i++)
    cout << '\n';
// Run time: 0.093 secs
```

## Hàm ước chung lớn nhất có sẵn

Trong C++, có hàm **\_\_gcd(m,n)** trả về giá trị ước chung lớn nhất của 2 số m và n. Độ phức tạp của thuật toán này là $ O(\log\_{2}{max(n,m)}) $.

## Sử dụng auto

Từ phiên bản C++11 trở về sau, từ khóa auto được dùng để tự động nhận dạng kiểu dữ liệu thông qua kiểu dữ liệu của giá trị khởi tạo ra nó.

```cpp
auto a = 1; // 1 là kiểu int => a kiểu int
auto b = 1.0F; // 1.0F là kiểu float => b kiểu float
auto c = 1.0; // 1.0 là kiểu double => c kiểu double
```

## Độ dài tối đa của array

Khi khai báo array trong hàm **main()** thì độ dài tối đa là $ 10^{6} $ nhưng khi ta khai báo biến toàn cục thì độ dài có thể lên tới $ 10^{7} $.

## Thư viện STL

Thư viện STL là thứ mà mình thấy xịn nhất từ trước tới nay khi mình chuyển từ Pascal qua. Nó gần như giải quyết được mọi vấn đề mà Pascal phải tốn rất nhiều công sức mới làm được ^\_^

### Vector

Vector làm việc giống như một “mảng động”.

Khai báo: **vector\<kiểu_dữ_liệu> tên_biến**.

Sử dụng **vector** sẽ tốt khi:

- Truy cập đến phần tử riêng lẻ thông qu a vị trí của nó $ O(1) $
- Chèn hay xóa ở vị trí cuối cùng $ O(1) $.

[Tìm hiểu thêm về Vector](http://www.cplusplus.com/reference/vector/vector/)

### Priority Queue (Hàng đợi ưu tiên)

Priority queue là một loại container adaptor, được thiết kế đặc biệt để phần tử ở đầu luôn luôn lớn nhất (theo một quy ước về độ ưu tiên nào đó) so với các phần tử khác.

Khai báo:

```cpp
priority_queue < int > pq; // mặc định là lớn nhất
// Sử dụng hàm so sánh khác
priority_queue < int,vector<int>,greater<int> > q;
```

Sử dụng **priority queue** sẽ tốt khi:

- Vừa thêm phần từ, vừa lấy phần tử lớn nhất (nhỏ nhất) ra. Thao tác thêm phần tử chỉ mất $ O(\log{n}) $
- Tăng tốc độ thuật toán Dijkstra

[Tìm hiểu thêm về Priority Queue](http://www.cplusplus.com/reference/queue/priority_queue/)

### Set

Set là một loại associative containers để lưu trữ các phần tử không bị trùng lặp (unique elements), và các phần tử này chính là các khóa (keys).

Khai báo tương tự **Priority Queue**:

```cpp
set <int> s;
set <int, greater<int> > s;
```

[Tìm hiểu thêm về Set](http://www.cplusplus.com/reference/set/set/?kw=set)

### Map

Map là một loại associative container. Mỗi phần tử của map là sự kết hợp của khóa (key value) và ánh xạ của nó (mapped value). Cũng giống như set, trong map không chứa các khóa mang giá trị giống nhau.

Khai báo:

```cpp
map < kieu_du_lieu_1 , kieu_du_lieu_2 > m;
// kieu_du_lieu_1 là khóa, kieu_du_lieu_2 là giá trị của khóa.

//Sử dụng class so sánh:
struct cmp{
 bool operator() (char a,char b) {return a<b;}
};
map <char,int,cmp> m;
```

[Tìm hiểu thêm về Map](http://www.cplusplus.com/reference/map/map/?kw=map)

### Thư viện thuật toán

Khai báo sử dụng: **#include \<algorithm>**

#### Sắp xếp

sort: sắp xếp đoạn phần tử theo một trình tự nào đó. Mặc định của sort là sử dụng operator \<.

Bạn có thể sử dụng hàm so sánh, hay class so sánh tự định nghĩa để sắp xếp cho linh hoạt.

```cpp
int myints[] = {32,71,12,45,26,80,53,33};
sort (myints, myints+4); // (12 32 45 71)26 80 53 33
sort (myints, myints+8); // 12 26 32 33 45 53 71 80
```

#### Tìm kiếm nhị phân

- **binary_search**: tìm kiếm xem khóa có trong đoạn cần tìm không. _Lưu ý_: đoạn tìm kiếm phải được sắp xếp theo một trật tự nhất đinh. Nếu tìm được sẽ return true, ngược lại return false.

  Dạng 1: binary_search(vị trí bắt đầu, vị trí kết thúc, khóa)

  Dạng 2: binary_search(vị trí bắt đầu, vị trí kết thúc, khóa, phép so sánh)

- **lower_bound**: trả về iterator đến phần tử đầu tiên trong nửa đoạn [first,last] mà không bé hơn khóa tìm kiếm.

  Dạng 1: lower_bound( vị trí bắt đầu, vị trí kết thúc, khóa )

  Dạng 2: lower_bound( vị trí bắt đầu, vị trí kết thúc, khóa , phép toán so sánh)

- **upper_bound**: trả về iterator đến phần tử đầu tiên trong nửa đoạn [first,last] mà lớn hơn khóa tìm kiếm.

  Dạng 1: upper_bound( vị trí bắt đầu, vị trí kết thúc, khóa )

  Dạng 2: upper_bound( vị trí bắt đầu, vị trí kết thúc, khóa , phép toán so sánh)

Và còn nhiều thuật toán nữa.
[Xem thêm về thư viện thuật toán](http://www.cplusplus.com/reference/algorithm/)

### Xem thêm thư viện STL

http://www.cplusplus.com/reference/stl/?kw=stl
