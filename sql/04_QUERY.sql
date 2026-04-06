-- ============================================================
-- No-Code UI Builder  |  운영 조회 쿼리 모음
-- ============================================================
-- [Q1]  컴포넌트별 속성 + 속성 상세 조회
-- [Q2]  화면에서 사용 중인 컴포넌트 목록 조회
-- [Q3]  화면 구성 JSON 조회 (이력 기준)
-- [Q4]  컴포넌트 카탈로그 전체 조회 (그룹별)
-- [Q5]  특정 속성의 ENUM 선택값 목록 조회
-- [Q6]  화면별 컴포넌트 계층구조(트리) 조회
-- [Q7]  화면 버전 이력 목록 조회
-- [Q8]  특정 버전의 화면 JSON 복원 조회
-- [Q9]  컴포넌트 사용 빈도 통계 조회
-- [Q10] COMMON 속성 vs SPECIFIC 속성 비교 조회
-- ============================================================


-- ──────────────────────────────────────────
-- [Q1] 컴포넌트별 속성 + 속성 상세 조회
--      특정 컴포넌트(CMP_KD_CD)의 모든 속성과
--      ENUM 타입인 경우 선택 가능한 값 목록을 함께 조회
-- ──────────────────────────────────────────
SELECT
    cm.CMP_KD_CD                                AS 컴포넌트유형,
    cm.CMP_GRP_ID                               AS 컴포넌트그룹,
    am.UI_CMP_ATTR_ID                           AS 속성ID,
    am.ATTR_NM                                  AS 속성명,
    am.ATTR_CLSS_CD                             AS 속성분류,        -- COMMON / SPECIFIC
    am.ATTR_DATA_KD_CD                          AS 데이터유형,      -- STRING / NUMBER / BOOLEAN / ENUM / JSON
    am.ATTR_CNTL_KD_CD                          AS 컨트롤유형,      -- TEXT / NUMBER / SELECT / TOGGLE / COLOR / TEXTAREA
    ad.SNO                                      AS 선택값순서,
    ad.ATTR_DETL_VLUE_CNTN                      AS 선택값
FROM       TB_PFCM_UI_CMP_M      cm
INNER JOIN TB_PFCM_UI_CMP_ATTR_M am ON am.UI_CMP_ID      = cm.UI_CMP_ID
LEFT  JOIN TB_PFCM_UI_CMP_ATTR_D ad ON ad.UI_CMP_ATTR_ID = am.UI_CMP_ATTR_ID
WHERE cm.CMP_KD_CD = :cmp_kd_cd          -- 예) 'action-button'  (파라미터)
ORDER BY
    am.ATTR_CLSS_CD DESC,                -- SPECIFIC 먼저, COMMON 나중
    am.UI_CMP_ATTR_ID,
    ad.SNO;

-- 전체 컴포넌트 한 번에 조회할 경우 WHERE 절 제거
-- WHERE cm.CMP_KD_CD = :cmp_kd_cd


-- ──────────────────────────────────────────
-- [Q2] 화면에서 사용 중인 컴포넌트 목록 조회
--      특정 화면(UI_SCRN_ID)에 배치된 컴포넌트를
--      유형·위치·크기 포함하여 조회
-- ──────────────────────────────────────────
SELECT
    sm.UI_SCRN_ID                               AS 화면ID,
    sm.UI_SCRN_NM                               AS 화면명,
    sm.ACTV_VER_NO                              AS 활성버전,
    cm.CMP_GRP_ID                               AS 컴포넌트그룹,
    cm.CMP_KD_CD                                AS 컴포넌트유형,
    sd.UI_SCRN_CMP_ID                           AS 화면컴포넌트ID,
    sd.CMP_FLD_ID                               AS 필드ID,
    sd.HPOS_CMP_FLD_ID                          AS 부모필드ID,
    sd.XS_CRDN_VLUE_CNTN                        AS X좌표,
    sd.YS_CRDN_VLUE_CNTN                        AS Y좌표,
    sd.XS_LEN_VLUE_CNTN                         AS 너비,
    sd.YS_LEN_VLUE_CNTN                         AS 높이,
    sd.SPEC_JSON_CNTN                           AS 스펙JSON,
    sd.EVET_JSON_CNTN                           AS 이벤트JSON
