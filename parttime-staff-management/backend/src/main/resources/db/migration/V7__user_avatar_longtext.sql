-- Change avatar_url column to LONGTEXT to support base64 encoded images
ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT;

