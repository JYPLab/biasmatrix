-- 1. 테이블별 Row Level Security(RLS) 활성화
ALTER TABLE public.idols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. public.idols 정책
-- 조건: 누구나 읽기 가능, 쓰기/수정/삭제 불가
CREATE POLICY "Allow public read access on idols"
ON public.idols FOR SELECT
TO anon, authenticated
USING (true);

-- 3. public.reports 정책
-- 조건: 누구나 읽기 가능, 쓰기는 service_role만 가능
CREATE POLICY "Allow public read access on reports"
ON public.reports FOR SELECT
TO anon, authenticated
USING (true);

-- 4. public.reviews 정책
-- 조건: 누구나 읽기 가능, INSERT는 anon/authenticated 허용, UPDATE/DELETE는 service_role만 허용
CREATE POLICY "Allow public read access on reviews"
ON public.reviews FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert on reviews"
ON public.reviews FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. public.users 정책
-- 조건: 읽기/쓰기 모두 service_role만 허용
-- (RLS가 활성화되어 있으므로 anon/authenticated의 접근이 차단되며, 
-- service_role은 기본적으로 RLS를 우회하므로 추가 정책을 작성할 필요가 없습니다.)
