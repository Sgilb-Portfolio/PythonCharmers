import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";

function Reports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('driver_points');
  const [userList, setUserList] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);

  // List of fields to exclude from reports
  const excludedFields = [
    'version', 'eventId', 'userSub', 'userPoolId', 'clientId', 'creationDate', 
    'eventResponse', 'riskLevel', 'riskDecision', 'challenges', 'deviceName', 
    'ipAddress', 'requestId', 'idpName', 'compromisedCredentialDetected', 'city', 
    'country', 'eventFeedbackValue', 'eventFeedbackDate', 'eventFeedbackProvider', 
    'hasContextData', 'source_ip', 'admin_user', 'raw', 'timestamp', 'requested'
  ];

  // Additional fields to exclude specifically for certain report types
  const reportSpecificExcludedFields = {
    'driver_points': ['event_type', 'request_id'],
    'successful_login': ['event_type', 'request_id'],
    'failed_login': ['event_type', 'request_id'],
    'password_management': ['event_type', 'request_id'],
    'user_registration': ['event_type', 'request_id'],
    'account_management': ['event_type', 'request_id'],
    'account_activity': ['event_type', 'request_id']
  };

  // Create friendly names for report types
  const getReportTypeName = useCallback((type) => {
    const typeMap = {
      'driver_points': 'Driver Points',
      'successful_login': 'Successful Login',
      'failed_login': 'Failed Login',
      'password_management': 'Password Management',
      'user_registration': 'User Registration',
      'account_management': 'Account Management',
      'account_activity': 'Account Activity'
    };
    return typeMap[type] || type.replace(/_/g, ' ');
  }, []);

  // Fetch reports from CloudWatch
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchReports = async () => {
      setLoading(true);
      try {
        // Use the same log groups as audit logs
        const responses = await Promise.all([
          // fetch('http://44.202.51.190:8000/api/audit-logs?logGroup=/driver-points/audit-logs', {signal}),
          fetch('http://localhost:8000/api/audit-logs?logGroup=/driver-points/audit-logs', {signal}),
          // fetch('http://44.202.51.190:8000/api/audit-logs?logGroup=Team06-Cognito-Cloudtrail-AuditLogs', {signal}),
          fetch('http://localhost:8000/api/audit-logs?logGroup=Team06-Cognito-Cloudtrail-AuditLogs', {signal}),
        ]);
        
        const results = await Promise.all(responses.map(res => res.json()));
        
        // Process reports in a non-blocking way
        const processReports = () => {
          // Process driver points logs efficiently
          const driverPointsLogs = results[0].map(log => {
            try {
              const parsed = JSON.parse(log.message);
              return {
                ...log,
                report_type: 'driver_points',
                username: parsed.driver_username || '',
                parsedMessage: parsed
              };
            } catch {
              return {
                ...log,
                report_type: 'driver_points',
                username: '',
                parsedMessage: { raw: log.message }
              };
            }
          });
          
          // Process Cognito logs with optimized parsing
          const cognitoLogs = results[1].map(log => {
            try {
              // Try to parse the log message
              const parsedLog = JSON.parse(log.message);
              
              // Use a more direct approach to determine report type and extract username
              let reportType = 'account_activity';
              let username = '';
              let parsedMessage = null;
              
              if (parsedLog.eventSource === 'USER_AUTH_EVENTS') {
                // Direct Cognito log
                const message = parsedLog.message;
                
                // Determine report types
                if (message.eventType === 'SignIn') {
                  reportType = message.eventResponse === 'Pass' ? 'successful_login' : 'failed_login';
                } else if (message.eventType === 'ForgotPassword' || message.eventType === 'ChangePassword') {
                  reportType = 'password_management';
                } else if (message.eventType === 'SignUp' || message.eventType === 'ConfirmSignUp') {
                  reportType = 'user_registration';
                } else {
                  reportType = 'account_management';
                }
                
                username = message.userName || '';
                parsedMessage = message;
              } else {
                // CloudTrail log
                const event = parsedLog;
                
                // Determine report type
                const eventName = event.eventName || '';
                if (eventName.includes('InitiateAuth') || eventName.includes('AdminInitiateAuth')) {
                  reportType = event.errorCode ? 'failed_login' : 'successful_login';
                } else if (eventName.includes('ForgotPassword') || eventName.includes('ChangePassword')) {
                  reportType = 'password_management';
                } else if (eventName.includes('SignUp') || eventName.includes('ConfirmSignUp')) {
                  reportType = 'user_registration';
                } else {
                  reportType = 'account_management';
                }
                
                username = 
                  (event.requestParameters && event.requestParameters.username) ||
                  (event.requestParameters && event.requestParameters.userName) ||
                  (event.userIdentity && event.userIdentity.userName) ||
                  '';
                  
                parsedMessage = event;
              }
              
              return {
                ...log,
                report_type: reportType,
                username: username,
                parsedMessage: parsedMessage
              };
            } catch (error) {
              return null; // Skip parsing errors
            }
          }).filter(log => log !== null); // Remove any null entries
          
          const allReports = [...driverPointsLogs, ...cognitoLogs];
          
          // Extract unique users and report types
          const allUsers = new Set();
          const allReportTypes = new Set();
          
          allReports.forEach(report => {
            if (report.username) allUsers.add(report.username);
            if (report.report_type) allReportTypes.add(report.report_type);
          });
          
          // Update state with processed data
          setReports(allReports);
          setUserList(Array.from(allUsers));
          setReportTypes(Array.from(allReportTypes));
          setLoading(false);
        };
        
        // For large datasets, use a promise to avoid blocking UI
        if (results[0].length + results[1].length > 1000) {
          setTimeout(() => {
            if (!signal.aborted) {
              processReports();
            }
          }, 0);
        } else {
          // For smaller datasets, process immediately
          processReports();
        }
        
        setError(null);
      } catch (err) {
        if (!signal.aborted) {
          console.error('Error fetching reports:', err);
          setError('Failed to load reports. ' + err.message);
          setLoading(false);
        }
      }
    };
    
    fetchReports();
    
    // Cleanup function to abort fetch if component unmounts
    return () => {
      controller.abort();
    };
  }, []); // Only fetch on initial load - filtering is done client-side

  // Memoized filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      let matchesUser = true;
      let matchesType = true;
      
      if (selectedDriver) {
        matchesUser = report.username === selectedDriver;
      }
      
      if (selectedReportType) {
        matchesType = report.report_type === selectedReportType;
      }
      
      return matchesUser && matchesType;
    });
  }, [reports, selectedDriver, selectedReportType]);

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

  // Parse message function - memoized for better performance
  const parseMessage = useCallback((report) => {
    if (report.parsedMessage) {
      return report.parsedMessage;
    }
    
    try {
      return JSON.parse(report.message);
    } catch {
      return { raw: report.message };
    }
  }, []);

  // Convert to CSV function - memoized
  const convertToCSV = useCallback((reports) => {
    if (reports.length === 0) return '';
    
    // Get all unique message keys for headers (excluding the fields we don't want)
    const allMessageKeys = new Set();
    reports.forEach(report => {
      if (report.parsedMessage) {
        Object.keys(report.parsedMessage).forEach(key => {
          const reportTypeExcludedFields = reportSpecificExcludedFields[report.report_type] || [];
          const exclusionList = [...excludedFields, ...reportTypeExcludedFields];
          
          // Exclude any variation of username fields (case-insensitive)
          const isUsernameField = key.toLowerCase().includes('username') || 
                                key.toLowerCase() === 'username' ||
                                key.toLowerCase() === 'user_name' ||
                                key.toLowerCase() === 'driver_username' ||
                                key.toLowerCase() === 'userName';
          
          if (!exclusionList.includes(key) && key !== 'requestId' && !isUsernameField) {
            allMessageKeys.add(key);
          }
        });
      }
    });
    
    // Create headers with timestamp, report type + all message keys
    const headers = ['timestamp', 'report_type', 'username', ...Array.from(allMessageKeys)];
    
    const csvRows = [headers.join(',')];
    
    // Add data rows
    reports.forEach(report => {
      const rowData = {
        // Format timestamp without commas to avoid CSV issues
        timestamp: new Date(report.timestamp).toLocaleString().replace(/,/g, ''),
        report_type: getReportTypeName(report.report_type),
        username: report.username || ''
      };
      
      // Try to get data from parsedMessage if it exists
      if (report.parsedMessage) {
        headers.slice(3).forEach(key => {
          let value = report.parsedMessage[key];
          // Handle nested arrays or objects
          if (Array.isArray(value)) {
            value = value.join(';');
          } else if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value).replace(/,/g, ';');
          }
          rowData[key] = value !== undefined ? String(value).replace(/,/g, ';') : '';
        });
      }
      
      // Add row to CSV
      csvRows.push(headers.map(header => rowData[header] || '').join(','));
    });
    
    return csvRows.join('\n');
  }, [excludedFields, reportSpecificExcludedFields, getReportTypeName]);

  // Download CSV function
  const downloadCSV = useCallback(() => {
    const csvContent = convertToCSV(filteredReports);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedReportType}_report_${selectedDriver || 'all_users'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);  // Clean up the URL object
  }, [filteredReports, convertToCSV, selectedReportType, selectedDriver]);

  // UI styles
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0
    },
    homeLink: {
      textDecoration: 'none',
      padding: '6px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      backgroundColor: '#f9fafb'
    },
    errorContainer: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '10px',
      marginBottom: '15px',
      borderRadius: '4px',
      border: '1px solid #ef4444'
    },
    filtersContainer: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f3f4f6',
      borderRadius: '4px'
    },
    filterRow: {
      display: 'flex',
      flexWrap: 'wrap',
      marginBottom: '10px'
    },
    filterGroup: {
      marginRight: '20px',
      marginBottom: '10px'
    },
    label: {
      marginRight: '10px',
      fontWeight: 'bold'
    },
    select: {
      padding: '6px',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      minWidth: '200px'
    },
    button: {
      border: '1px solid #d1d5db',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#f9fafb',
      marginRight: '10px',
      fontWeight: 'bold'
    },
    primaryButton: {
      border: '1px solid #3b82f6',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#3b82f6',
      color: 'white',
      marginRight: '10px',
      fontWeight: 'bold'
    },
    disabledButton: {
      border: '1px solid #d1d5db',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'not-allowed',
      backgroundColor: '#f3f4f6',
      color: '#9ca3af',
      marginRight: '10px',
      fontWeight: 'bold'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '30px',
      backgroundColor: '#f3f4f6',
      borderRadius: '4px'
    },
    loadingText: {
      color: '#6b7280',
      fontSize: '16px'
    },
    actionsContainer: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginTop: '20px'
    }
  };

  return (
    <>
    <Header/>
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>System Reports</h1>
        <a href="/" style={styles.homeLink}>
          Home
        </a>
      </div>
      
      {error && <div style={styles.errorContainer}>
        <strong>Error:</strong> {error}
      </div>}
      
      <div style={styles.filtersContainer}>
        <h2>Report Filters</h2>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label htmlFor="report-type-select" style={styles.label}>Report type:</label>
            <select
              id="report-type-select"
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              style={styles.select}
            >
              {reportTypes.map((type, index) => (
                <option key={index} value={type}>{getReportTypeName(type)}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.filterGroup}>
            <label htmlFor="driver-select" style={styles.label}>User:</label>
            <select
              id="driver-select"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              style={styles.select}
            >
              <option value="">All users</option>
              {userList.map((user, index) => (
                <option key={index} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading report data...</p>
        </div>
      ) : (
        <>
          <div style={styles.actionsContainer}>            
            <button 
              onClick={downloadCSV}
              disabled={filteredReports.length === 0}
              style={filteredReports.length === 0 ? styles.disabledButton : styles.primaryButton}
            >
              Download CSV
            </button>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <p>
              {filteredReports.length === 0 ? 
                `No data available for ${getReportTypeName(selectedReportType)} ${selectedDriver ? `for user ${selectedDriver}` : ''}` : 
                `${filteredReports.length} entries available for this report`}
            </p>
          </div>
          
          {/* CSV Preview Section */}
          <div style={{ marginTop: '20px' }}>
            <h2>CSV Preview</h2>
            <p>Below is a preview of how the CSV will look when downloaded:</p>
            
            <div style={{
              marginTop: '10px',
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '300px',
              overflowY: 'auto',
              fontSize: '14px'
            }}>
              {filteredReports.length === 0 ? (
                'No data available for preview'
              ) : (
                (() => {
                  // Create a preview with just a few rows
                  const csvContent = convertToCSV(filteredReports.slice(0, 5));
                  return csvContent + (filteredReports.length > 5 ? '\n... (more rows in downloaded file)' : '');
                })()
              )}
            </div>
          </div>
        </>
      )}
    </div>
    <Footer/>
    </>
  );
}

export default Reports;