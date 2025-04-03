USE demodb;

DELIMITER //
CREATE TRIGGER log_failed_login
AFTER INSERT ON failed_login_attempts
FOR EACH ROW
BEGIN
	INSERT INTO audit_log (event_type, username, details, event_timestamp)
	VALUES ('Failed Login', NEW.username, CONCAT('Failed Login at ', NOW()), NOW());
END;
//
DELIMITER ;