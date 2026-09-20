-- Catalog only: no fabricated paid tests or student results.
insert into public.exams(id,slug,name,description,subjects,status,sort_order) values
('amu-9','amu-class-9','AMU Class 9','Build a strong foundation with focused practice for your AMU Class 9 entrance.','{"Mathematics","Science","Languages","General knowledge"}','active',1),
('amu-11','amu-class-11','AMU Class 11','Find your gaps and make every revision count for the AMU Class 11 entrance.','{"Mathematics","Science","English","General knowledge"}','active',2),
('jmi','jmi-entrance','JMI Entrance','Dedicated practice for Jamia Millia Islamia entrance exams is on the way.','{"Coming soon"}','coming_soon',3),
('navodaya','navodaya-entrance','Navodaya Entrance','Navodaya entrance practice is planned for our growing exam collection.','{"Coming soon"}','coming_soon',4)
on conflict(id) do nothing;
