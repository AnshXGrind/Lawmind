"""
Audit Logging Service - Track User Actions & Security Events
Comprehensive logging system for compliance, security, and debugging
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum
import json

class AuditAction(str, Enum):
    """Types of actions to audit"""
    # Authentication
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_REGISTER = "user_register"
    PASSWORD_CHANGE = "password_change"
    FAILED_LOGIN = "failed_login"
    
    # Document actions
    DRAFT_CREATE = "draft_create"
    DRAFT_UPDATE = "draft_update"
    DRAFT_DELETE = "draft_delete"
    DRAFT_EXPORT = "draft_export"
    
    # AI operations
    AI_QUERY = "ai_query"
    CASE_SEARCH = "case_search"
    CITATION_SEARCH = "citation_search"
    
    # Dataset operations
    DATASET_UPDATE = "dataset_update"
    DATASET_SEARCH = "dataset_search"
    
    # Admin actions
    USER_ROLE_CHANGE = "user_role_change"
    USER_DELETE = "user_delete"
    SYSTEM_CONFIG_CHANGE = "system_config_change"
    
    # Security events
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    UNAUTHORIZED_ACCESS = "unauthorized_access"

class AuditLevel(str, Enum):
    """Severity levels for audit logs"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class AuditLog:
    """
    In-memory audit log structure
    In production, this would be a database model or external logging service
    """
    def __init__(
        self,
        action: AuditAction,
        user_id: Optional[int],
        user_email: Optional[str],
        level: AuditLevel,
        details: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        self.id = None  # Would be set by database
        self.action = action
        self.user_id = user_id
        self.user_email = user_email
        self.level = level
        self.details = details
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.timestamp = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "action": self.action.value,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "level": self.level.value,
            "details": self.details,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "timestamp": self.timestamp.isoformat()
        }

class AuditService:
    """Service for creating and managing audit logs"""
    
    # In-memory storage (replace with database table in production)
    _logs: List[AuditLog] = []
    
    def __init__(self, db: Session):
        self.db = db
    
    @classmethod
    def log(
        cls,
        action: AuditAction,
        user_id: Optional[int] = None,
        user_email: Optional[str] = None,
        level: AuditLevel = AuditLevel.INFO,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        """
        Create an audit log entry
        
        Args:
            action: Type of action performed
            user_id: ID of user who performed action
            user_email: Email of user who performed action
            level: Severity level
            details: Additional context/details
            ip_address: User's IP address
            user_agent: User's browser/client info
            
        Returns:
            Created AuditLog object
        """
        log_entry = AuditLog(
            action=action,
            user_id=user_id,
            user_email=user_email,
            level=level,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Store in memory (in production, save to database)
        cls._logs.append(log_entry)
        
        # Also print to console for debugging
        print(f"[AUDIT] {log_entry.level.value.upper()}: {log_entry.action.value} by {user_email or 'anonymous'}")
        
        # In production, you would:
        # 1. Save to database table
        # 2. Send to external logging service (e.g., CloudWatch, Datadog)
        # 3. Trigger alerts for critical events
        
        return log_entry
    
    @classmethod
    def get_user_logs(
        cls,
        user_id: int,
        limit: int = 100,
        action_filter: Optional[AuditAction] = None
    ) -> List[AuditLog]:
        """
        Get audit logs for a specific user
        
        Args:
            user_id: User ID to filter by
            limit: Maximum number of logs to return
            action_filter: Optional filter by action type
            
        Returns:
            List of AuditLog entries
        """
        logs = [log for log in cls._logs if log.user_id == user_id]
        
        if action_filter:
            logs = [log for log in logs if log.action == action_filter]
        
        # Sort by timestamp descending
        logs.sort(key=lambda x: x.timestamp, reverse=True)
        
        return logs[:limit]
    
    @classmethod
    def get_recent_logs(
        cls,
        limit: int = 100,
        level_filter: Optional[AuditLevel] = None
    ) -> List[AuditLog]:
        """
        Get recent audit logs (admin only)
        
        Args:
            limit: Maximum number of logs to return
            level_filter: Optional filter by severity level
            
        Returns:
            List of AuditLog entries
        """
        logs = cls._logs.copy()
        
        if level_filter:
            logs = [log for log in logs if log.level == level_filter]
        
        # Sort by timestamp descending
        logs.sort(key=lambda x: x.timestamp, reverse=True)
        
        return logs[:limit]
    
    @classmethod
    def get_security_events(cls, limit: int = 50) -> List[AuditLog]:
        """
        Get recent security-related events
        
        Returns logs with WARNING, ERROR, or CRITICAL levels
        """
        security_logs = [
            log for log in cls._logs
            if log.level in [AuditLevel.WARNING, AuditLevel.ERROR, AuditLevel.CRITICAL]
        ]
        
        security_logs.sort(key=lambda x: x.timestamp, reverse=True)
        return security_logs[:limit]
    
    @classmethod
    def get_statistics(cls) -> Dict[str, Any]:
        """
        Get audit log statistics
        
        Returns:
            Dictionary with counts and metrics
        """
        total_logs = len(cls._logs)
        
        # Count by level
        level_counts = {}
        for level in AuditLevel:
            level_counts[level.value] = sum(1 for log in cls._logs if log.level == level)
        
        # Count by action
        action_counts = {}
        for action in AuditAction:
            action_counts[action.value] = sum(1 for log in cls._logs if log.action == action)
        
        # Get most active users
        user_activity = {}
        for log in cls._logs:
            if log.user_id:
                user_activity[log.user_id] = user_activity.get(log.user_id, 0) + 1
        
        most_active = sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "total_logs": total_logs,
            "by_level": level_counts,
            "by_action": action_counts,
            "most_active_users": [
                {"user_id": uid, "action_count": count}
                for uid, count in most_active
            ]
        }
    
    @classmethod
    def clear_old_logs(cls, days: int = 90):
        """
        Clear logs older than specified days
        (In production, archive to cold storage instead of deleting)
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        cls._logs = [log for log in cls._logs if log.timestamp >= cutoff_date]
        print(f"[AUDIT] Cleared logs older than {days} days")

# Convenience functions for common audit events

def audit_login(user_id: int, user_email: str, ip_address: str, success: bool = True):
    """Audit user login attempt"""
    if success:
        AuditService.log(
            action=AuditAction.USER_LOGIN,
            user_id=user_id,
            user_email=user_email,
            level=AuditLevel.INFO,
            details={"success": True},
            ip_address=ip_address
        )
    else:
        AuditService.log(
            action=AuditAction.FAILED_LOGIN,
            user_email=user_email,
            level=AuditLevel.WARNING,
            details={"success": False, "reason": "Invalid credentials"},
            ip_address=ip_address
        )

def audit_draft_action(action: AuditAction, user_id: int, user_email: str, draft_id: int, draft_type: str):
    """Audit draft-related actions"""
    AuditService.log(
        action=action,
        user_id=user_id,
        user_email=user_email,
        level=AuditLevel.INFO,
        details={
            "draft_id": draft_id,
            "draft_type": draft_type
        }
    )

def audit_security_event(action: AuditAction, details: Dict[str, Any], ip_address: str, level: AuditLevel = AuditLevel.WARNING):
    """Audit security-related events"""
    AuditService.log(
        action=action,
        level=level,
        details=details,
        ip_address=ip_address
    )
