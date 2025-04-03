USE demodb;

SELECT 
	id,
    event_type,
    username,
    details,
    event_timestamp
FROM audit_log
WHERE event_type = 'Failed Login'
ORDER BY event_timestamp DESC;