import React from 'react';
import { useViewAs } from '../components/ViewAsContext';

function ViewAsButton({ driverId, driverName }) {
  const { startImpersonation, currentUserRole } = useViewAs();

  if (currentUserRole !== "sponsor") return null;

  const handleClick = () => {
    fetch(`http://44.202.51.190:8000/api/view-as-driver/${driverId}`, {
    // fetch(`http://localhost:8000/api/view-as-driver/${driverId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('IdToken')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.view_as === "driver") {
          startImpersonation("driver", data.data);
        }
      })
      .catch(err => console.error("Error viewing as driver:", err));
  };

  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      onClick={handleClick}
    >
      View as {driverName}
    </button>
  );
}

export default ViewAsButton;
