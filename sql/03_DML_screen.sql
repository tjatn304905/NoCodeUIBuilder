-- ============================================================
-- No-Code UI Builder  |  DML – 화면 마스터 / 화면 컴포넌트 / 화면 이력
-- ============================================================
-- UUID 규칙 (32자, 중복 방지 체계)
--   SCRN_M     : sc + 2자리 화면번호 + 패딩
--   SCRN_CMP_D : sd + 2자리 화면번호 + 3자리 컴포넌트순번 + 패딩
--   SCRN_H     : sh + 2자리 화면번호 + 패딩
--
-- 화면 번호: 01=Customer Lookup, 02=Mobile Signup, 03=Product Showcase
-- ============================================================


-- ──────────────────────────────────────────
-- [1] UI 화면 마스터  (3개 화면)
-- ──────────────────────────────────────────
INSERT INTO TB_PFCM_UI_SCRN_M
    (UI_SCRN_ID, UI_SCRN_NM, ACTV_VER_NO, USE_YN)
VALUES
('sc010000000000000000000000000000', 'Customer Lookup',   1, 'Y'),
('sc020000000000000000000000000000', 'Mobile Signup',     1, 'Y'),
('sc030000000000000000000000000000', 'Product Showcase',  1, 'Y');


-- ──────────────────────────────────────────
-- [2-A] 화면 컴포넌트 상세 – Screen 01 : Customer Lookup
-- ──────────────────────────────────────────
-- 구성: container > label, data-grid, action-button
-- ──────────────────────────────────────────
INSERT INTO TB_PFCM_UI_SCRN_CMP_D
    (UI_SCRN_CMP_ID, UI_SCRN_ID, UI_CMP_ID, CMP_FLD_ID, HPOS_CMP_FLD_ID,
     XS_CRDN_VLUE_CNTN, YS_CRDN_VLUE_CNTN, XS_LEN_VLUE_CNTN, YS_LEN_VLUE_CNTN,
     EVET_JSON_CNTN, SPEC_JSON_CNTN)
VALUES

-- container (루트)
('sd010010000000000000000000000000', 'sc010000000000000000000000000000', 'cm010000000000000000000000000000',
 'mainContainer', NULL,
 0, 0, 1280, 720,
 NULL,
 '{"showBorder": false, "showBackground": true, "padding": 24, "bgColor": "#f8fafc"}'),

-- label – 화면 제목
('sd010020000000000000000000000000', 'sc010000000000000000000000000000', 'cm080000000000000000000000000000',
 'titleLabel', 'mainContainer',
 24, 24, 600, 48,
 NULL,
 '{"text": "Customer Lookup", "preset": "h1", "color": "#1e293b", "fontWeight": "bold", "icon": "user"}'),

-- text-input – 검색어
('sd010030000000000000000000000000', 'sc010000000000000000000000000000', 'cm030000000000000000000000000000',
 'searchInput', 'mainContainer',
 24, 88, 400, 80,
 NULL,
 '{"label": "Search", "placeholder": "Enter customer name or ID", "inputType": "text", "maxLength": 100}'),

-- action-button – 검색
('sd010040000000000000000000000000', 'sc010000000000000000000000000000', 'cm140000000000000000000000000000',
 'searchBtn', 'mainContainer',
 440, 88, 160, 80,
 '{"onClick": [{"type": "api-call", "target": "searchCustomer", "params": {"keyword": "$searchInput"}}]}',
 '{"label": "Search", "actionType": "api-call", "icon": "search", "colorPreset": "primary"}'),

-- divider
('sd010050000000000000000000000000', 'sc010000000000000000000000000000', 'cm110000000000000000000000000000',
 'divider1', 'mainContainer',
 24, 184, 1232, 20,
 NULL,
 '{"orientation": "horizontal", "color": "#e2e8f0", "thickness": 1}'),

