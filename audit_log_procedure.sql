CREATE PROCEDURE `new_procedure` ()
BEGIN
	SELECT * FROM demodb.audit_log ORDER BY event_timestamp DESC;
END;
