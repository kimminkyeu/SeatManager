# ◾ 공연장 좌석 배치도 에디터

| **인원 및 기간**           | 2인 (FE / BE 공동 작업) / 24.05.24 ~ 06.10 |
| --- | --- |
| **사용 언어 / 모듈** | Typescript / React / Tailwind |
| **데모 동영상** | ✨✨  [유투브 데모 영상](https://www.youtube.com/watch?v=XyO63n25vpI) ✨✨ |

![에디터에서 생성한 공연장 모습](https://github.com/user-attachments/assets/f0cd0fb2-8f3e-475a-af73-2b680587b6a1)
에디터에서 생성한 공연장 모습

# ◾ 좌석배치도 에디터의 배경

![image](https://github.com/user-attachments/assets/2fac2947-234b-464d-bf73-d986b2d8b223)

### ◾ **Fabric.js 라이브러리 객체의 확장**

---

[Fabric.js](http://fabricjs.com/)는 HTML5 캔버스 API 보다 사용성과 가독성이 좋고, 모든 객체들이 **상속 관계로 정의**되어 있습니다. 

따라서 에디터 프로그램 구현 시 **다형성의 이점을 활용**할 수 있다 판단하여 코어 모듈로 선택했습니다.

- 모든 캔버스 도형들은 **fabric.Object** 의 자식입니다.
    
    ```jsx
    const canvas = new fabric.Canvas();       // 1. 캔버스 생성
    canvas.add( new fabric.Circle() );        // 2. 원 그리기
    ```
    
- 라이브러리 캔버스에 좌석을 그리기 위해 **fabric.Object** 타입을 상속 받습니다.
    
    ```jsx
    class Seat extends fabric.Object {...};   // 3. 좌석 클래스 정의
    canvas.add( **new Seat()** );                 // 4 원 그리기
    ```
    

### 상세 설명은 아래 링크에서 확인할 수 있습니다.
- [노션 상세 설명 페이지](https://kyeu.notion.site/025dfd5a09364e86bc23b3da2adf13ba?pvs=4)

