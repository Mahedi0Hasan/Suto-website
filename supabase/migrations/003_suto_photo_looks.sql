-- Six photo looks (18 pieces). Keep in step with lib/config.ts.
insert into public.suto_products(id, name_en, name_bn, price, sizes, active) values
  ('p1','Sand twill jacket','স্যান্ড টুইল জ্যাকেট',4600,'{S,M,L,XL}',true),
  ('p2','Black fleece hoodie','কালো ফ্লিস হুডি',2800,'{S,M,L,XL}',true),
  ('p3','Black cargo trouser','কালো কার্গো ট্রাউজার',3200,'{30,32,34,36}',true),
  ('p4','Embroidered kameez','এমব্রয়ডারি কামিজ',6800,'{S,M,L}',true),
  ('p5','Organza dupatta','অর্গাঞ্জা ওড়না',3200,'{Free}',true),
  ('p6','Straight salwar','সোজা সালোয়ার',2200,'{S,M,L}',true),
  ('p7','Heavyweight hoodie','হেভিওয়েট হুডি',2800,'{S,M,L,XL}',true),
  ('p8','Khaki cargo trouser','খাকি কার্গো ট্রাউজার',3200,'{30,32,34,36}',true),
  ('p9','High-top sneakers','হাই-টপ স্নিকার',5500,'{40,41,42,43,44}',true),
  ('p10','Chocolate blazer','চকলেট ব্লেজার',7800,'{S,M,L}',true),
  ('p11','Rib-knit top','রিব-নিট টপ',2200,'{S,M,L}',true),
  ('p12','Pleated wide trouser','প্লিটেড ওয়াইড ট্রাউজার',3600,'{S,M,L}',true),
  ('p13','Brown utility jacket','বাদামি ইউটিলিটি জ্যাকেট',5200,'{S,M,L,XL}',true),
  ('p14','Soft grey hoodie','নরম ধূসর হুডি',2600,'{S,M,L,XL}',true),
  ('p15','Black cargo trouser','কালো কার্গো ট্রাউজার',3200,'{30,32,34,36}',true),
  ('p16','Ribbed turtleneck','রিবড টার্টলনেক',2600,'{S,M,L}',true),
  ('p17','Cream utility cargo','ক্রিম ইউটিলিটি কার্গো',3400,'{S,M,L}',true),
  ('p18','Leather shoulder bag','চামড়ার কাঁধের ব্যাগ',4800,'{Free}',true)
on conflict (id) do update set name_en = excluded.name_en, name_bn = excluded.name_bn,
  price = excluded.price, sizes = excluded.sizes, active = excluded.active;
