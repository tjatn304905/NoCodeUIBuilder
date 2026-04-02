-- ============================================================
-- No-Code UI Builder  |  DML – 화면 마스터 / 화면 컴포넌트 / 화면 이력
-- ============================================================
-- UUID 규칙 (32자, 중복 방지 체계)
--   SCRN_M     : sc + 2자리 화면번호 + 28자리 '0' 패딩
--   SCRN_CMP_D : sd + 2자리 화면번호 + 3자리 컴포넌트순번 + 25자리 '0' 패딩
--   SCRN_H     : sh + 2자리 화면번호 + 28자리 '0' 패딩
--
-- 화면 번호: 01=Customer Lookup, 02=Mobile Signup, 03=Product Showcase
--
-- ★ SPEC_JSON_CNTN : common props (label, hAlign, vAlign, hiddenCon, readonlyCon)
--                     + specific props (컴포넌트 고유 속성) 합친 JSON
-- ★ EVET_JSON_CNTN : {"onPageLoad":[], "onClick":[], "onChange":[]} 구조
-- ★ HPOS_CMP_FLD_ID: 부모 컴포넌트의 id (예: "cmp_1") — NULL이면 루트
-- ★ layout 값      : grid 단위 (demoTemplates.js 원본 기준, scale 전)
-- ★ SCRN_H JSON    : {screenInfo, logic, components[]} 빌더 내보내기 원본 포맷
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


-- ════════════════════════════════════════════════════════════
-- [2-A] Screen 01 : Customer Lookup  (21 components)
-- ════════════════════════════════════════════════════════════
INSERT INTO TB_PFCM_UI_SCRN_CMP_D
    (UI_SCRN_CMP_ID, UI_SCRN_ID, UI_CMP_ID, CMP_FLD_ID, HPOS_CMP_FLD_ID,
     XS_CRDN_VLUE_CNTN, YS_CRDN_VLUE_CNTN, XS_LEN_VLUE_CNTN, YS_LEN_VLUE_CNTN,
     EVET_JSON_CNTN, SPEC_JSON_CNTN)
VALUES

