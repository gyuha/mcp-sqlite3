## 데이터베이스 연결

![Database Client](./images/database-client.png)

## MCP 연결

ChatGpt 창에서 `agent 모드 ①`를 선택 합니다.
![MCP](./images/mcp-1.png)
그리고, model 중에서 추천하는 모델은 'Claude 3.7 Sonnet'입니다.
claude로 에이전트를 사용 할 때 가장 지속적으로 작업을 오래 해 줍니다
다른 모델을 사용 하셔도 됩니다.
좀 더 빠른 결과 값을 바라면 'Claude 3.5', 

`도구 선택 ②`을 하면 아래와 같은 다이얼로그가 나옵니다.
![MCP](./images/mcp-2.png)

여기서 Database Client가 나오면 작업을 시작 할 수 있습니다.


## 실습 #1
`Ctrl+/`를 누르고나 `컨텍스트 추가`버튼을 눌러 줍니다.

도구 > dbclient-excuteQuery를 선택합니다

![alt text](./images/mcp-3.png)

프롬프트를 아래와 같이 넣어 줍니다.
### 데이터 베이스 분석
```
연결 된 DB의 내용을 확인 하고 어떤 용도의 DB인지 알려 줘
```

### 리포트 작성 하기
```
연결 된 DB를 분석 하고 분석 내용으로 report.md 파일을 작성 해 줘
```

### 데이터베이스 분석 html 만들기
```
report.md 파일을 참고 하고, 연결 된 DB의 데이터를 분석 하고 분석 내용으로 docs 폴더에 분석 리포트 홈페이지를 만들어줘. 
데이터를 분석한 내용 중 수치로 나오는 부분은 chat.js를 이용 챠트로 만들어 줘
```
