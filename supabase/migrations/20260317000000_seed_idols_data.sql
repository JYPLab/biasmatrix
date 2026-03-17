-- Add unique constraint to prevent duplicate idol entries
ALTER TABLE public.idols
  ADD CONSTRAINT idols_group_member_unique UNIQUE (group_name, member_name);

-- Insert all idols safely (skips existing entries)
INSERT INTO public.idols (group_name, member_name, birth_date, gender) VALUES
  ('BTS', 'RM', '1994-09-12', 'M'),
  ('BTS', 'Jin', '1992-12-04', 'M'),
  ('BTS', 'SUGA', '1993-03-09', 'M'),
  ('BTS', 'j-hope', '1994-02-18', 'M'),
  ('BTS', 'Jimin', '1995-10-13', 'M'),
  ('BTS', 'V', '1995-12-30', 'M'),
  ('BTS', 'Jungkook', '1997-09-01', 'M'),
  ('Seventeen', 'Mingyu', '1997-04-06', 'M'),
  ('Stray Kids', 'Felix', '2000-09-15', 'M'),
  ('EXO', 'Baekhyun', '1992-05-06', 'M')
ON CONFLICT (group_name, member_name) DO NOTHING;