FROM       TB_PFCM_UI_SCRN_M     sm
INNER JOIN TB_PFCM_UI_SCRN_CMP_D sd ON sd.UI_SCRN_ID = sm.UI_SCRN_ID
INNER JOIN TB_PFCM_UI_CMP_M      cm ON cm.UI_CMP_ID  = sd.UI_CMP_ID
WHERE sm.UI_SCRN_ID = :ui_scrn_id        -- 예) 'sc010000000000000000000000000000'
  AND sm.USE_YN     = 'Y'
ORDER BY
    sd.HPOS_CMP_FLD_ID NULLS FIRST,      -- 루트(부모 없음) 먼저
    sd.YS_CRDN_VLUE_CNTN,                -- Y좌표 오름차순
    sd.XS_CRDN_VLUE_CNTN;               -- X좌표 오름차순


-- ──────────────────────────────────────────
-- [Q3] 화면 구성 JSON 조회 (이력 기준)
--      활성 버전의 저장된 화면 JSON을 조회하고
--      각 컴포넌트 SPEC을 JSON 배열로 집계
-- ──────────────────────────────────────────

-- [Q3-A] 이력 테이블의 저장된 전체 JSON 그대로 조회
SELECT
    sm.UI_SCRN_ID                               AS 화면ID,
    sm.UI_SCRN_NM                               AS 화면명,
    sh.VER_NO                                   AS 버전,
    sh.FRST_STRG_DTTM                           AS 저장일시,
    sh.SCRN_JSON_CNTN                           AS 화면JSON전문
FROM       TB_PFCM_UI_SCRN_M sm
INNER JOIN TB_PFCM_UI_SCRN_H sh ON sh.UI_SCRN_ID = sm.UI_SCRN_ID
                                AND sh.VER_NO     = sm.ACTV_VER_NO   -- 활성 버전만
WHERE sm.UI_SCRN_ID = :ui_scrn_id
  AND sm.USE_YN     = 'Y';

-- [Q3-B] 현재 컴포넌트 상세(SCRN_CMP_D) 기준으로 빌더 내보내기 JSON 재조립
--        출력 형식: { screenInfo, logic(이력에서), components[{id, type, parentFieldId, layout, props}] }
--
--   ★ SPEC_JSON_CNTN 에 common + specific props 가 모두 들어있고
--      그 안에 fieldId 가 있으므로 props = SPEC_JSON_CNTN || events 를 합침
--   ★ EVET_JSON_CNTN 에 {"onPageLoad":[], "onClick":[], "onChange":[]} 구조
--   ★ HPOS_CMP_FLD_ID → parentFieldId
--   ★ layout = {x, y, w, h} (grid 단위)
SELECT
    sm.UI_SCRN_ID,
    sm.UI_SCRN_NM,
    sm.ACTV_VER_NO,
    jsonb_build_object(
        'screenInfo', jsonb_build_object(
            'name',    sm.UI_SCRN_NM,
            'version', '1.0'
        ),
        'logic', COALESCE(sh.SCRN_JSON_CNTN -> 'logic', '{}'::jsonb),
        'components', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id',            sd.UI_SCRN_CMP_ID,
                    'type',          cm.CMP_KD_CD,
                    'parentFieldId', sd.HPOS_CMP_FLD_ID,
                    'layout',        jsonb_build_object(
                                         'x', sd.XS_CRDN_VLUE_CNTN,
                                         'y', sd.YS_CRDN_VLUE_CNTN,
                                         'w', sd.XS_LEN_VLUE_CNTN,
                                         'h', sd.YS_LEN_VLUE_CNTN
                                     ),
                    'props',         jsonb_build_object(
                                         'fieldId', sd.CMP_FLD_ID
                                     )
                                     || COALESCE(sd.SPEC_JSON_CNTN::jsonb, '{}'::jsonb)
                                     || jsonb_build_object(
                                         'events', COALESCE(sd.EVET_JSON_CNTN::jsonb, '{"onPageLoad":[],"onClick":[],"onChange":[]}'::jsonb)
                                     )
                )
                ORDER BY sd.YS_CRDN_VLUE_CNTN, sd.XS_CRDN_VLUE_CNTN
            )
            FROM       TB_PFCM_UI_SCRN_CMP_D sd
            INNER JOIN TB_PFCM_UI_CMP_M      cm ON cm.UI_CMP_ID = sd.UI_CMP_ID
            WHERE sd.UI_SCRN_ID = sm.UI_SCRN_ID
        )
    )                                           AS 화면JSON재조립