-- data-grid – 검색 결과
('sd010060000000000000000000000000', 'sc010000000000000000000000000000', 'cm120000000000000000000000000000',
 'resultGrid', 'mainContainer',
 24, 216, 1232, 440,
 '{"onRowClick": [{"type": "navigate", "target": "customerDetail", "params": {"id": "$row.id"}}]}',
 '{"columns": [{"field":"id","header":"ID","width":120},{"field":"name","header":"Name","width":200},{"field":"email","header":"Email","width":240},{"field":"status","header":"Status","width":120}], "selectionMode": "single", "isEditable": false, "allowAddRow": false, "allowDeleteRow": false, "isReadOnly": true, "pagination": true, "pageSize": 20, "dataSourcePath": "$.customerList"}'),

-- status-badge – 상태 표시
('sd010070000000000000000000000000', 'sc010000000000000000000000000000', 'cm100000000000000000000000000000',
 'statusBadge', 'mainContainer',
 24, 672, 200, 40,
 NULL,
 '{"label": "Active", "tone": "success"}'),

-- action-button – 내보내기
('sd010080000000000000000000000000', 'sc010000000000000000000000000000', 'cm140000000000000000000000000000',
 'exportBtn', 'mainContainer',
 1056, 672, 200, 40,
 '{"onClick": [{"type": "api-call", "target": "exportCSV"}]}',
 '{"label": "Export CSV", "actionType": "api-call", "icon": "check", "colorPreset": "secondary"}'),

-- action-button – 초기화
('sd010090000000000000000000000000', 'sc010000000000000000000000000000', 'cm140000000000000000000000000000',
 'resetBtn', 'mainContainer',
 872, 672, 160, 40,
 '{"onClick": [{"type": "reset"}]}',
 '{"label": "Reset", "actionType": "reset", "icon": "refresh", "colorPreset": "dark"}'),

-- data-fact – 검색 결과 건수
('sd010100000000000000000000000000', 'sc010000000000000000000000000000', 'cm090000000000000000000000000000',
 'resultCount', 'mainContainer',
 240, 672, 200, 40,
 NULL,
 '{"label": "Total", "value": "0", "displayMode": "side-by-side", "dataPath": "$.customerList.length"}');


-- ──────────────────────────────────────────
-- [2-B] 화면 컴포넌트 상세 – Screen 02 : Mobile Signup
-- ──────────────────────────────────────────
-- 구성: container > label, text-input×3, combo-box, radio-group, checkbox-group, action-button
-- ──────────────────────────────────────────
INSERT INTO TB_PFCM_UI_SCRN_CMP_D
    (UI_SCRN_CMP_ID, UI_SCRN_ID, UI_CMP_ID, CMP_FLD_ID, HPOS_CMP_FLD_ID,
     XS_CRDN_VLUE_CNTN, YS_CRDN_VLUE_CNTN, XS_LEN_VLUE_CNTN, YS_LEN_VLUE_CNTN,
     EVET_JSON_CNTN, SPEC_JSON_CNTN)
VALUES

-- container (루트)
('sd020010000000000000000000000000', 'sc020000000000000000000000000000', 'cm010000000000000000000000000000',
 'signupContainer', NULL,
 0, 0, 480, 760,
 NULL,
 '{"showBorder": true, "showBackground": true, "padding": 32, "bgColor": "#ffffff"}'),

-- label – 타이틀
('sd020020000000000000000000000000', 'sc020000000000000000000000000000', 'cm080000000000000000000000000000',
 'signupTitle', 'signupContainer',
 0, 0, 416, 48,
 NULL,
 '{"text": "Create Account", "preset": "h2", "color": "#0f172a", "fontWeight": "bold", "icon": "none"}'),

-- text-input – 이름
('sd020030000000000000000000000000', 'sc020000000000000000000000000000', 'cm030000000000000000000000000000',
 'nameInput', 'signupContainer',
 0, 64, 416, 80,
 NULL,
 '{"label": "Full Name", "placeholder": "Enter your name", "inputType": "text", "maxLength": 50}'),

-- text-input – 이메일
('sd020040000000000000000000000000', 'sc020000000000000000000000000000', 'cm030000000000000000000000000000',
 'emailInput', 'signupContainer',
 0, 160, 416, 80,
 NULL,
 '{"label": "Email", "placeholder": "you@example.com", "inputType": "email", "maxLength": 100}'),

