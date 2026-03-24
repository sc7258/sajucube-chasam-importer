# Spec 05 — 수동 입력 화면 (ManualInputPage)

## 파일 위치

`src/pages/ManualInputPage.tsx`

## 라우트

`/manual`

## 목적

JSON 파일 없이 1건씩 직접 입력해서:
- 6개 명식 날짜를 계산하고
- JSON을 생성하거나
- saju-cube DB에 직접 저장하는 화면

## 현재 화면 구성

- `UserIdInput` 사용자 확인
- 이름 / 성별 / 생년월일 / 양력·음력 / 생시 / 메모 입력
- 계산 결과 미리보기
- `JSON 생성` 버튼
- `DB에 저장` 버튼
- 저장 후 split 검증 결과 메시지
- 중복 인물 감지 시 확인 모달

## 필드

| 필드 | 필수 | 입력 방식 |
|---|---|---|
| 이름 | ✅ | text input |
| 성별 | ✅ | radio (남성/여성) |
| 생년월일 | ✅ | 숫자 3개 입력 (year/month/day) |
| 음양력 | ✅ | radio (양력/음력) |
| 생시 (hour) | ❌ | select 또는 time input 기반 입력 |
| 분 (minute) | ❌ | number input (0~59) |
| 메모 | ❌ | textarea |

## 시간 처리

- 시간 입력에 따라 시(時) 배지가 함께 표시된다.
- 저장/계산 시 `hour`, `minute`가 `sydtoso24yd()`와 additionalDates pillar 계산에 함께 사용된다.

## 6개 명식 미리보기

- 입력값 변경 시 계산 결과를 기반으로 6개 날짜를 구성한다.
- `calculateAutoDates()` 결과를 보여준다.
- 각 additional date는 저장 시 day/month pillar도 함께 계산된다.

## 저장 동작

- 저장 전 `fetchPersonsByUser()`로 같은 사용자 내 중복 인물 조회
- 이름 + 생년월일 기준 중복이 있으면 확인 모달 표시
- 1건 중복일 때는 기존 메모와 새 메모를 합쳐 저장하는 옵션 제공
- 저장 후 `fetchPersonById()`로 재조회해 split payload 비교
- 일치하면 success 메시지에 "생성된 json과 일치합니다." 표시
- 불일치하면 경고 메시지와 diff 목록 표시

## 유효성 검사

- 이름 비어있으면 저장 버튼 비활성화
- 사용자 확인이 완료되지 않으면 DB 저장 버튼 비활성화
- 연도: 1600~2100
- 월: 1~12
- 일: 1~31 (기본 검증, 실제 유효성은 계산 시 체크)
- 음력 입력 시 `lunartosolar()` 결과로 날짜 유효성 확인

## JSON 생성

- DB 저장 없이 split 포맷 JSON 다운로드 가능
- 사용자 확인 없이도 JSON 생성 가능
- 파일명은 `manual-이름-YYYY-MM-DD.json` 형식

## 현재 문서상 주의점

- 이 화면은 단순 "저장"만 하는 화면이 아니다.
- 현재는 JSON 생성, 중복 체크, 메모 병합 저장, split 검증까지 포함한다.