FROM       TB_PFCM_UI_SCRN_M sm
LEFT  JOIN TB_PFCM_UI_SCRN_H sh ON sh.UI_SCRN_ID = sm.UI_SCRN_ID
                                AND sh.VER_NO     = sm.ACTV_VER_NO
WHERE sm.UI_SCRN_ID = :ui_scrn_id
  AND sm.USE_YN     = 'Y';


-- ──────────────────────────────────────────
-- [Q4] 컴포넌트 카탈로그 전체 조회 (그룹별)
--      빌더 좌측 패널의 컴포넌트 팔레트용
--      그룹별 컴포넌트 목록 + 기본 크기 반환
-- ──────────────────────────────────────────
SELECT
    CMP_GRP_ID                                  AS 그룹,
    UI_CMP_ID                                   AS 컴포넌트ID,
    CMP_KD_CD                                   AS 컴포넌트유형,
    CMP_WDTH_DVAL_CNTN                          AS 기본너비,
    CMP_HGHT_DVAL_CNTN                          AS 기본높이
FROM TB_PFCM_UI_CMP_M
ORDER BY
    CASE CMP_GRP_ID
        WHEN 'CONTAINERS' THEN 1
        WHEN 'INPUTS'     THEN 2
        WHEN 'DISPLAYS'   THEN 3
        WHEN 'ACTIONS'    THEN 4
        ELSE 5
    END,
    CMP_KD_CD;


-- ──────────────────────────────────────────
-- [Q5] 특정 속성의 ENUM 선택값 목록 조회
--      Property Editor 드롭다운 옵션 로딩용
--      (컴포넌트 유형 + 속성명 기준)
-- ──────────────────────────────────────────
SELECT
    ad.UI_CMP_ATTR_DETL_ID                      AS 상세ID,
    ad.ATTR_DETL_VLUE_CNTN                      AS 선택값,
    ad.SNO                                      AS 순서
FROM       TB_PFCM_UI_CMP_M      cm
INNER JOIN TB_PFCM_UI_CMP_ATTR_M am ON am.UI_CMP_ID      = cm.UI_CMP_ID
INNER JOIN TB_PFCM_UI_CMP_ATTR_D ad ON ad.UI_CMP_ATTR_ID = am.UI_CMP_ATTR_ID
WHERE cm.CMP_KD_CD  = :cmp_kd_cd               -- 예) 'action-button'
  AND am.ATTR_NM    = :attr_nm                  -- 예) 'colorPreset'
  AND am.ATTR_DATA_KD_CD = 'ENUM'
ORDER BY ad.SNO;


