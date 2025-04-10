USE demodb;

CREATE TABLE demodb.audit_log (
	id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50),
    username VARCHAR(50),
    details TEXT,
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);