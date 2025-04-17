import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer"

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedLogType, setSelectedLogType] = useState('driver_points');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);
  const [userList, setUserList] = useState([]);
  const [logTypes, setLogTypes] = useState([]);

  // List of fields to exclude from display
  const excludedFields = [
    'version', 'eventId', 'userSub', 'userPoolId', 'clientId', 'creationDate', 
    'eventResponse', 'riskLevel', 'riskDecision', 'challenges', 'deviceName', 
    'ipAddress', 'requestId', 'idpName', 'compromisedCredentialDetected', 'city', 
    'country', 'eventFeedbackValue', 'eventFeedbackDate', 'eventFeedbackProvider', 
    'hasContextData', 'source_ip', 'admin_user', 'raw', 'timestamp', 'requested'
  ];

  // Additional fields to exclude specifically for driver_points logs
  const driverPointsExcludedFields = [
    'event_type', 'request_id'
  ];

  // Create friendly names for log types - as a memoized function
  const getLogTypeName = useCallback((type) => {
    const typeMap = {
      'driver_points': 'Driver Points',
      'login_success': 'Login Success',
      'login_failure': 'Login Failure',
      'password_reset': 'Password Reset Request',
      'password_change': 'Password Change',
      'password_confirmation': 'Password Reset Confirmation',
      'user_creation': 'User Creation',
      'account_confirmation': 'Account Confirmation',
      'account_status_change': 'Account Status Change',
      'sign_out': 'Sign Out'
    };
    return typeMap[type] || type.replace(/_/g, ' ');
  }, []);

  // Fetch logs with caching and improved handling
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // If your API supports filtering, you would add these parameters
        // const queryParams = new URLSearchParams();
        // if (selectedLogType) queryParams.append('logType', selectedLogType);
        // if (selectedDriver) queryParams.append('username', selectedDriver);
        
        const responses = await Promise.all([
          // fetch('http://44.202.51.190:8000/api/audit-logs?logGroup=/driver-points/audit-logs', {signal}),
          fetch('http://localhost:8000/api/audit-logs?logGroup=/driver-points/audit-logs', {signal}),
          // fetch('http://44.202.51.190:8000/api/audit-logs?logGroup=Team06-Cognito-Cloudtrail-AuditLogs', {signal}),
          fetch('http://localhost:8000/api/audit-logs?logGroup=Team06-Cognito-Cloudtrail-AuditLogs', {signal}),
        ]);
        
        const results = await Promise.all(responses.map(res => res.json()));
        
        // Use a more efficient parser with less object creation
        const processLogs = () => {
          // Process driver points logs efficiently
          const driverPointsLogs = results[0].map(log => {
            try {
              const parsed = JSON.parse(log.message);
              return {
                ...log,
                log_type: 'driver_points',
                username: parsed.driver_username || '',
                parsedMessage: parsed,
                eventType: undefined
              };
            } catch {
              return {
                ...log,
                log_type: 'unknown',
                username: '',
                parsedMessage: { raw: log.message },
                eventType: undefined
              };
            }
          });
          
          // Process Cognito logs with optimized parsing
          const cognitoLogs = results[1].map(log => {
            try {
              // Try to parse the log message
              const parsedLog = JSON.parse(log.message);
              
              // Use a more direct approach to determine log type and extract username
              let logType = 'unknown';
              let username = '';
              let eventType = '';
              let parsedMessage = null;
              
              if (parsedLog.eventSource === 'USER_AUTH_EVENTS') {
                // Direct Cognito log
                const message = parsedLog.message;
                
                // Determine log type and filter early if needed
                if (message.eventType === 'SignIn') {
                  logType = message.eventResponse === 'Pass' ? 'login_success' : 
                            message.eventResponse === 'Fail' ? 'login_failure' : 'unknown';
                  if (logType === 'unknown' && message.eventResponse !== 'Pass' && message.eventResponse !== 'Fail') {
                    return null; // Skip this log
                  }
                } else if (message.eventType === 'ForgotPassword') {
                  logType = 'password_reset';
                } else if (message.eventType === 'ChangePassword') {
                  logType = 'password_change';
                } else if (message.eventType === 'SignUp') {
                  logType = 'user_creation';
                } else if (message.eventType === 'ConfirmForgotPassword') {
                  logType = 'password_confirmation';
                } else if (message.eventType === 'ConfirmSignUp') {
                  logType = 'account_confirmation';
                } else if (message.eventType === 'GlobalSignOut') {
                  logType = 'sign_out';
                }
                
                username = message.userName || '';
                eventType = message.eventType || '';
                parsedMessage = message;
              } else {
                // CloudTrail log
                const event = parsedLog;
                const eventName = event.eventName || '';
                
                // Determine log type and filter early if needed
                if (eventName.includes('InitiateAuth') || eventName.includes('AdminInitiateAuth')) {
                  logType = event.errorCode ? 'login_failure' : 'login_success';
                } else if (eventName.includes('ForgotPassword')) {
                  logType = 'password_reset';
                } else if (eventName.includes('ChangePassword') || eventName.includes('AdminSetUserPassword')) {
                  logType = 'password_change';
                } else if (eventName.includes('SignUp') || eventName.includes('AdminCreateUser')) {
                  logType = 'user_creation';
                } else if (eventName.includes('Confirm')) {
                  logType = 'account_confirmation';
                } else if (eventName.includes('AdminDisableUser') || eventName.includes('AdminEnableUser')) {
                  logType = 'account_status_change';
                } else if (eventName.includes('GlobalSignOut') || eventName.includes('AdminUserGlobalSignOut')) {
                  logType = 'sign_out';
                } else {
                  return null; // Skip logs that don't match any known type
                }
                
                username = 
                  (event.requestParameters && event.requestParameters.username) ||
                  (event.requestParameters && event.requestParameters.userName) ||
                  (event.userIdentity && event.userIdentity.userName) ||
                  '';
                  
                eventType = eventName;
                parsedMessage = event;
              }
              
              // Early filter if needed
              // if (selectedLogType && logType !== selectedLogType) return null;
              // if (selectedDriver && username !== selectedDriver) return null;
              
              return {
                ...log,
                log_type: logType,
                username: username,
                eventType: eventType,
                parsedMessage: parsedMessage
              };
            } catch (error) {
              return null; // Skip parsing errors
            }
          }).filter(log => log !== null); // Remove any null entries
          
          const combinedLogs = [...driverPointsLogs, ...cognitoLogs];
          
          // Extract unique users and log types once
          const userSet = new Set();
          const typeSet = new Set();
          
          combinedLogs.forEach(log => {
            if (log.username) userSet.add(log.username);
            if (log.log_type) typeSet.add(log.log_type);
          });
          
          setUserList(Array.from(userSet));
          setLogTypes(Array.from(typeSet));
          
          return combinedLogs;
        };
        
        // Process logs in a non-blocking way if there are many logs
        if (results[0].length + results[1].length > 1000) {
          // For large datasets, use a promise to avoid blocking UI
          setTimeout(() => {
            if (!signal.aborted) {
              const processedLogs = processLogs();
              setLogs(processedLogs);
              setLoading(false);
            }
          }, 0);
        } else {
          // For smaller datasets, process immediately
          const processedLogs = processLogs();
          setLogs(processedLogs);
          setLoading(false);
        }
        
        setError(null);
      } catch (err) {
        if (!signal.aborted) {
          console.error('Error fetching logs:', err);
          setError('Failed to load logs. ' + err.message);
          setLoading(false);
        }
      }
    };
    
    fetchLogs();
    
    // Cleanup function to abort fetch if component unmounts
    return () => {
      controller.abort();
    };
  }, []); // Only fetch on initial load - filtering is done client-side

  // Memoized filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      let matchesUser = true;
      let matchesType = true;
      
      if (selectedDriver) {
        matchesUser = log.username === selectedDriver;
      }
      
      if (selectedLogType) {
        matchesType = log.log_type === selectedLogType;
      }
      
      return matchesUser && matchesType;
    });
  }, [logs, selectedDriver, selectedLogType]);

  // Memoized sorted logs
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'timestamp') {
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
      } else if (sortField === 'log_type') {
        aValue = a.log_type || '';
        bValue = b.log_type || '';
      } else if (sortField === 'username') {
        aValue = a.username || '';
        bValue = b.username || '';
      } else if (sortField === 'eventType') {
        aValue = a.eventType || '';
        bValue = b.eventType || '';
      } else {
        // Try to get sortField from parsedMessage if it exists
        if (a.parsedMessage && b.parsedMessage) {
          aValue = a.parsedMessage[sortField] || '';
          bValue = b.parsedMessage[sortField] || '';
        } else {
          // Fallback to trying to parse the message
          try {
            aValue = JSON.parse(a.message)[sortField] || '';
          } catch {
            aValue = '';
          }
          try {
            bValue = JSON.parse(b.message)[sortField] || '';
          } catch {
            bValue = '';
          }
        }
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, sortField, sortDirection]);

  // Memoized pagination
  const paginationData = useMemo(() => {
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    return {
      currentLogs: sortedLogs.slice(indexOfFirstLog, indexOfLastLog),
      totalPages: Math.ceil(sortedLogs.length / logsPerPage),
      indexOfFirstLog,
      indexOfLastLog
    };
  }, [sortedLogs, currentPage, logsPerPage]);

  // Memoized message keys for table headers
  const messageKeys = useMemo(() => {
    const allKeys = new Set();
    filteredLogs.slice(0, 50).forEach(log => { // Only check first 50 logs for performance
      if (log.parsedMessage) {
        Object.keys(log.parsedMessage).forEach(key => {
          const isDriverPoints = log.log_type === 'driver_points';
          const exclusionList = isDriverPoints 
            ? [...excludedFields, ...driverPointsExcludedFields] 
            : excludedFields;
          
          // Exclude any variation of username fields (case-insensitive)
          const isUsernameField = key.toLowerCase().includes('username') || 
                                  key.toLowerCase() === 'username' ||
                                  key.toLowerCase() === 'user_name' ||
                                  key.toLowerCase() === 'driver_username' ||
                                  key.toLowerCase() === 'userName';
          
          if (!exclusionList.includes(key) && key !== 'requestId' && !isUsernameField) {
            allKeys.add(key);
          }
        });
      }
    });
    return Array.from(allKeys);
  }, [filteredLogs, excludedFields, driverPointsExcludedFields]);

  // Handle sort change
  const handleSort = useCallback((field) => {
    setSortField(prevField => {
      const newDirection = prevField === field && sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      return field;
    });
  }, [sortDirection]);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((event) => {
    setLogsPerPage(Number(event.target.value));
    setCurrentPage(1);
  }, []);

  // Parse message function - memoized for better performance
  const parseMessage = useCallback((log) => {
    if (log.parsedMessage) {
      return log.parsedMessage;
    }
    
    try {
      return JSON.parse(log.message);
    } catch {
      return { raw: log.message };
    }
  }, []);

  // Format display value function
  const formatDisplayValue = useCallback((value) => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  }, []);

  // Function to determine if a column should be displayed
  const shouldDisplayColumn = useCallback((key) => {
    if (selectedLogType === 'driver_points') {
      return !driverPointsExcludedFields.includes(key);
    }
    return true;
  }, [selectedLogType, driverPointsExcludedFields]);

  // Get row style function - memoized
  const getRowStyle = useCallback((log, index) => {
    const baseStyle = index % 2 === 0 ? { backgroundColor: '#f9fafb' } : { backgroundColor: '#e5e7eb' };
    
    if (log.log_type === 'login_failure') {
      return { ...baseStyle, backgroundColor: '#fee2e2' }; // Light red for failures
    } else if (log.log_type === 'login_success') {
      return { ...baseStyle, backgroundColor: '#dcfce7' }; // Light green for success
    } else if (log.log_type === 'password_reset') {
      return { ...baseStyle, backgroundColor: '#fef3c7' }; // Light yellow for password reset
    }
    
    return baseStyle;
  }, []);

  // Get log type badge function - memoized
  const getLogTypeBadge = useCallback((type) => {
    const badgeStyle = {
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    };
    
    switch (type) {
      case 'driver_points':
        return { ...badgeStyle, backgroundColor: '#8b5cf6', color: 'white' }; // Purple
      case 'login_success':
        return { ...badgeStyle, backgroundColor: '#10b981', color: 'white' }; // Green
      case 'login_failure':
        return { ...badgeStyle, backgroundColor: '#ef4444', color: 'white' }; // Red
      case 'password_reset':
        return { ...badgeStyle, backgroundColor: '#f59e0b', color: 'white' }; // Amber
      case 'password_change':
        return { ...badgeStyle, backgroundColor: '#3b82f6', color: 'white' }; // Blue
      case 'password_confirmation':
        return { ...badgeStyle, backgroundColor: '#8b5cf6', color: 'white' }; // Purple
      case 'user_creation':
        return { ...badgeStyle, backgroundColor: '#9333ea', color: 'white' }; // Purple
      case 'account_confirmation':
        return { ...badgeStyle, backgroundColor: '#06b6d4', color: 'white' }; // Cyan
      case 'account_status_change':
        return { ...badgeStyle, backgroundColor: '#ec4899', color: 'white' }; // Pink
      case 'sign_out':
        return { ...badgeStyle, backgroundColor: '#6366f1', color: 'white' }; // Indigo
      default:
        return { ...badgeStyle, backgroundColor: '#6b7280', color: 'white' }; // Gray
    }
  }, []);

  // Determine whether to show the Event Type column
  const showEventTypeColumn = selectedLogType !== 'driver_points';

  // Table styles - defined once to avoid recreating on each render
  const styles = {
    tableStyle: {
      borderCollapse: 'collapse',
      width: '100%',
      marginTop: '15px'
    },
    headerCellStyle: {
      backgroundColor: '#e2e8f0',
      padding: '10px',
      textAlign: 'left',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    cellStyle: {
      padding: '8px',
      borderBottom: '1px solid #e2e8f0'
    },
    buttonStyle: {
      border: '1px solid #d1d5db',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      margin: '0 5px',
      backgroundColor: '#f9fafb'
    },
    disabledButtonStyle: {
      border: '1px solid #d1d5db',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'not-allowed',
      margin: '0 5px',
      backgroundColor: '#f3f4f6',
      color: '#9ca3af'
    },
    activePageButtonStyle: {
      border: '1px solid #d1d5db',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      margin: '0 5px',
      backgroundColor: '#e5e7eb',
      fontWeight: 'bold'
    },
    selectStyle: {
      padding: '6px',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      marginLeft: '10px',
      marginRight: '10px'
    }
  };

  return (
    <>
    <Header/>
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>System Audit Logs</h1>
        <a href="/" style={{ textDecoration: 'none', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#f9fafb' }}>
          Home
        </a>
      </div>
      
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ef4444' }}>
        <strong>Error:</strong> {error}
      </div>}
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ marginRight: '20px', marginBottom: '10px' }}>
            <label htmlFor="log-type-select" style={{ marginRight: '10px' }}>Log type:</label>
            <select
              id="log-type-select"
              value={selectedLogType}
              onChange={(e) => {
                setSelectedLogType(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.selectStyle}
            >
              {logTypes.map((type, index) => (
                <option key={index} value={type}>{getLogTypeName(type)}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="driver-select" style={{ marginRight: '10px' }}>User:</label>
            <select
              id="driver-select"
              value={selectedDriver}
              onChange={(e) => {
                setSelectedDriver(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.selectStyle}
            >
              <option value="">All users</option>
              {userList.map((user, index) => (
                <option key={index} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <label htmlFor="rows-per-page" style={{ marginRight: '10px' }}>Rows per page:</label>
          <select
            id="rows-per-page"
            value={logsPerPage}
            onChange={handleRowsPerPageChange}
            style={styles.selectStyle}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            {selectedDriver && selectedLogType ? 
              `No ${getLogTypeName(selectedLogType).toLowerCase()} logs found for ${selectedDriver}.` : 
              selectedDriver ? 
                `No logs found for ${selectedDriver}.` : 
                selectedLogType ? 
                  `No ${getLogTypeName(selectedLogType).toLowerCase()} logs available.` :
                  'No logs available.'}
          </p>
        </div>
      ) : (
        <>
          <table style={styles.tableStyle} cellPadding="0" cellSpacing="0">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('timestamp')}
                  style={styles.headerCellStyle}
                >
                  Timestamp
                  {sortField === 'timestamp' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                
                <th 
                  onClick={() => handleSort('log_type')}
                  style={styles.headerCellStyle}
                >
                  Log Type
                  {sortField === 'log_type' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                
                <th 
                  onClick={() => handleSort('username')}
                  style={styles.headerCellStyle}
                >
                  Username
                  {sortField === 'username' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                
                {/* Only show Event Type column for non-driver_points logs */}
                {showEventTypeColumn && (
                  <th 
                    onClick={() => handleSort('eventType')}
                    style={styles.headerCellStyle}
                  >
                    Event Type
                    {sortField === 'eventType' && (
                      <span style={{ marginLeft: '5px' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                )}
                
                {messageKeys
                  .filter(key => {
                    // Exclude any variation of username fields (case-insensitive)
                    const isUsernameField = key.toLowerCase().includes('username') || 
                                           key.toLowerCase() === 'username' ||
                                           key.toLowerCase() === 'user_name' ||
                                           key.toLowerCase() === 'driver_username' ||
                                           key.toLowerCase() === 'userName';
                    
                    return shouldDisplayColumn(key) && key !== 'eventType' && !isUsernameField;
                  })
                  .map(key => (
                  <th 
                    key={key} 
                    onClick={() => handleSort(key)}
                    style={styles.headerCellStyle}
                  >
                    {key.replace(/_/g, ' ')}
                    {sortField === key && (
                      <span style={{ marginLeft: '5px' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {paginationData.currentLogs.map((log, index) => {
                const parsedMessage = parseMessage(log);
                
                return (
                  <tr key={index} style={getRowStyle(log, index)}>
                    <td style={styles.cellStyle}>
                      {
                        (() => {
                          const date = new Date(log.timestamp);
                          const dateStr = date.toLocaleDateString();
                          const timeStr = date.toLocaleTimeString();
                          return (
                            <div>
                              <div>{dateStr}</div>
                              <div>{timeStr}</div>
                            </div>
                          );
                        })()
                      }
                    </td>
                    
                    <td style={styles.cellStyle}>
                      <div style={getLogTypeBadge(log.log_type)}>
                        {getLogTypeName(log.log_type)}
                      </div>
                    </td>
                    
                    <td style={styles.cellStyle}>
                      {log.username || '-'}
                    </td>
                    
                    {/* Only show Event Type column for non-driver_points logs */}
                    {showEventTypeColumn && (
                      <td style={styles.cellStyle}>
                        {log.eventType || parsedMessage.eventType || '-'}
                      </td>
                    )}
                    
                    {messageKeys
                      .filter(key => {
                        // Exclude any variation of username fields (case-insensitive)
                        const isUsernameField = key.toLowerCase().includes('username') || 
                                               key.toLowerCase() === 'username' ||
                                               key.toLowerCase() === 'user_name' ||
                                               key.toLowerCase() === 'driver_username' ||
                                               key.toLowerCase() === 'userName';
                        
                        return shouldDisplayColumn(key) && key !== 'eventType' && !isUsernameField;
                      })
                      .map(key => (
                      <td 
                        key={`${index}-${key}`} 
                        style={styles.cellStyle}
                      >
                        {parsedMessage[key] !== undefined ? formatDisplayValue(parsedMessage[key]) : '-'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={currentPage === 1 ? styles.disabledButtonStyle : styles.buttonStyle}
              >
                Previous
              </button>
              
              {(() => {
                const buttons = [];
                let startPage, endPage;
                
                if (paginationData.totalPages <= 5) {
                  startPage = 1;
                  endPage = paginationData.totalPages;
                } else if (currentPage <= 3) {
                  startPage = 1;
                  endPage = 5;
                } else if (currentPage >= paginationData.totalPages - 2) {
                  startPage = paginationData.totalPages - 4;
                  endPage = paginationData.totalPages;
                } else {
                  startPage = currentPage - 2;
                  endPage = currentPage + 2;
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  buttons.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      style={currentPage === i ? styles.activePageButtonStyle : styles.buttonStyle}
                    >
                      {i}
                    </button>
                  );
                }
                
                return buttons;
              })()}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationData.totalPages))}
                disabled={currentPage === paginationData.totalPages}
                style={currentPage === paginationData.totalPages ? styles.disabledButtonStyle : styles.buttonStyle}
              >
                Next
              </button>
            </div>
          )}
          
          <div style={{ textAlign: 'center', color: '#4b5563', marginTop: '10px' }}>
            Showing {paginationData.indexOfFirstLog + 1} to {Math.min(paginationData.indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} results
          </div>
        </>
      )}
    </div>
    <Footer/>
    </>
  );
}

export default AuditLogs;