-- ──────────────────────────────────────────
-- [Q6] 화면별 컴포넌트 계층구조(트리) 조회
--      재귀 CTE로 부모→자식 계층을 depth와 함께 출력
--      (캔버스 렌더링 순서 결정용)
-- ──────────────────────────────────────────
WITH RECURSIVE cmp_tree AS (
    -- 루트 노드 (부모 없는 컴포넌트)
    SELECT
        sd.UI_SCRN_CMP_ID,
        sd.CMP_FLD_ID,
        sd.HPOS_CMP_FLD_ID,
        cm.CMP_KD_CD,
        sd.XS_CRDN_VLUE_CNTN                    AS x,
        sd.YS_CRDN_VLUE_CNTN                    AS y,
        sd.XS_LEN_VLUE_CNTN                     AS w,
        sd.YS_LEN_VLUE_CNTN                     AS h,
        0                                       AS depth,
        ARRAY[sd.CMP_FLD_ID]                    AS path
    FROM       TB_PFCM_UI_SCRN_CMP_D sd
    INNER JOIN TB_PFCM_UI_CMP_M      cm ON cm.UI_CMP_ID = sd.UI_CMP_ID
    WHERE sd.UI_SCRN_ID     = :ui_scrn_id
      AND sd.HPOS_CMP_FLD_ID IS NULL

    UNION ALL

    -- 자식 노드 재귀
    SELECT
        sd.UI_SCRN_CMP_ID,
        sd.CMP_FLD_ID,
        sd.HPOS_CMP_FLD_ID,
        cm.CMP_KD_CD,
        sd.XS_CRDN_VLUE_CNTN,
        sd.YS_CRDN_VLUE_CNTN,
        sd.XS_LEN_VLUE_CNTN,
        sd.YS_LEN_VLUE_CNTN,
        ct.depth + 1,
        ct.path || sd.CMP_FLD_ID
    FROM       TB_PFCM_UI_SCRN_CMP_D sd
    INNER JOIN TB_PFCM_UI_CMP_M      cm ON cm.UI_CMP_ID      = sd.UI_CMP_ID
    INNER JOIN cmp_tree              ct ON ct.CMP_FLD_ID      = sd.HPOS_CMP_FLD_ID
    WHERE sd.UI_SCRN_ID = :ui_scrn_id
)
SELECT
    depth,
    REPEAT('  ', depth) || CMP_KD_CD           AS 트리구조,
    CMP_FLD_ID                                  AS 필드ID,
    HPOS_CMP_FLD_ID                             AS 부모필드ID,
    x, y, w, h,
    path                                        AS 계층경로
FROM cmp_tree
ORDER BY path;


-- ──────────────────────────────────────────
-- [Q7] 화면 버전 이력 목록 조회
--      특정 화면의 전체 버전 이력과
--      활성 버전 여부를 함께 조회
-- ──────────────────────────────────────────
SELECT
    sh.VER_NO                                   AS 버전,
    sh.FRST_STRG_DTTM                           AS 저장일시,
    CASE WHEN sh.VER_NO = sm.ACTV_VER_NO
         THEN 'Y' ELSE 'N'
    END                                         AS 활성버전여부,
    sh.UI_SCRN_HIST_ID                          AS 이력ID
FROM       TB_PFCM_UI_SCRN_M sm
INNER JOIN TB_PFCM_UI_SCRN_H sh ON sh.UI_SCRN_ID = sm.UI_SCRN_ID
WHERE sm.UI_SCRN_ID = :ui_scrn_id
ORDER BY sh.VER_NO DESC;


-- ──────────────────────────────────────────
-- [Q8] 특정 버전의 화면 JSON 복원 조회
--      롤백/비교 기능용
--      특정 버전 JSON에서 컴포넌트 배열을 펼쳐서 조회
-- ──────────────────────────────────────────
SELECT
    sm.UI_SCRN_NM                               AS 화면명,
    sh.VER_NO                                   AS 버전,
    sh.FRST_STRG_DTTM                           AS 저장일시,
    comp_elem ->> 'type'                        AS 컴포넌트유형,
    comp_elem -> 'props' ->> 'fieldId'          AS 필드ID,
    comp_elem ->> 'parentFieldId'               AS 부모ID,
    (comp_elem -> 'layout' ->> 'x')::INTEGER    AS X좌표,
    (comp_elem -> 'layout' ->> 'y')::INTEGER    AS Y좌표,
    (comp_elem -> 'layout' ->> 'w')::INTEGER    AS 너비,
    (comp_elem -> 'layout' ->> 'h')::INTEGER    AS 높이,
    comp_elem -> 'props'                        AS 속성JSON
