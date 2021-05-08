# pusherpoll
1. 투표 사이트 URL
- URL 마지막에 투표 제목으로 사용자가 접속해서 투표
- 중복 투표를 막기 위해 Local Storage에 선택한 결과를 저장
  - http://tongma.herokuapp.com/poll/info/%ED%88%AC%ED%91%9C%20%ED%85%8C%EC%8A%A4%ED%8A%B8
- 팀 목록을 차트에 표시하기 위해서 Mongo DB에 팀별로 zero point를 입력하는 초기화 수행
  - http://tongma.herokuapp.com/poll/zerovote/%ED%88%AC%ED%91%9C%20%ED%85%8C%EC%8A%A4%ED%8A%B8

2. APP 서버
- GitHub의 main branch에 commit이 되면, HEROKU에 사이트에 자동 배포
  - https://dashboard.heroku.com/apps/tongma

3. PUSHER 서버
- 사용자가 투표하면 다른 사용자의 차트에도 결과를 표시하도록 푸시
  - https://dashboard.pusher.com/apps/1182717

4. DB 서버
- 두개 collections에 투표 목록과 사용자 투표 결과를 저장
  - https://cloud.mongodb.com/v2/6069d560db79794ef409be47#metrics/replicaSet/6069d633be30b75b99d2126c/explorer/pusherpoll

![pusherpoll](https://user-images.githubusercontent.com/14818193/117519436-6d858700-afde-11eb-935c-9a2cbdfca965.png)
