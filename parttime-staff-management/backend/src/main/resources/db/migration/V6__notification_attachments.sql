-- Add attachment fields to notifications table
ALTER TABLE notifications 
ADD COLUMN attachment_url LONGTEXT NULL AFTER link,
ADD COLUMN attachment_name VARCHAR(255) NULL AFTER attachment_url;