FROM       TB_PFCM_UI_SCRN_M sm
INNER JOIN TB_PFCM_UI_SCRN_H sh   ON sh.UI_SCRN_ID = sm.UI_SCRN_ID
CROSS JOIN LATERAL jsonb_array_elements(
               sh.SCRN_JSON_CNTN -> 'components'
           ) AS comp_elem
WHERE sm.UI_SCRN_ID = :ui_scrn_id
  AND sh.VER_NO     = :ver_no                   -- 조회할 버전 번호
ORDER BY
    (comp_elem -> 'layout' ->> 'y')::INTEGER,
    (comp_elem -> 'layout' ->> 'x')::INTEGER;


-- ──────────────────────────────────────────
-- [Q9] 컴포넌트 사용 빈도 통계 조회
--      전체 화면에서 각 컴포넌트 유형이
--      몇 번 사용됐는지 집계 (대시보드용)
-- ──────────────────────────────────────────
SELECT
    cm.CMP_GRP_ID                               AS 그룹,
    cm.CMP_KD_CD                                AS 컴포넌트유형,
    COUNT(sd.UI_SCRN_CMP_ID)                    AS 사용횟수,
    COUNT(DISTINCT sd.UI_SCRN_ID)               AS 사용화면수
FROM            TB_PFCM_UI_CMP_M      cm
LEFT OUTER JOIN TB_PFCM_UI_SCRN_CMP_D sd ON sd.UI_CMP_ID = cm.UI_CMP_ID
GROUP BY cm.CMP_GRP_ID, cm.CMP_KD_CD
ORDER BY 사용횟수 DESC, cm.CMP_GRP_ID;


-- ──────────────────────────────────────────
-- [Q10] COMMON 속성 vs SPECIFIC 속성 비교 조회
--       컴포넌트별로 공통/고유 속성 수를
--       한 눈에 확인 (속성 설계 검증용)
-- ──────────────────────────────────────────
SELECT
    cm.CMP_KD_CD                                AS 컴포넌트유형,
    cm.CMP_GRP_ID                               AS 그룹,
    COUNT(*) FILTER (WHERE am.ATTR_CLSS_CD = 'COMMON')   AS COMMON속성수,
    COUNT(*) FILTER (WHERE am.ATTR_CLSS_CD = 'SPECIFIC') AS SPECIFIC속성수,
    COUNT(*)                                    AS 전체속성수,
    STRING_AGG(
        CASE WHEN am.ATTR_CLSS_CD = 'SPECIFIC'
             THEN am.ATTR_NM END,
        ', ' ORDER BY am.UI_CMP_ATTR_ID
    )                                           AS SPECIFIC속성목록
FROM       TB_PFCM_UI_CMP_M      cm
INNER JOIN TB_PFCM_UI_CMP_ATTR_M am ON am.UI_CMP_ID = cm.UI_CMP_ID
GROUP BY cm.UI_CMP_ID, cm.CMP_KD_CD, cm.CMP_GRP_ID
ORDER BY cm.CMP_GRP_ID, cm.CMP_KD_CD;


-- ──────────────────────────────────────────
-- [Q11] 화면 목록 조회 (활성 버전 기준, 사용 여부 필터링)
--       화면ID, 화면명, 활성버전, 사용여부, 수정일시
--      사용여부(:use_yn) 파라미터로 Y/N 필터링 가능 (NULL이면 전체)
-- ──────────────────────────────────────────
SELECT
    UI_SCRN_ID   AS 화면ID,
    UI_SCRN_NM   AS 화면명,
    ACTV_VER_NO  AS 활성버전,
    USE_YN       AS 사용여부,
    DATA_UPD_DTTM AS 수정일시
FROM TB_PFCM_UI_SCRN_M
WHERE (:use_yn IS NULL OR USE_YN = :use_yn)
ORDER BY DATA_UPD_DTTM DESC, UI_SCRN_ID;
