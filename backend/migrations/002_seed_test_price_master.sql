-- 002_seed_test_price_master.sql
-- Seed common pathology tests for pricing and preparation flows.

with base_lab as (
  insert into labs (name, owner_name, owner_phone, owner_email)
  values ('Demo Diagnostics Lab', 'Demo Owner', '+91-9000000000', 'owner@example.com')
  on conflict do nothing
  returning id
),
resolved_lab as (
  select id from base_lab
  union all
  select id from labs where name = 'Demo Diagnostics Lab' limit 1
)
insert into test_price_master (
  lab_id,
  test_name,
  test_aliases,
  category,
  price,
  turnaround_time_hours,
  is_available,
  fasting_required,
  fasting_hours,
  sample_type,
  notes
)
select
  resolved_lab.id,
  t.test_name,
  t.test_aliases,
  t.category,
  t.price,
  t.turnaround_time_hours,
  true,
  t.fasting_required,
  t.fasting_hours,
  t.sample_type,
  t.notes
from resolved_lab,
  (values
    -- 1 CBC
    ('CBC', array['Complete Blood Count'], 'Haematology', 250.00, 4, false, null, 'Blood', 'No fasting required, any time of day, ~3ml blood'),
    -- 2 Lipid Profile
    ('Lipid Profile', array['Lipid Panel'], 'Biochemistry', 700.00, 24, true, 12, 'Blood', '10–12 hours fasting, water allowed, morning preferred'),
    -- 3 Blood Sugar Fasting
    ('Blood Sugar Fasting', array['FBS'], 'Biochemistry', 120.00, 2, true, 8, 'Blood', '8–10 hours fasting, water allowed'),
    -- 4 Blood Sugar PP
    ('Blood Sugar PP', array['PPBS'], 'Biochemistry', 120.00, 2, false, null, 'Blood', '2 hours after meal, note meal time'),
    -- 5 HbA1c
    ('HbA1c', array['Glycosylated Hemoglobin'], 'Biochemistry', 600.00, 24, false, null, 'Blood', 'No fasting required, any time'),
    -- 6 Thyroid Profile (TSH/T3/T4)
    ('Thyroid Profile (TSH/T3/T4)', array['Thyroid Panel'], 'Hormones', 800.00, 24, false, null, 'Blood', 'No fasting, morning sample preferred'),
    -- 7 LFT
    ('Liver Function Test (LFT)', array['LFT'], 'Biochemistry', 900.00, 24, true, 8, 'Blood', '8–10 hours fasting, water allowed'),
    -- 8 KFT/RFT
    ('Kidney Function Test (KFT/RFT)', array['KFT','RFT'], 'Biochemistry', 800.00, 24, false, null, 'Blood', 'No fasting required'),
    -- 9 Urine Routine
    ('Urine Routine', array['Urine R/M'], 'Urine', 150.00, 4, false, null, 'Urine', 'First morning urine preferred, midstream, clean container'),
    -- 10 Urine Culture
    ('Urine Culture', array['Urine C/S'], 'Microbiology', 600.00, 72, false, null, 'Urine', 'First morning urine, sterile container from lab'),
    -- 11 Stool Test
    ('Stool Routine', array['Stool R/M'], 'Stool', 200.00, 24, false, null, 'Stool', 'Fresh sample in provided container, avoid water/urine contamination'),
    -- 12 Vitamin D
    ('Vitamin D (25-OH)', array['Vitamin D'], 'Vitamins', 1500.00, 48, false, null, 'Blood', 'No fasting required'),
    -- 13 Vitamin B12
    ('Vitamin B12', array['B12'], 'Vitamins', 1300.00, 48, false, null, 'Blood', 'No fasting required'),
    -- 14 Dengue NS1
    ('Dengue NS1 Antigen', array['Dengue NS1'], 'Serology', 900.00, 24, false, null, 'Blood', 'No fasting required'),
    -- 15 Dengue IgM/IgG
    ('Dengue IgM/IgG', array['Dengue Antibodies'], 'Serology', 900.00, 24, false, null, 'Blood', 'No fasting required'),
    -- 16 Typhoid Widal
    ('Typhoid Widal', array['Widal'], 'Serology', 400.00, 24, false, null, 'Blood', 'No fasting required'),
    -- 17 Malaria
    ('Malaria Parasite', array['MP Smear'], 'Haematology', 350.00, 4, false, null, 'Blood', 'No fasting required'),
    -- 18 CRP
    ('C-Reactive Protein (CRP)', array['CRP'], 'Serology', 600.00, 24, false, null, 'Blood', 'No fasting required'),
    -- 19 ESR
    ('ESR', array['Erythrocyte Sedimentation Rate'], 'Haematology', 150.00, 4, false, null, 'Blood', 'No fasting required'),
    -- 20 HBsAg
    ('HBsAg (Hepatitis B)', array['HBsAg'], 'Serology', 600.00, 24, false, null, 'Blood', 'No fasting required'),
    -- 21 HIV
    ('HIV 1 & 2', array['HIV'], 'Serology', 600.00, 24, false, null, 'Blood', 'No fasting required'),
    -- 22 VDRL
    ('VDRL', array['Syphilis Test'], 'Serology', 400.00, 24, false, null, 'Blood', 'No fasting required'),
    -- 23 Beta HCG
    ('Beta HCG (Pregnancy)', array['Beta HCG'], 'Hormones', 700.00, 24, false, null, 'Blood/Urine', 'No fasting, morning urine or blood'),
    -- 24 PSA
    ('PSA (Prostate Specific Antigen)', array['PSA'], 'Hormones', 900.00, 24, false, null, 'Blood', 'No fasting, avoid ejaculation 48 hours before'),
    -- 25 Uric Acid
    ('Uric Acid', array['Serum Uric Acid'], 'Biochemistry', 250.00, 4, true, 6, 'Blood', '4–8 hours fasting preferred'),
    -- 26 Creatinine
    ('Creatinine', array['Serum Creatinine'], 'Biochemistry', 200.00, 4, false, null, 'Blood', 'No fasting required'),
    -- 27 Iron Studies
    ('Iron Studies', array['Iron Profile'], 'Biochemistry', 1100.00, 48, true, 10, 'Blood', '8–12 hours fasting, morning sample critical'),
    -- 28 Cortisol
    ('Serum Cortisol (8–10 AM)', array['Cortisol'], 'Hormones', 800.00, 24, false, null, 'Blood', 'No fasting, morning sample 8–10 AM critical'),
    -- 29 Culture and Sensitivity
    ('Culture and Sensitivity', array['C/S'], 'Microbiology', 900.00, 72, false, null, 'Varies', 'Ask which body part; sample type varies'),
    -- 30 COVID RT-PCR
    ('COVID RT-PCR', array['SARS-CoV-2 RT-PCR'], 'Microbiology', 1500.00, 24, false, null, 'Swab', 'No fasting, nasopharyngeal swab at lab')
  ) as t (
    test_name,
    test_aliases,
    category,
    price,
    turnaround_time_hours,
    fasting_required,
    fasting_hours,
    sample_type,
    notes
  )
on conflict do nothing;

