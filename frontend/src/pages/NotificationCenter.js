import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationCenter.css';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    unreadOnly: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system_alert',
    priority: 'medium',
    recipients: [],
    actionRequired: false,
    actionText: '',
    actionUrl: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filters]);

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.unreadOnly) params.append('unreadOnly', 'true');

      const response = await axios.get(`http://localhost:5000/api/notifications?${params}`);
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch notifications');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications/stats/overview');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/notifications', newNotification);
      setShowCreateModal(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'system_alert',
        priority: 'medium',
        recipients: [],
        actionRequired: false,
        actionText: '',
        actionUrl: ''
      });
      fetchNotifications();
      fetchStats();
    } catch (err) {
      setError('Failed to create notification');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        userId: 'current-user-id' // In real app, get from auth context
      });
      fetchNotifications();
      fetchStats();
    } catch (err) {
      setError('Failed to mark as read');
    }
  };

  const resolveNotification = async (notificationId) => {
    try {
      await axios.post(`http://localhost:5000/api/notifications/${notificationId}/resolve`, {
        resolvedBy: 'current-user-id' // In real app, get from auth context
      });
      fetchNotifications();
      fetchStats();
    } catch (err) {
      setError('Failed to resolve notification');
    }
  };

  const trackAction = async (notificationId, action) => {
    try {
      await axios.post(`http://localhost:5000/api/notifications/${notificationId}/track`, {
        action
      });
    } catch (err) {
      console.error('Failed to track action');
    }
  };

  const generateAINotification = async (type, context) => {
    try {
      await axios.post('http://localhost:5000/api/notifications/generate-ai', {
        type,
        context,
        recipients: [{ role: 'admin' }]
      });
      fetchNotifications();
      fetchStats();
    } catch (err) {
      setError('Failed to generate AI notification');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'inventory_alert': return '📦';
      case 'equipment_maintenance': return '🔧';
      case 'vehicle_alert': return '🚗';
      case 'employee_alert': return '👥';
      case 'booking_update': return '📅';
      case 'system_alert': return '⚠️';
      case 'ai_recommendation': return '🤖';
      case 'performance_insight': return '📊';
      case 'cost_optimization': return '💰';
      default: return '📢';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h1>🔔 Notification Center</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Create Notification
          </button>
          <button className="btn-secondary" onClick={fetchNotifications}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics Dashboard */}
      {stats && (
        <div className="stats-dashboard">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Notifications</h3>
              <div className="stat-number">{stats.overview.total}</div>
            </div>
            <div className="stat-card">
              <h3>Unread</h3>
              <div className="stat-number unread">{stats.overview.unread}</div>
            </div>
            <div className="stat-card">
              <h3>Critical</h3>
              <div className="stat-number critical">{stats.overview.critical}</div>
            </div>
            <div className="stat-card">
              <h3>AI Generated</h3>
              <div className="stat-number ai">{stats.overview.aiGenerated}</div>
            </div>
            <div className="stat-card">
              <h3>Resolved</h3>
              <div className="stat-number resolved">{stats.overview.resolved}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="inventory_alert">Inventory Alert</option>
            <option value="equipment_maintenance">Equipment Maintenance</option>
            <option value="vehicle_alert">Vehicle Alert</option>
            <option value="employee_alert">Employee Alert</option>
            <option value="ai_recommendation">AI Recommendation</option>
            <option value="system_alert">System Alert</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.unreadOnly}
              onChange={(e) => setFilters({...filters, unreadOnly: e.target.checked})}
            />
            Unread Only
          </label>
        </div>

        <div className="ai-actions">
          <button
            className="btn-ai"
            onClick={() => generateAINotification('inventory_alert', {
              name: 'Sample Item',
              quantity: 5,
              minThreshold: 10,
              id: 'sample-id'
            })}
          >
            🤖 Generate AI Inventory Alert
          </button>
          <button
            className="btn-ai"
            onClick={() => generateAINotification('equipment_maintenance', {
              name: 'Sample Equipment',
              utilizationRate: 85,
              id: 'sample-id'
            })}
          >
            🤖 Generate AI Maintenance Alert
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <h3>No notifications found</h3>
            <p>Try adjusting your filters or create a new notification</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.resolved ? 'resolved' : ''}`}
              onClick={() => {
                setSelectedNotification(notification);
                setShowDetails(true);
                trackAction(notification._id, 'click');
              }}
            >
              <div className="notification-icon">
                {getTypeIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-header-item">
                  <h4>{notification.title}</h4>
                  <div className="notification-meta">
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    >
                      {notification.priority}
                    </span>
                    {notification.aiGenerated && (
                      <span className="ai-badge">🤖 AI</span>
                    )}
                    <span className="time-ago">{formatTimeAgo(notification.createdAt)}</span>
                  </div>
                </div>

                <p className="notification-message">{notification.message}</p>

                {notification.aiInsights && (
                  <div className="ai-insights-preview">
                    <span className="confidence">
                      Confidence: {(notification.aiInsights.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="impact">
                      Impact: {notification.aiInsights.impact}
                    </span>
                  </div>
                )}

                <div className="notification-actions-preview">
                  {notification.actionRequired && (
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        trackAction(notification._id, 'action');
                        if (notification.actionUrl) {
                          window.open(notification.actionUrl, '_blank');
                        }
                      }}
                    >
                      {notification.actionText || 'Take Action'}
                    </button>
                  )}

                  <button
                    className="mark-read-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                  >
                    ✓ Mark Read
                  </button>

                  <button
                    className="resolve-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      resolveNotification(notification._id);
                    }}
                  >
                    ✅ Resolve
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>➕ Create New Notification</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateNotification}>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Message:</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  required
                  rows="3"
                  className="form-textarea"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type:</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  >
                    <option value="system_alert">System Alert</option>
                    <option value="inventory_alert">Inventory Alert</option>
                    <option value="equipment_maintenance">Equipment Maintenance</option>
                    <option value="vehicle_alert">Vehicle Alert</option>
                    <option value="employee_alert">Employee Alert</option>
                    <option value="ai_recommendation">AI Recommendation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority:</label>
                  <select
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newNotification.actionRequired}
                    onChange={(e) => setNewNotification({...newNotification, actionRequired: e.target.checked})}
                  />
                  Action Required
                </label>
              </div>
              {newNotification.actionRequired && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Action Text:</label>
                    <input
                      type="text"
                      value={newNotification.actionText}
                      onChange={(e) => setNewNotification({...newNotification, actionText: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Action URL:</label>
                    <input
                      type="text"
                      value={newNotification.actionUrl}
                      onChange={(e) => setNewNotification({...newNotification, actionUrl: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Notification</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {showDetails && selectedNotification && (
        <div className="modal-overlay">
          <div className="modal details-modal">
            <div className="modal-header">
              <h2>{getTypeIcon(selectedNotification.type)} {selectedNotification.title}</h2>
              <button className="close-btn" onClick={() => setShowDetails(false)}>✕</button>
            </div>
            <div className="notification-details">
              <div className="details-header">
                <span
                  className="priority-badge large"
                  style={{ backgroundColor: getPriorityColor(selectedNotification.priority) }}
                >
                  {selectedNotification.priority} Priority
                </span>
                {selectedNotification.aiGenerated && (
                  <span className="ai-badge large">🤖 AI Generated</span>
                )}
              </div>

              <div className="details-content">
                <p><strong>Message:</strong> {selectedNotification.message}</p>
                <p><strong>Type:</strong> {selectedNotification.type}</p>
                <p><strong>Created:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}</p>

                {selectedNotification.aiInsights && (
                  <div className="ai-insights-details">
                    <h4>🤖 AI Insights:</h4>
                    <div className="insights-grid">
                      <div className="insight-item">
                        <span>Confidence:</span>
                        <span>{(selectedNotification.aiInsights.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="insight-item">
                        <span>Impact:</span>
                        <span>{selectedNotification.aiInsights.impact}</span>
                      </div>
                      <div className="insight-item">
                        <span>Urgency:</span>
                        <span>{selectedNotification.aiInsights.urgency}</span>
                      </div>
                    </div>
                    {selectedNotification.aiInsights.reasoning && (
                      <p><strong>Reasoning:</strong> {selectedNotification.aiInsights.reasoning}</p>
                    )}
                    {selectedNotification.aiInsights.suggestedActions && (
                      <div className="suggested-actions">
                        <h5>Suggested Actions:</h5>
                        <ul>
                          {selectedNotification.aiInsights.suggestedActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="details-actions">
                {selectedNotification.actionRequired && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      trackAction(selectedNotification._id, 'action');
                      if (selectedNotification.actionUrl) {
                        window.open(selectedNotification.actionUrl, '_blank');
                      }
                    }}
                  >
                    {selectedNotification.actionText || 'Take Action'}
                  </button>
                )}
                <button
                  className="btn-secondary"
                  onClick={() => {
                    markAsRead(selectedNotification._id);
                    setShowDetails(false);
                  }}
                >
                  Mark as Read
                </button>
                <button
                  className="btn-resolve"
                  onClick={() => {
                    resolveNotification(selectedNotification._id);
                    setShowDetails(false);
                  }}
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