-- text-input – 비밀번호
('sd020050000000000000000000000000', 'sc020000000000000000000000000000', 'cm030000000000000000000000000000',
 'passwordInput', 'signupContainer',
 0, 256, 416, 80,
 NULL,
 '{"label": "Password", "placeholder": "Min 8 characters", "inputType": "password", "maxLength": 50}'),

-- combo-box – 국가
('sd020060000000000000000000000000', 'sc020000000000000000000000000000', 'cm040000000000000000000000000000',
 'countrySelect', 'signupContainer',
 0, 352, 416, 80,
 NULL,
 '{"label": "Country", "options": "KR=Korea,US=United States,JP=Japan,CN=China,GB=United Kingdom"}'),

-- radio-group – 계정 유형
('sd020070000000000000000000000000', 'sc020000000000000000000000000000', 'cm050000000000000000000000000000',
 'accountType', 'signupContainer',
 0, 448, 416, 80,
 NULL,
 '{"label": "Account Type", "options": "personal=Personal,business=Business"}'),

-- checkbox-group – 약관동의
('sd020080000000000000000000000000', 'sc020000000000000000000000000000', 'cm060000000000000000000000000000',
 'agreementCheck', 'signupContainer',
 0, 544, 416, 80,
 NULL,
 '{"label": "Agreements", "options": "terms=I agree to Terms of Service,privacy=I agree to Privacy Policy"}'),

-- action-button – 가입
('sd020090000000000000000000000000', 'sc020000000000000000000000000000', 'cm140000000000000000000000000000',
 'submitBtn', 'signupContainer',
 0, 640, 416, 80,
 '{"onClick": [{"type": "submit", "target": "signupForm"}]}',
 '{"label": "Sign Up", "actionType": "submit", "icon": "none", "colorPreset": "primary"}'),

-- divider
('sd020100000000000000000000000000', 'sc020000000000000000000000000000', 'cm110000000000000000000000000000',
 'divider1', 'signupContainer',
 0, 608, 416, 20,
 NULL,
 '{"orientation": "horizontal", "color": "#e2e8f0", "thickness": 1}');


-- ──────────────────────────────────────────
-- [2-C] 화면 컴포넌트 상세 – Screen 03 : Product Showcase
-- ──────────────────────────────────────────
-- 구성: container > label, card-list-repeater, date-picker, action-button, divider, data-fact
-- ──────────────────────────────────────────
INSERT INTO TB_PFCM_UI_SCRN_CMP_D
    (UI_SCRN_CMP_ID, UI_SCRN_ID, UI_CMP_ID, CMP_FLD_ID, HPOS_CMP_FLD_ID,
     XS_CRDN_VLUE_CNTN, YS_CRDN_VLUE_CNTN, XS_LEN_VLUE_CNTN, YS_LEN_VLUE_CNTN,
     EVET_JSON_CNTN, SPEC_JSON_CNTN)
VALUES

-- container (루트)
('sd030010000000000000000000000000', 'sc030000000000000000000000000000', 'cm010000000000000000000000000000',
 'showcaseContainer', NULL,
 0, 0, 1280, 800,
 NULL,
 '{"showBorder": false, "showBackground": true, "padding": 32, "bgColor": "#f1f5f9"}'),

-- label – 타이틀
('sd030020000000000000000000000000', 'sc030000000000000000000000000000', 'cm080000000000000000000000000000',
 'showcaseTitle', 'showcaseContainer',
 0, 0, 800, 48,
 NULL,
 '{"text": "Product Showcase", "preset": "h1", "color": "#0f172a", "fontWeight": "bold", "icon": "list"}'),

-- date-picker – 기간 필터
('sd030030000000000000000000000000', 'sc030000000000000000000000000000', 'cm070000000000000000000000000000',
 'datePicker', 'showcaseContainer',
 820, 0, 320, 80,
 NULL,
 '{"label": "From Date", "placeholder": "Select date", "dateFormat": "YYYY-MM-DD"}'),

-- action-button – 필터 적용
('sd030040000000000000000000000000', 'sc030000000000000000000000000000', 'cm140000000000000000000000000000',
 'filterBtn', 'showcaseContainer',
 1160, 0, 200, 80,
 '{"onClick": [{"type": "api-call", "target": "loadProducts", "params": {"from": "$datePicker"}}]}',
 '{"label": "Filter", "actionType": "api-call", "icon": "search", "colorPreset": "primary"}'),

