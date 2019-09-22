create table poepdb.poem_theme (id serial NOT NULL, created_at timestamp NOT NULL default now(),
title varchar(50) NOT NULL, ntag int NOT NULL, detail text NOT NULL, npoem int NOT NULL default 0, 
answer_length_min int NOT NULL, answer_length_max int NOT NULL,
theme_setter_name varchar(20),  primary key(id));

create table poepdb.poem_tag (id serial NOT NULL, tag varchar(20) NOT NULL, poem_theme_id BIGINT UNSIGNED NOT NULL,
primary key(id), foreign key(poem_theme_id) references poem_theme(id));

create table poepdb.poem (id serial NOT NULL, poem_theme_id BIGINT UNSIGNED NOT NULL, nfav int NOT NULL default 0,
date_created timestamp NOT NULL default now(), answerer_name varchar(20), answer_text text NOT NULL,
primary key(id), foreign key(poem_theme_id) references poem_theme(id));