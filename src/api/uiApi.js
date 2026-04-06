/**
 * UI Builder API Service
 *
 * Vite 개발 서버가 /online/tapl/* → http://localhost:8080 으로 프록시
 *
 * [Q1] GET  /online/tapl/ui/v1/cmp/attr              — 컴포넌트 속성 + 상세 목록 (Query Param)
 * [Q2] GET  /online/tapl/ui/v1/scrn/{uiScrnId}/cmp  — 화면 컴포넌트 목록 (Path Variable)
 * [Q3] GET  /online/tapl/ui/v1/scrn/{uiScrnId}/hist — 화면 이력(활성 버전) JSON (Path Variable)
 *
 * 공통 응답 구조: { "data": <payload> }
 * → apiFetch 는 res.data 를 꺼내서 반환
 */

const BASE = "/online/tapl/ui/v1";

// ─────────────────────────────────────────────
// 공통 fetch 헬퍼
//   - Query Params: null/undefined/'' 인 값은 자동 제외
//   - 응답 envelope { data: ... } 에서 data 만 추출
// ─────────────────────────────────────────────
async function apiFetch(url, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== "")
    )
  ).toString();
  const fullUrl = qs ? `${url}?${qs}` : url;

  const res = await fetch(fullUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[${res.status}] ${res.statusText} — ${fullUrl}\n${text}`);
  }

  const json = await res.json();
  // 백엔드 공통 envelope: { data: <payload> }
  return Object.prototype.hasOwnProperty.call(json, "data") ? json.data : json;
}

// ─────────────────────────────────────────────
// [Q11] 화면 목록 조회
//   GET /tapl/ui/v1/scrn              — 전체 조회
//   GET /tapl/ui/v1/scrn?useYn=Y      — 사용중인 화면만
//   GET /tapl/ui/v1/scrn?useYn=N      — 미사용 화면만
//   @param {string|null} useYn  — 'Y'/'N'/null(전체)
//   @returns {Promise<object[]>}  — data 배열 직접 반환
// ─────────────────────────────────────────────
export async function retrieveScrnList(useYn = null) {
  return apiFetch(`${BASE}/scrn`, { useYn });
}

// ─────────────────────────────────────────────
// [Q1] 컴포넌트별 속성 + 속성 상세 조회
//   GET /tapl/ui/v1/cmp/attr?cmpKdCd=...
//   @param {string|null} cmpKdCd  — null/'' 이면 전체 조회
//   @returns {Promise<object[]>}  — data 배열 직접 반환
// ─────────────────────────────────────────────
export async function retrieveCmpAttrList(cmpKdCd = null) {
  return apiFetch(`${BASE}/cmp/attr`, { cmpKdCd });
}

// ─────────────────────────────────────────────
// [Q2] 화면에서 사용 중인 컴포넌트 목록 조회
//   GET /tapl/ui/v1/scrn/{uiScrnId}/cmp
//   @param {string} uiScrnId  — 필수 (Path Variable)
//   @returns {Promise<object[]>}  — data 배열 직접 반환
// ─────────────────────────────────────────────
export async function retrieveScrnCmpList(uiScrnId) {
  if (!uiScrnId) throw new Error("retrieveScrnCmpList: uiScrnId is required");
  return apiFetch(`${BASE}/scrn/${encodeURIComponent(uiScrnId)}/cmp`);
}

// ─────────────────────────────────────────────
// [Q3] 화면 구성 JSON 조회 (활성 버전 이력 기준)
//   GET /tapl/ui/v1/scrn/{uiScrnId}/hist
//   @param {string} uiScrnId  — 필수 (Path Variable)
//   @returns {Promise<object>}  — data 객체 직접 반환
// ─────────────────────────────────────────────
export async function retrieveScrnHist(uiScrnId) {
  if (!uiScrnId) throw new Error("retrieveScrnHist: uiScrnId is required");
  return apiFetch(`${BASE}/scrn/${encodeURIComponent(uiScrnId)}/hist`);
}

// ─────────────────────────────────────────────
// 세 API 동시 호출 (화면 로드 시 사용)
//   @param {string} uiScrnId
//   @returns {Promise<{ cmpAttrs, scrnCmps, scrnHist, errors }>}
//     cmpAttrs : object[]  (Q1 data)
//     scrnCmps : object[]  (Q2 data)
//     scrnHist : object    (Q3 data)
//     errors   : { cmpAttrs, scrnCmps, scrnHist } — 실패 시 Error, 성공 시 null
// ─────────────────────────────────────────────
export async function loadInitialData(uiScrnId) {
  const [cmpAttrs, scrnCmps, scrnHist] = await Promise.allSettled([
    retrieveCmpAttrList(),          // Q1: 전체 컴포넌트 속성 마스터
    retrieveScrnCmpList(uiScrnId),  // Q2: 화면 컴포넌트 배치
    retrieveScrnHist(uiScrnId),     // Q3: 화면 이력 JSON
  ]);

  return {
    cmpAttrs: cmpAttrs.status === "fulfilled" ? cmpAttrs.value : null,
    scrnCmps: scrnCmps.status === "fulfilled" ? scrnCmps.value : null,
    scrnHist: scrnHist.status === "fulfilled" ? scrnHist.value : null,
    errors: {
      cmpAttrs: cmpAttrs.status === "rejected" ? cmpAttrs.reason : null,
      scrnCmps: scrnCmps.status === "rejected" ? scrnCmps.reason : null,
      scrnHist: scrnHist.status === "rejected" ? scrnHist.reason : null,
    },
  };
}