-- divider
('sd030050000000000000000000000000', 'sc030000000000000000000000000000', 'cm110000000000000000000000000000',
 'divider1', 'showcaseContainer',
 0, 96, 1216, 20,
 NULL,
 '{"orientation": "horizontal", "color": "#cbd5e1", "thickness": 1}'),

-- card-list-repeater – 상품 카드
('sd030060000000000000000000000000', 'sc030000000000000000000000000000', 'cm130000000000000000000000000000',
 'productCards', 'showcaseContainer',
 0, 128, 1216, 560,
 '{"onCardClick": [{"type": "navigate", "target": "productDetail", "params": {"id": "$card.id"}}]}',
 '{"dataSourcePath": "$.productList", "cardTitle": "$.name", "cardBadge": "$.category", "cardPrice": "$.price", "cardPriceUnit": "USD", "cardDescription": "$.description", "cardFacts": "$.specs", "cardButtonText": "View Details", "accentColor": "#3b82f6", "cardWidth": 280}'),

-- data-fact – 상품 수
('sd030070000000000000000000000000', 'sc030000000000000000000000000000', 'cm090000000000000000000000000000',
 'productCount', 'showcaseContainer',
 0, 704, 240, 60,
 NULL,
 '{"label": "Products", "value": "0", "displayMode": "side-by-side", "dataPath": "$.productList.length"}'),

-- action-button – 신규 상품 추가
('sd030080000000000000000000000000', 'sc030000000000000000000000000000', 'cm140000000000000000000000000000',
 'addProductBtn', 'showcaseContainer',
 976, 704, 240, 60,
 '{"onClick": [{"type": "navigate", "target": "productCreate"}]}',
 '{"label": "Add Product", "actionType": "navigate", "icon": "plus", "colorPreset": "success"}');


-- ──────────────────────────────────────────
-- [3] UI 화면 이력  (각 화면 초기 버전 1)
-- ──────────────────────────────────────────
INSERT INTO TB_PFCM_UI_SCRN_H
    (UI_SCRN_HIST_ID, UI_SCRN_ID, VER_NO, SCRN_JSON_CNTN, FRST_STRG_DTTM)
VALUES

-- Screen 01 : Customer Lookup  v1
('sh010000000000000000000000000000', 'sc010000000000000000000000000000', 1,
 '{"screenId":"sc010000000000000000000000000000","screenName":"Customer Lookup","version":1,"components":["sd010010000000000000000000000000","sd010020000000000000000000000000","sd010030000000000000000000000000","sd010040000000000000000000000000","sd010050000000000000000000000000","sd010060000000000000000000000000","sd010070000000000000000000000000","sd010080000000000000000000000000","sd010090000000000000000000000000","sd010100000000000000000000000000"]}',
 '2026-04-02 09:00:00'),

-- Screen 02 : Mobile Signup  v1
('sh020000000000000000000000000000', 'sc020000000000000000000000000000', 1,
 '{"screenId":"sc020000000000000000000000000000","screenName":"Mobile Signup","version":1,"components":["sd020010000000000000000000000000","sd020020000000000000000000000000","sd020030000000000000000000000000","sd020040000000000000000000000000","sd020050000000000000000000000000","sd020060000000000000000000000000","sd020070000000000000000000000000","sd020080000000000000000000000000","sd020090000000000000000000000000","sd020100000000000000000000000000"]}',
 '2026-04-02 09:00:00'),

-- Screen 03 : Product Showcase  v1
('sh030000000000000000000000000000', 'sc030000000000000000000000000000', 1,
 '{"screenId":"sc030000000000000000000000000000","screenName":"Product Showcase","version":1,"components":["sd030010000000000000000000000000","sd030020000000000000000000000000","sd030030000000000000000000000000","sd030040000000000000000000000000","sd030050000000000000000000000000","sd030060000000000000000000000000","sd030070000000000000000000000000","sd030080000000000000000000000000"]}',
 '2026-04-02 09:00:00');