-- ── Header Container ── cmp_1
('sd010010000000000000000000000000', 'sc010000000000000000000000000000', 'cm010000000000000000000000000000',
 'header_section', NULL,
 0, 0, 40, 6,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","showBorder":true,"showBackground":true,"padding":6,"bgColor":"#0f172a"}'),

-- cmp_2 label – title
('sd010020000000000000000000000000', 'sc010000000000000000000000000000', 'cm080000000000000000000000000000',
 'title_main', 'cmp_1',
 0, 0, 30, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Customer Lookup","preset":"h2","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"user"}'),

-- cmp_3 status-badge
('sd010030000000000000000000000000', 'sc010000000000000000000000000000', 'cm100000000000000000000000000000',
 'sys_status', 'cmp_1',
 30, 0, 8, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Online","hAlign":"right","vAlign":"middle","hiddenCon":"","readonlyCon":"","tone":"success"}'),

-- cmp_4 label – subtitle
('sd010040000000000000000000000000', 'sc010000000000000000000000000000', 'cm080000000000000000000000000000',
 'subtitle', 'cmp_1',
 0, 3, 38, 2,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Search customer accounts by name, phone, or plan type","preset":"small","customFontSize":0,"color":"#64748b","fontWeight":"normal","icon":"none"}'),

-- ── Search Section Container ── cmp_10
('sd010050000000000000000000000000', 'sc010000000000000000000000000000', 'cm010000000000000000000000000000',
 'search_section', NULL,
 0, 7, 40, 16,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}'),

-- cmp_11 label – Search Filters
('sd010060000000000000000000000000', 'sc010000000000000000000000000000', 'cm080000000000000000000000000000',
 'search_title', 'cmp_10',
 0, 0, 38, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Search Filters","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"search"}'),

-- cmp_12 text-input – Customer Name
('sd010070000000000000000000000000', 'sc010000000000000000000000000000', 'cm030000000000000000000000000000',
 'cust_name', 'cmp_10',
 0, 3, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Customer Name","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","placeholder":"Enter customer name","maxLength":120,"inputType":"text","mask":""}'),

-- cmp_13 text-input – Phone Number
('sd010080000000000000000000000000', 'sc010000000000000000000000000000', 'cm030000000000000000000000000000',
 'cust_phone', 'cmp_10',
 20, 3, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Phone Number","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","placeholder":"010-0000-0000","maxLength":13,"inputType":"tel","mask":"000-0000-0000"}'),

-- cmp_14 combo-box – Plan Type
('sd010090000000000000000000000000', 'sc010000000000000000000000000000', 'cm040000000000000000000000000000',
 'plan_filter', 'cmp_10',
 0, 8, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Plan Type","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","options":"All, 5G Premium, 5G Standard, LTE Basic, LTE Plus"}'),

-- cmp_15 action-button – Search
('sd010100000000000000000000000000', 'sc010000000000000000000000000000', 'cm140000000000000000000000000000',
 'btn_search', 'cmp_10',
 0, 12, 12, 3,
 '{"onPageLoad":[],"onClick":[{"type":"orderEvent","eventId":"oe_1","params":"","resultVariable":"searchResults","resultPath":""}],"onChange":[]}',
 '{"label":"Search","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","actionType":"api-call","icon":"search","colorPreset":"primary","params":"customer_name:$cust_name.value, phone:$cust_phone.value","customBgColor":"#3b82f6","customTextColor":"#ffffff"}'),

-- cmp_16 action-button – Reset
('sd010110000000000000000000000000', 'sc010000000000000000000000000000', 'cm140000000000000000000000000000',
 'btn_reset', 'cmp_10',
 13, 12, 12, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Reset","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","actionType":"navigate","icon":"refresh","colorPreset":"secondary","params":"","customBgColor":"#3b82f6","customTextColor":"#ffffff"}'),

-- ── Customer Info Container ── cmp_20
('sd010120000000000000000000000000', 'sc010000000000000000000000000000', 'cm010000000000000000000000000000',
 'info_section', NULL,
 0, 24, 40, 14,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}'),

-- cmp_21 label – Customer Information
('sd010130000000000000000000000000', 'sc010000000000000000000000000000', 'cm080000000000000000000000000000',
 'info_title', 'cmp_20',
 0, 0, 26, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Customer Information","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"folder"}'),

-- cmp_22 status-badge – Active
('sd010140000000000000000000000000', 'sc010000000000000000000000000000', 'cm100000000000000000000000000000',
 'cust_badge', 'cmp_20',
 30, 0, 8, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Active","hAlign":"right","vAlign":"middle","hiddenCon":"","readonlyCon":"","tone":"success"}'),

-- cmp_23 data-fact – Current Plan
('sd010150000000000000000000000000', 'sc010000000000000000000000000000', 'cm090000000000000000000000000000',
 'cust_plan', 'cmp_20',
 0, 4, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Current Plan","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","value":"5G Premium","displayMode":"side-by-side","dataPath":"@apiData.user.plan","valuePath":"","bgColor":"#1e293b"}'),

-- cmp_24 data-fact – Balance
('sd010160000000000000000000000000', 'sc010000000000000000000000000000', 'cm090000000000000000000000000000',
 'cust_balance', 'cmp_20',
 20, 4, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Balance","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","value":"89,000","displayMode":"side-by-side","dataPath":"@apiData.user.balance","valuePath":"","bgColor":"#1e293b"}'),

-- cmp_25 data-fact – Account ID
('sd010170000000000000000000000000', 'sc010000000000000000000000000000', 'cm090000000000000000000000000000',
 'acc_id', 'cmp_20',
 0, 9, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Account ID","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","value":"ACC-2024-0042","displayMode":"side-by-side","dataPath":"@apiData.account.id","valuePath":"","bgColor":"#1e293b"}'),

-- cmp_26 data-fact – Credit Rating
('sd010180000000000000000000000000', 'sc010000000000000000000000000000', 'cm090000000000000000000000000000',
 'credit_rating', 'cmp_20',
 20, 9, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Credit Rating","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","value":"A+","displayMode":"side-by-side","dataPath":"@apiData.account.credit","valuePath":"","bgColor":"#1e293b"}'),

-- cmp_30 divider
('sd010190000000000000000000000000', 'sc010000000000000000000000000000', 'cm110000000000000000000000000000',
 'divider_1', NULL,
 0, 39, 40, 1,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Divider","hAlign":"center","vAlign":"middle","hiddenCon":"","readonlyCon":"","color":"#334155","orientation":"horizontal","thickness":1}'),

-- cmp_31 label – Subscription History title
('sd010200000000000000000000000000', 'sc010000000000000000000000000000', 'cm080000000000000000000000000000',
 'grid_title', NULL,
 0, 40, 30, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Subscription History","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"list"}'),

-- cmp_32 data-grid – Subscription History
('sd010210000000000000000000000000', 'sc010000000000000000000000000000', 'cm120000000000000000000000000000',
 'sub_history_grid', NULL,
 0, 43, 40, 14,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Data Grid","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","columns":[{"header":"Name","field":"name"},{"header":"Status","field":"status"},{"header":"Plan","field":"plan"},{"header":"Amount","field":"amount"}],"selectionMode":"single","isEditable":false,"allowAddRow":false,"allowDeleteRow":false,"isReadOnly":true,"pagination":true,"pageSize":10,"dataSourcePath":"@apiData.response.customers"}');


-- ════════════════════════════════════════════════════════════
-- [2-B] Screen 02 : Mobile Signup  (19 components)
-- ════════════════════════════════════════════════════════════
INSERT INTO TB_PFCM_UI_SCRN_CMP_D
    (UI_SCRN_CMP_ID, UI_SCRN_ID, UI_CMP_ID, CMP_FLD_ID, HPOS_CMP_FLD_ID,
     XS_CRDN_VLUE_CNTN, YS_CRDN_VLUE_CNTN, XS_LEN_VLUE_CNTN, YS_LEN_VLUE_CNTN,
     EVET_JSON_CNTN, SPEC_JSON_CNTN)
VALUES

-- ── Header Container ── cmp_1
('sd020010000000000000000000000000', 'sc020000000000000000000000000000', 'cm010000000000000000000000000000',
 'header_section', NULL,
 0, 0, 40, 6,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","showBorder":true,"showBackground":true,"padding":6,"bgColor":"#0f172a"}'),

-- cmp_2 label – title
('sd020020000000000000000000000000', 'sc020000000000000000000000000000', 'cm080000000000000000000000000000',
 'title_main', 'cmp_1',
 0, 0, 30, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Mobile Signup","preset":"h2","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"user"}'),

-- cmp_3 label – subtitle
('sd020030000000000000000000000000', 'sc020000000000000000000000000000', 'cm080000000000000000000000000000',
 'subtitle', 'cmp_1',
 0, 3, 38, 2,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Register a new mobile subscriber — fill out the form and choose a payment method","preset":"small","customFontSize":0,"color":"#64748b","fontWeight":"normal","icon":"none"}'),

-- ── Personal Info Container ── cmp_10
('sd020040000000000000000000000000', 'sc020000000000000000000000000000', 'cm010000000000000000000000000000',
 'personal_section', NULL,
 0, 7, 40, 20,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}'),

-- cmp_11 label – Personal Information
('sd020050000000000000000000000000', 'sc020000000000000000000000000000', 'cm080000000000000000000000000000',
 'personal_title', 'cmp_10',
 0, 0, 38, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Personal Information","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"user"}'),

-- cmp_12 text-input – Full Name
('sd020060000000000000000000000000', 'sc020000000000000000000000000000', 'cm030000000000000000000000000000',
 'full_name', 'cmp_10',
 0, 3, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Full Name","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","placeholder":"Enter full name","maxLength":120,"inputType":"text","mask":""}'),

-- cmp_13 text-input – Phone Number
('sd020070000000000000000000000000', 'sc020000000000000000000000000000', 'cm030000000000000000000000000000',
 'phone_input', 'cmp_10',
 20, 3, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Phone Number","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","placeholder":"010-0000-0000","maxLength":13,"inputType":"tel","mask":"000-0000-0000"}'),

-- cmp_14 text-input – Email Address
('sd020080000000000000000000000000', 'sc020000000000000000000000000000', 'cm030000000000000000000000000000',
 'email_input', 'cmp_10',
 0, 8, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Email Address","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","placeholder":"user@example.com","maxLength":200,"inputType":"email","mask":""}'),

-- cmp_15 date-picker – Date of Birth
('sd020090000000000000000000000000', 'sc020000000000000000000000000000', 'cm070000000000000000000000000000',
 'birth_date', 'cmp_10',
 20, 8, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Date of Birth","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","placeholder":"YYYY-MM-DD","dateFormat":"YYYY-MM-DD"}'),

-- cmp_16 text-input – Address
('sd020100000000000000000000000000', 'sc020000000000000000000000000000', 'cm030000000000000000000000000000',
 'address_input', 'cmp_10',
 0, 13, 38, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Address","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","placeholder":"Street, City, Province, Postal Code","maxLength":300,"inputType":"text","mask":""}'),

-- ── Plan Selection Container ── cmp_20
('sd020110000000000000000000000000', 'sc020000000000000000000000000000', 'cm010000000000000000000000000000',
 'plan_section', NULL,
 0, 28, 40, 12,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}'),

-- cmp_21 label – Select Plan
('sd020120000000000000000000000000', 'sc020000000000000000000000000000', 'cm080000000000000000000000000000',
 'plan_title', 'cmp_20',
 0, 0, 38, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Select Plan","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"star"}'),

-- cmp_22 combo-box – Plan Type
('sd020130000000000000000000000000', 'sc020000000000000000000000000000', 'cm040000000000000000000000000000',
 'plan_select', 'cmp_20',
 0, 3, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Plan Type","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","options":"5G Premium, 5G Standard, LTE Basic, LTE Plus"}'),

-- cmp_23 radio-group – Contract Period
('sd020140000000000000000000000000', 'sc020000000000000000000000000000', 'cm050000000000000000000000000000',
 'contract_period', 'cmp_20',
 20, 3, 18, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Contract Period","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","options":"12 Months, 24 Months, No Contract"}'),

-- cmp_24 checkbox-group – Add-ons
('sd020150000000000000000000000000', 'sc020000000000000000000000000000', 'cm060000000000000000000000000000',
 'addons', 'cmp_20',
 0, 8, 38, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Add-ons","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","options":"VoLTE, International Roaming, Data Plus, Insurance"}'),

-- cmp_30 accordion – Payment Methods
('sd020160000000000000000000000000', 'sc020000000000000000000000000000', 'cm020000000000000000000000000000',
 'payment_accordion', NULL,
 0, 41, 40, 16,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Accordion","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","title":"Payment Methods","panels":"Credit Card, Bank Transfer, Auto-Pay Settings","activePanel":"Credit Card"}'),

-- cmp_35 divider
('sd020170000000000000000000000000', 'sc020000000000000000000000000000', 'cm110000000000000000000000000000',
 'divider_1', NULL,
 0, 58, 40, 1,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Divider","hAlign":"center","vAlign":"middle","hiddenCon":"","readonlyCon":"","color":"#334155","orientation":"horizontal","thickness":1}'),

-- cmp_40 action-button – Submit
('sd020180000000000000000000000000', 'sc020000000000000000000000000000', 'cm140000000000000000000000000000',
 'btn_submit', NULL,
 0, 60, 40, 3,
 '{"onPageLoad":[],"onClick":[{"type":"orderEvent","eventId":"oe_1","params":"","resultVariable":"isSubmitted","resultPath":""}],"onChange":[]}',
 '{"label":"Submit Signup Application","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","actionType":"submit","icon":"check","colorPreset":"primary","params":"","customBgColor":"#3b82f6","customTextColor":"#ffffff"}');


-- ════════════════════════════════════════════════════════════
-- [2-C] Screen 03 : Product Showcase  (17 components)
-- ════════════════════════════════════════════════════════════
INSERT INTO TB_PFCM_UI_SCRN_CMP_D
    (UI_SCRN_CMP_ID, UI_SCRN_ID, UI_CMP_ID, CMP_FLD_ID, HPOS_CMP_FLD_ID,
     XS_CRDN_VLUE_CNTN, YS_CRDN_VLUE_CNTN, XS_LEN_VLUE_CNTN, YS_LEN_VLUE_CNTN,
     EVET_JSON_CNTN, SPEC_JSON_CNTN)
VALUES

-- ── Header Container ── cmp_1
('sd030010000000000000000000000000', 'sc030000000000000000000000000000', 'cm010000000000000000000000000000',
 'header_section', NULL,
 0, 0, 40, 7,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","showBorder":true,"showBackground":true,"padding":6,"bgColor":"#0f172a"}'),

-- cmp_2 label – title
('sd030020000000000000000000000000', 'sc030000000000000000000000000000', 'cm080000000000000000000000000000',
 'title_main', 'cmp_1',
 0, 0, 30, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Product Showcase","preset":"h2","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"star"}'),

-- cmp_3 status-badge – Live
('sd030030000000000000000000000000', 'sc030000000000000000000000000000', 'cm100000000000000000000000000000',
 'live_badge', 'cmp_1',
 30, 0, 8, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Live","hAlign":"right","vAlign":"middle","hiddenCon":"","readonlyCon":"","tone":"success"}'),

-- cmp_4 label – subtitle
('sd030040000000000000000000000000', 'sc030000000000000000000000000000', 'cm080000000000000000000000000000',
 'subtitle', 'cmp_1',
 0, 3, 38, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Browse our latest 5G and LTE plans — pick the one that suits your lifestyle","preset":"small","customFontSize":0,"color":"#64748b","fontWeight":"normal","icon":"none"}'),

-- ── Featured Section Container ── cmp_10
('sd030050000000000000000000000000', 'sc030000000000000000000000000000', 'cm010000000000000000000000000000',
 'featured_section', NULL,
 0, 8, 40, 8,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}'),

-- cmp_11 label – Featured Plan
('sd030060000000000000000000000000', 'sc030000000000000000000000000000', 'cm080000000000000000000000000000',
 'featured_title', 'cmp_10',
 0, 0, 20, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Featured Plan","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"star"}'),

-- cmp_12 data-fact – Plan Name
('sd030070000000000000000000000000', 'sc030000000000000000000000000000', 'cm090000000000000000000000000000',
 'feat_plan_name', 'cmp_10',
 0, 3, 12, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Plan","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","value":"5G Standard","displayMode":"stacked","dataPath":"","valuePath":"","bgColor":"#1e293b"}'),

-- cmp_13 data-fact – Price
('sd030080000000000000000000000000', 'sc030000000000000000000000000000', 'cm090000000000000000000000000000',
 'feat_price', 'cmp_10',
 13, 3, 12, 4,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Price","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","value":"75,000 Won/mo","displayMode":"stacked","dataPath":"","valuePath":"","bgColor":"#1e293b"}'),

-- cmp_14 status-badge – 5G
('sd030090000000000000000000000000', 'sc030000000000000000000000000000', 'cm100000000000000000000000000000',
 'feat_badge', 'cmp_10',
 26, 3, 12, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"5G","hAlign":"left","vAlign":"middle","hiddenCon":"","readonlyCon":"","tone":"success"}'),

-- cmp_19 divider 1
('sd030100000000000000000000000000', 'sc030000000000000000000000000000', 'cm110000000000000000000000000000',
 'divider_1', NULL,
 0, 17, 40, 1,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Divider","hAlign":"center","vAlign":"middle","hiddenCon":"","readonlyCon":"","color":"#334155","orientation":"horizontal","thickness":1}'),

-- cmp_20 label – Available Plans
('sd030110000000000000000000000000', 'sc030000000000000000000000000000', 'cm080000000000000000000000000000',
 'plans_title', NULL,
 0, 19, 30, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Available Plans","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"list"}'),

-- cmp_21 card-list-repeater
('sd030120000000000000000000000000', 'sc030000000000000000000000000000', 'cm130000000000000000000000000000',
 'plan_cards', NULL,
 0, 22, 40, 18,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Card List Repeater","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","dataSourcePath":"@apiData.response.products","cardTitle":"5G Standard","cardBadge":"5G","cardPrice":"75,000","cardPriceUnit":"Won/Month","cardDescription":"High-speed 5G data plan with unlimited streaming and premium content access.","cardFacts":"Data: 210GB, Voice: Unlimited, SMS: Unlimited, Tethering: 30GB","cardButtonText":"Select Plan","accentColor":"#3b82f6","cardWidth":240,"cardHeight":0}'),

-- cmp_25 divider 2
('sd030130000000000000000000000000', 'sc030000000000000000000000000000', 'cm110000000000000000000000000000',
 'divider_2', NULL,
 0, 41, 40, 1,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Divider","hAlign":"center","vAlign":"middle","hiddenCon":"","readonlyCon":"","color":"#334155","orientation":"horizontal","thickness":1}'),

-- cmp_30 label – Plan Comparison
('sd030140000000000000000000000000', 'sc030000000000000000000000000000', 'cm080000000000000000000000000000',
 'compare_title', NULL,
 0, 43, 30, 3,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","text":"Plan Comparison","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"chart"}'),

-- cmp_31 data-grid – Plan Comparison
('sd030150000000000000000000000000', 'sc030000000000000000000000000000', 'cm120000000000000000000000000000',
 'compare_grid', NULL,
 0, 46, 40, 14,
 '{"onPageLoad":[],"onClick":[],"onChange":[]}',
 '{"label":"Data Grid","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","columns":[{"header":"Plan","field":"title"},{"header":"Price","field":"price"},{"header":"Badge","field":"badge"}],"selectionMode":"single","isEditable":false,"allowAddRow":false,"allowDeleteRow":false,"isReadOnly":true,"pagination":false,"pageSize":10,"dataSourcePath":"@apiData.response.products"}');


-- ════════════════════════════════════════════════════════════
-- [3] UI 화면 이력  (각 화면 초기 버전 1)
--     ★ SCRN_JSON_CNTN = 빌더 내보내기 원본 포맷:
--       { screenInfo, logic, components[] }
-- ════════════════════════════════════════════════════════════
INSERT INTO TB_PFCM_UI_SCRN_H
    (UI_SCRN_HIST_ID, UI_SCRN_ID, VER_NO, SCRN_JSON_CNTN, FRST_STRG_DTTM)
VALUES

-- ──────────────────────────────────────────
-- Screen 01 : Customer Lookup  v1
-- ──────────────────────────────────────────
('sh010000000000000000000000000000', 'sc010000000000000000000000000000', 1,
'{
  "screenInfo": {"name":"Customer Lookup","version":"1.0"},
  "logic": {
    "variables": [
      {"id":"lv_1","name":"searchResults","type":"array","initialValue":"[]"},
      {"id":"lv_2","name":"selectedCustomer","type":"object","initialValue":"{}"}
    ],
    "orderEvents": [
      {"id":"oe_1","eventCode":"CUST_SEARCH","name":"Customer Search","requestDtoJson":"{\"customer_name\":\"\",\"phone\":\"\",\"plan_type\":\"\"}","requestMapping":"customer_name:$cust_name.value, phone:$cust_phone.value, plan_type:$plan_filter.value","onSuccessVariable":"searchResults","onSuccessPath":"data.list"}
    ],
    "activeScreen": "default"
  },
  "components": [
    {"id":"cmp_1","type":"container","parentFieldId":null,"layout":{"x":0,"y":0,"w":40,"h":6},"props":{"fieldId":"header_section","label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"showBorder":true,"showBackground":true,"padding":6,"bgColor":"#0f172a"}},
    {"id":"cmp_2","type":"label","parentFieldId":"cmp_1","layout":{"x":0,"y":0,"w":30,"h":3},"props":{"fieldId":"title_main","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Customer Lookup","preset":"h2","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"user"}},
    {"id":"cmp_3","type":"status-badge","parentFieldId":"cmp_1","layout":{"x":30,"y":0,"w":8,"h":3},"props":{"fieldId":"sys_status","label":"Online","hAlign":"right","vAlign":"middle","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"tone":"success"}},
    {"id":"cmp_4","type":"label","parentFieldId":"cmp_1","layout":{"x":0,"y":3,"w":38,"h":2},"props":{"fieldId":"subtitle","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Search customer accounts by name, phone, or plan type","preset":"small","customFontSize":0,"color":"#64748b","fontWeight":"normal","icon":"none"}},
    {"id":"cmp_10","type":"container","parentFieldId":null,"layout":{"x":0,"y":7,"w":40,"h":16},"props":{"fieldId":"search_section","label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}},
    {"id":"cmp_11","type":"label","parentFieldId":"cmp_10","layout":{"x":0,"y":0,"w":38,"h":3},"props":{"fieldId":"search_title","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Search Filters","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"search"}},
    {"id":"cmp_12","type":"text-input","parentFieldId":"cmp_10","layout":{"x":0,"y":3,"w":18,"h":4},"props":{"fieldId":"cust_name","label":"Customer Name","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"placeholder":"Enter customer name","maxLength":120,"inputType":"text","mask":""}},
    {"id":"cmp_13","type":"text-input","parentFieldId":"cmp_10","layout":{"x":20,"y":3,"w":18,"h":4},"props":{"fieldId":"cust_phone","label":"Phone Number","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"placeholder":"010-0000-0000","maxLength":13,"inputType":"tel","mask":"000-0000-0000"}},
    {"id":"cmp_14","type":"combo-box","parentFieldId":"cmp_10","layout":{"x":0,"y":8,"w":18,"h":4},"props":{"fieldId":"plan_filter","label":"Plan Type","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"options":"All, 5G Premium, 5G Standard, LTE Basic, LTE Plus"}},
    {"id":"cmp_15","type":"action-button","parentFieldId":"cmp_10","layout":{"x":0,"y":12,"w":12,"h":3},"props":{"fieldId":"btn_search","label":"Search","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[{"type":"orderEvent","eventId":"oe_1","params":"","resultVariable":"searchResults","resultPath":""}],"onChange":[]},"actionType":"api-call","icon":"search","colorPreset":"primary","params":"customer_name:$cust_name.value, phone:$cust_phone.value","customBgColor":"#3b82f6","customTextColor":"#ffffff"}},
    {"id":"cmp_16","type":"action-button","parentFieldId":"cmp_10","layout":{"x":13,"y":12,"w":12,"h":3},"props":{"fieldId":"btn_reset","label":"Reset","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"actionType":"navigate","icon":"refresh","colorPreset":"secondary","params":"","customBgColor":"#3b82f6","customTextColor":"#ffffff"}},
    {"id":"cmp_20","type":"container","parentFieldId":null,"layout":{"x":0,"y":24,"w":40,"h":14},"props":{"fieldId":"info_section","label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}},
    {"id":"cmp_21","type":"label","parentFieldId":"cmp_20","layout":{"x":0,"y":0,"w":26,"h":3},"props":{"fieldId":"info_title","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Customer Information","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"folder"}},
    {"id":"cmp_22","type":"status-badge","parentFieldId":"cmp_20","layout":{"x":30,"y":0,"w":8,"h":3},"props":{"fieldId":"cust_badge","label":"Active","hAlign":"right","vAlign":"middle","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"tone":"success"}},
    {"id":"cmp_23","type":"data-fact","parentFieldId":"cmp_20","layout":{"x":0,"y":4,"w":18,"h":4},"props":{"fieldId":"cust_plan","label":"Current Plan","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"value":"5G Premium","displayMode":"side-by-side","dataPath":"@apiData.user.plan","valuePath":"","bgColor":"#1e293b"}},
    {"id":"cmp_24","type":"data-fact","parentFieldId":"cmp_20","layout":{"x":20,"y":4,"w":18,"h":4},"props":{"fieldId":"cust_balance","label":"Balance","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"value":"89,000","displayMode":"side-by-side","dataPath":"@apiData.user.balance","valuePath":"","bgColor":"#1e293b"}},
    {"id":"cmp_25","type":"data-fact","parentFieldId":"cmp_20","layout":{"x":0,"y":9,"w":18,"h":4},"props":{"fieldId":"acc_id","label":"Account ID","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"value":"ACC-2024-0042","displayMode":"side-by-side","dataPath":"@apiData.account.id","valuePath":"","bgColor":"#1e293b"}},
    {"id":"cmp_26","type":"data-fact","parentFieldId":"cmp_20","layout":{"x":20,"y":9,"w":18,"h":4},"props":{"fieldId":"credit_rating","label":"Credit Rating","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"value":"A+","displayMode":"side-by-side","dataPath":"@apiData.account.credit","valuePath":"","bgColor":"#1e293b"}},
    {"id":"cmp_30","type":"divider","parentFieldId":null,"layout":{"x":0,"y":39,"w":40,"h":1},"props":{"fieldId":"divider_1","label":"Divider","hAlign":"center","vAlign":"middle","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"color":"#334155","orientation":"horizontal","thickness":1}},
    {"id":"cmp_31","type":"label","parentFieldId":null,"layout":{"x":0,"y":40,"w":30,"h":3},"props":{"fieldId":"grid_title","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Subscription History","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"list"}},
    {"id":"cmp_32","type":"data-grid","parentFieldId":null,"layout":{"x":0,"y":43,"w":40,"h":14},"props":{"fieldId":"sub_history_grid","label":"Data Grid","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"columns":[{"header":"Name","field":"name"},{"header":"Status","field":"status"},{"header":"Plan","field":"plan"},{"header":"Amount","field":"amount"}],"selectionMode":"single","isEditable":false,"allowAddRow":false,"allowDeleteRow":false,"isReadOnly":true,"pagination":true,"pageSize":10,"dataSourcePath":"@apiData.response.customers"}}
  ]
}',
 '2025-06-01 09:00:00'),

-- ──────────────────────────────────────────
-- Screen 02 : Mobile Signup  v1
-- ──────────────────────────────────────────
('sh020000000000000000000000000000', 'sc020000000000000000000000000000', 1,
'{
  "screenInfo": {"name":"Mobile Signup","version":"1.0"},
  "logic": {
    "variables": [
      {"id":"lv_1","name":"formData","type":"object","initialValue":"{}"},
      {"id":"lv_2","name":"isSubmitted","type":"boolean","initialValue":"false"}
    ],
    "orderEvents": [
      {"id":"oe_1","eventCode":"SIGNUP_SUBMIT","name":"Submit Signup","requestDtoJson":"{\"full_name\":\"\",\"phone\":\"\",\"email\":\"\",\"address\":\"\",\"plan\":\"\"}","requestMapping":"full_name:$full_name.value, phone:$phone_input.value, email:$email_input.value, address:$address_input.value","onSuccessVariable":"isSubmitted","onSuccessPath":""}
    ],
    "activeScreen": "default"
  },
  "components": [
    {"id":"cmp_1","type":"container","parentFieldId":null,"layout":{"x":0,"y":0,"w":40,"h":6},"props":{"fieldId":"header_section","label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"showBorder":true,"showBackground":true,"padding":6,"bgColor":"#0f172a"}},
    {"id":"cmp_2","type":"label","parentFieldId":"cmp_1","layout":{"x":0,"y":0,"w":30,"h":3},"props":{"fieldId":"title_main","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Mobile Signup","preset":"h2","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"user"}},
    {"id":"cmp_3","type":"label","parentFieldId":"cmp_1","layout":{"x":0,"y":3,"w":38,"h":2},"props":{"fieldId":"subtitle","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Register a new mobile subscriber — fill out the form and choose a payment method","preset":"small","customFontSize":0,"color":"#64748b","fontWeight":"normal","icon":"none"}},
    {"id":"cmp_10","type":"container","parentFieldId":null,"layout":{"x":0,"y":7,"w":40,"h":20},"props":{"fieldId":"personal_section","label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}},
    {"id":"cmp_11","type":"label","parentFieldId":"cmp_10","layout":{"x":0,"y":0,"w":38,"h":3},"props":{"fieldId":"personal_title","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Personal Information","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"user"}},
    {"id":"cmp_12","type":"text-input","parentFieldId":"cmp_10","layout":{"x":0,"y":3,"w":18,"h":4},"props":{"fieldId":"full_name","label":"Full Name","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"placeholder":"Enter full name","maxLength":120,"inputType":"text","mask":""}},
    {"id":"cmp_13","type":"text-input","parentFieldId":"cmp_10","layout":{"x":20,"y":3,"w":18,"h":4},"props":{"fieldId":"phone_input","label":"Phone Number","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"placeholder":"010-0000-0000","maxLength":13,"inputType":"tel","mask":"000-0000-0000"}},
    {"id":"cmp_14","type":"text-input","parentFieldId":"cmp_10","layout":{"x":0,"y":8,"w":18,"h":4},"props":{"fieldId":"email_input","label":"Email Address","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"placeholder":"user@example.com","maxLength":200,"inputType":"email","mask":""}},
    {"id":"cmp_15","type":"date-picker","parentFieldId":"cmp_10","layout":{"x":20,"y":8,"w":18,"h":4},"props":{"fieldId":"birth_date","label":"Date of Birth","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"placeholder":"YYYY-MM-DD","dateFormat":"YYYY-MM-DD"}},
    {"id":"cmp_16","type":"text-input","parentFieldId":"cmp_10","layout":{"x":0,"y":13,"w":38,"h":4},"props":{"fieldId":"address_input","label":"Address","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"placeholder":"Street, City, Province, Postal Code","maxLength":300,"inputType":"text","mask":""}},
    {"id":"cmp_20","type":"container","parentFieldId":null,"layout":{"x":0,"y":28,"w":40,"h":12},"props":{"fieldId":"plan_section","label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}},
    {"id":"cmp_21","type":"label","parentFieldId":"cmp_20","layout":{"x":0,"y":0,"w":38,"h":3},"props":{"fieldId":"plan_title","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Select Plan","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"star"}},
    {"id":"cmp_22","type":"combo-box","parentFieldId":"cmp_20","layout":{"x":0,"y":3,"w":18,"h":4},"props":{"fieldId":"plan_select","label":"Plan Type","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"options":"5G Premium, 5G Standard, LTE Basic, LTE Plus"}},
    {"id":"cmp_23","type":"radio-group","parentFieldId":"cmp_20","layout":{"x":20,"y":3,"w":18,"h":4},"props":{"fieldId":"contract_period","label":"Contract Period","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"options":"12 Months, 24 Months, No Contract"}},
    {"id":"cmp_24","type":"checkbox-group","parentFieldId":"cmp_20","layout":{"x":0,"y":8,"w":38,"h":3},"props":{"fieldId":"addons","label":"Add-ons","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"options":"VoLTE, International Roaming, Data Plus, Insurance"}},
    {"id":"cmp_30","type":"accordion","parentFieldId":null,"layout":{"x":0,"y":41,"w":40,"h":16},"props":{"fieldId":"payment_accordion","label":"Accordion","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"title":"Payment Methods","panels":"Credit Card, Bank Transfer, Auto-Pay Settings","activePanel":"Credit Card"}},
    {"id":"cmp_35","type":"divider","parentFieldId":null,"layout":{"x":0,"y":58,"w":40,"h":1},"props":{"fieldId":"divider_1","label":"Divider","hAlign":"center","vAlign":"middle","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"color":"#334155","orientation":"horizontal","thickness":1}},
    {"id":"cmp_40","type":"action-button","parentFieldId":null,"layout":{"x":0,"y":60,"w":40,"h":3},"props":{"fieldId":"btn_submit","label":"Submit Signup Application","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[{"type":"orderEvent","eventId":"oe_1","params":"","resultVariable":"isSubmitted","resultPath":""}],"onChange":[]},"actionType":"submit","icon":"check","colorPreset":"primary","params":"","customBgColor":"#3b82f6","customTextColor":"#ffffff"}}
  ]
}',
 '2025-06-01 09:00:00'),

-- ──────────────────────────────────────────
-- Screen 03 : Product Showcase  v1
-- ──────────────────────────────────────────
('sh030000000000000000000000000000', 'sc030000000000000000000000000000', 1,
'{
  "screenInfo": {"name":"Product Showcase","version":"1.0"},
  "logic": {
    "variables": [
      {"id":"lv_1","name":"selectedPlan","type":"string","initialValue":""},
      {"id":"lv_2","name":"productList","type":"array","initialValue":"[]"}
    ],
    "orderEvents": [
      {"id":"oe_1","eventCode":"LOAD_PRODUCTS","name":"Load Products","requestDtoJson":"{}","requestMapping":"","onSuccessVariable":"productList","onSuccessPath":""}
    ],
    "activeScreen": "default"
  },
  "components": [
    {"id":"cmp_1","type":"container","parentFieldId":null,"layout":{"x":0,"y":0,"w":40,"h":7},"props":{"fieldId":"header_section","label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"showBorder":true,"showBackground":true,"padding":6,"bgColor":"#0f172a"}},
    {"id":"cmp_2","type":"label","parentFieldId":"cmp_1","layout":{"x":0,"y":0,"w":30,"h":3},"props":{"fieldId":"title_main","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Product Showcase","preset":"h2","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"star"}},
    {"id":"cmp_3","type":"status-badge","parentFieldId":"cmp_1","layout":{"x":30,"y":0,"w":8,"h":3},"props":{"fieldId":"live_badge","label":"Live","hAlign":"right","vAlign":"middle","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"tone":"success"}},
    {"id":"cmp_4","type":"label","parentFieldId":"cmp_1","layout":{"x":0,"y":3,"w":38,"h":3},"props":{"fieldId":"subtitle","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Browse our latest 5G and LTE plans — pick the one that suits your lifestyle","preset":"small","customFontSize":0,"color":"#64748b","fontWeight":"normal","icon":"none"}},
    {"id":"cmp_10","type":"container","parentFieldId":null,"layout":{"x":0,"y":8,"w":40,"h":8},"props":{"fieldId":"featured_section","label":"Container (Section)","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"showBorder":true,"showBackground":true,"padding":6,"bgColor":"#1e293b"}},
    {"id":"cmp_11","type":"label","parentFieldId":"cmp_10","layout":{"x":0,"y":0,"w":20,"h":3},"props":{"fieldId":"featured_title","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Featured Plan","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"star"}},
    {"id":"cmp_12","type":"data-fact","parentFieldId":"cmp_10","layout":{"x":0,"y":3,"w":12,"h":4},"props":{"fieldId":"feat_plan_name","label":"Plan","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"value":"5G Standard","displayMode":"stacked","dataPath":"","valuePath":"","bgColor":"#1e293b"}},
    {"id":"cmp_13","type":"data-fact","parentFieldId":"cmp_10","layout":{"x":13,"y":3,"w":12,"h":4},"props":{"fieldId":"feat_price","label":"Price","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"value":"75,000 Won/mo","displayMode":"stacked","dataPath":"","valuePath":"","bgColor":"#1e293b"}},
    {"id":"cmp_14","type":"status-badge","parentFieldId":"cmp_10","layout":{"x":26,"y":3,"w":12,"h":3},"props":{"fieldId":"feat_badge","label":"5G","hAlign":"left","vAlign":"middle","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"tone":"success"}},
    {"id":"cmp_19","type":"divider","parentFieldId":null,"layout":{"x":0,"y":17,"w":40,"h":1},"props":{"fieldId":"divider_1","label":"Divider","hAlign":"center","vAlign":"middle","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"color":"#334155","orientation":"horizontal","thickness":1}},
    {"id":"cmp_20","type":"label","parentFieldId":null,"layout":{"x":0,"y":19,"w":30,"h":3},"props":{"fieldId":"plans_title","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Available Plans","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"list"}},
    {"id":"cmp_21","type":"card-list-repeater","parentFieldId":null,"layout":{"x":0,"y":22,"w":40,"h":18},"props":{"fieldId":"plan_cards","label":"Card List Repeater","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"dataSourcePath":"@apiData.response.products","cardTitle":"5G Standard","cardBadge":"5G","cardPrice":"75,000","cardPriceUnit":"Won/Month","cardDescription":"High-speed 5G data plan with unlimited streaming and premium content access.","cardFacts":"Data: 210GB, Voice: Unlimited, SMS: Unlimited, Tethering: 30GB","cardButtonText":"Select Plan","accentColor":"#3b82f6","cardWidth":240,"cardHeight":0}},
    {"id":"cmp_25","type":"divider","parentFieldId":null,"layout":{"x":0,"y":41,"w":40,"h":1},"props":{"fieldId":"divider_2","label":"Divider","hAlign":"center","vAlign":"middle","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"color":"#334155","orientation":"horizontal","thickness":1}},
    {"id":"cmp_30","type":"label","parentFieldId":null,"layout":{"x":0,"y":43,"w":30,"h":3},"props":{"fieldId":"compare_title","label":"Label","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"text":"Plan Comparison","preset":"h3","customFontSize":0,"color":"#f1f5f9","fontWeight":"bold","icon":"chart"}},
    {"id":"cmp_31","type":"data-grid","parentFieldId":null,"layout":{"x":0,"y":46,"w":40,"h":14},"props":{"fieldId":"compare_grid","label":"Data Grid","hAlign":"left","vAlign":"top","hiddenCon":"","readonlyCon":"","events":{"onPageLoad":[],"onClick":[],"onChange":[]},"columns":[{"header":"Plan","field":"title"},{"header":"Price","field":"price"},{"header":"Badge","field":"badge"}],"selectionMode":"single","isEditable":false,"allowAddRow":false,"allowDeleteRow":false,"isReadOnly":true,"pagination":false,"pageSize":10,"dataSourcePath":"@apiData.response.products"}}
  ]
}',
 '2025-06-01 09:00:00');
