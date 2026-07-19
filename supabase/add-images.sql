-- Run this in Supabase SQL Editor to add photo support to an EXISTING
-- database (one where you already ran schema.sql before this design update).
-- Safe to run even if these columns already exist.

alter table events add column if not exists image_url text not null default '';
alter table submissions add column if not exists image_url text not null default '';
