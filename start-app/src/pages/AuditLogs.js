import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function LogGroups() {
  const [logs, setLogs] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('/app/login');

  useEffect(() => {
    fetch(`/api/audit-logs?logGroup=${encodeURIComponent(selectedGroup)}`)
      .then(res => res.json())
      .then(data => setLogs(data));
  }, [selectedGroup]);

  const logGroups = ['/app/login', '/app/errors', '/app/operations'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">CloudWatch Audit Logs</h1>

      <select
        className="mb-4 p-2 border rounded"
        value={selectedGroup}
        onChange={e => setSelectedGroup(e.target.value)}
      >
        {logGroups.map(group => (
          <option key={group} value={group}>{group}</option>
        ))}
      </select>

      <ul className="space-y-2">
        {logs.map((log, index) => (
          <li key={index} className="bg-gray-100 p-3 rounded">
            <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
            <pre>{log.message}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LogGroups;
