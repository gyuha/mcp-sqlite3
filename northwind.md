# Northwind 데이터베이스 분석 보고서

## 개요
Northwind 데이터베이스는 가상의 무역 회사인 "Northwind Traders"의 영업 데이터를 포함하고 있는 샘플 데이터베이스입니다. 이 보고서는 Northwind 데이터베이스의 구조와 주요 통계를 분석하여 제공합니다.

분석 날짜: 2025년 5월 17일

## 데이터베이스 구조

Northwind 데이터베이스는 다음 13개의 테이블로 구성되어 있습니다:

1. `Customer` - 고객 정보
2. `Product` - 제품 정보
3. `Order` - 주문 정보
4. `OrderDetail` - 주문 상세 정보
5. `Employee` - 직원 정보
6. `Category` - 제품 카테고리
7. `Supplier` - 공급업체 정보
8. `Shipper` - 운송업체 정보
9. `Region` - 지역 정보
10. `Territory` - 영업 지역 정보
11. `EmployeeTerritory` - 직원과 영업 지역 간의 관계
12. `CustomerCustomerDemo` - 고객 데모그래픽 관계
13. `CustomerDemographic` - 고객 데모그래픽 정보

## 주요 테이블 구조

### Customer 테이블
- 주요 필드: Id, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax
- 전체 고객 수: 91명

### Product 테이블
- 주요 필드: Id, ProductName, SupplierId, CategoryId, QuantityPerUnit, UnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel, Discontinued
- 전체 제품 수: 77개

### Order 테이블
- 주요 필드: Id, CustomerId, EmployeeId, OrderDate, RequiredDate, ShippedDate, ShipVia, Freight, ShipName, ShipAddress, ShipCity, ShipRegion, ShipPostalCode, ShipCountry
- 전체 주문 수: 830건

### OrderDetail 테이블
- 주요 필드: Id, OrderId, ProductId, UnitPrice, Quantity, Discount
- 전체 주문 상세 항목 수: 2,155건

### Employee 테이블
- 주요 필드: Id, LastName, FirstName, Title, TitleOfCourtesy, BirthDate, HireDate, Address, City, Region, PostalCode, Country, HomePhone, Extension, Photo, Notes, ReportsTo, PhotoPath
- 전체 직원 수: 9명

### Category 테이블
- 주요 필드: Id, CategoryName, Description
- 전체 카테고리 수: 8개

### Supplier 테이블
- 주요 필드: Id, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax, HomePage
- 전체 공급업체 수: 29개

## 데이터 분석 결과

### 1. 제품 카테고리별 분석

| 카테고리명 | 제품 수 | 평균 가격 | 최대 가격 | 최소 가격 |
|------------|---------|-----------|-----------|-----------|
| Confections | 13 | $25.16 | $81.00 | $9.20 |
| Seafood | 12 | $20.68 | $62.50 | $6.00 |
| Condiments | 12 | $23.06 | $43.90 | $10.00 |
| Beverages | 12 | $37.98 | $263.50 | $4.50 |
| Dairy Products | 10 | $28.73 | $55.00 | $2.50 |
| Grains/Cereals | 7 | $20.25 | $38.00 | $7.00 |
| Meat/Poultry | 6 | $54.01 | $123.79 | $7.45 |
| Produce | 5 | $32.37 | $53.00 | $10.00 |

**관찰:**
- `Confections`(과자류) 카테고리가 가장 많은 제품(13개)을 보유하고 있습니다.
- `Meat/Poultry`(육류/가금류) 카테고리가 평균 $54.01로 가장 높은 평균 가격을 가지고 있습니다.
- `Beverages`(음료) 카테고리에는 가장 비싼 제품($263.50)이 포함되어 있습니다.
- `Dairy Products`(유제품) 카테고리에는 가장 저렴한 제품($2.50)이 포함되어 있습니다.

### 2. 연도별 주문 분석

| 연도 | 주문 수 | 총 운송비 | 평균 운송비 |
|------|---------|-----------|------------|
| 2012 | 152 | $10,279.87 | $67.63 |
| 2013 | 408 | $32,468.77 | $79.58 |
| 2014 | 270 | $22,194.05 | $82.20 |

**관찰:**
- 2013년에 가장 많은 주문(408건)이 이루어졌습니다.
- 평균 운송비는 매년 증가하는 추세를 보이고 있습니다.
- 2014년의 데이터는 연말까지 완전하지 않을 수 있으므로, 2013년과 비교하여 주문 수가 감소한 것처럼 보입니다.

### 3. 국가별 주문 분석 (상위 10개국)

| 국가 | 주문 수 |
|------|---------|
| USA | 122 |
| Germany | 122 |
| France | 73 |
| Brazil | 70 |
| UK | 56 |
| Venezuela | 46 |
| Austria | 40 |
| Sweden | 37 |
| Canada | 30 |
| Italy | 28 |

**관찰:**
- 미국과 독일이 각각 122건으로 가장 많은 주문을 생성했습니다.
- 상위 10개국이 전체 주문의 약 75%를 차지하고 있습니다.
- 유럽 국가들이 상위 10개국 중 6개를 차지하고 있습니다.

### 4. 직원별 판매 실적

| 직원명 | 처리한 주문 수 | 총 판매액 |
|--------|---------------|-----------|
| Margaret Peacock | 420 | $232,890.85 |
| Janet Leverling | 321 | $202,812.84 |
| Nancy Davolio | 345 | $192,107.60 |
| Andrew Fuller | 241 | $166,537.76 |
| Laura Callahan | 260 | $126,862.28 |
| Robert King | 176 | $124,568.24 |
| Anne Dodsworth | 107 | $77,308.07 |
| Michael Suyama | 168 | $73,913.13 |
| Steven Buchanan | 117 | $68,792.28 |

**관찰:**
- Margaret Peacock가 가장 많은 주문(420건)을 처리했으며, 가장 높은 총 판매액($232,890.85)을 기록했습니다.
- 직원들의 주문 처리 수와 총 판매액 사이에는 상관관계가 있지만, 일부 직원들은 적은 주문으로도 높은 판매액을 기록했습니다.
- 상위 3명의 직원이 전체 판매액의 약 50%를 담당하고 있습니다.

## 결론 및 시사점

1. **제품 다양성**: Northwind는 8개의 카테고리에 걸쳐 다양한 제품을 제공하고 있으며, 특히 과자류, 해산물, 조미료, 음료 카테고리에 중점을 두고 있습니다.

2. **가격 전략**: 카테고리별로 가격 전략이 다르며, 육류/가금류와 음료 카테고리는 고가 전략을, 유제품과 해산물은 넓은 가격 범위를 가지고 있습니다.

3. **성장 추세**: 2012년부터 2013년까지 주문량이 크게 증가했으며, 이는 사업 확장을 나타냅니다.

4. **국제적 영업**: 주요 시장은 미국, 독일을 포함한 유럽 국가들이며, 향후 아시아 및 기타 지역으로의 확장 가능성이 있습니다.

5. **직원 생산성**: 일부 직원들의 높은 생산성이 전체 판매에 크게 기여하고 있으므로, 이들의 판매 기법과 고객 관리 방식을 분석하여 다른 직원들에게도 적용할 수 있을 것입니다.

6. **운송비 증가**: 평균 운송비가 매년 증가하고 있으므로, 운송 방식과 물류 최적화에 대한 검토가 필요합니다.

이 분석은 Northwind 데이터베이스의 핵심 측면을 다루고 있으며, 더 자세한 분석을 위해서는 추가적인 데이터 마이닝과 다양한 비즈니스 질문에 대한 조사가 필요합니다.
