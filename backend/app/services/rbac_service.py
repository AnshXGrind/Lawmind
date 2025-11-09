"""
RBAC Service - Role-Based Access Control & Permissions
Manages user roles, permissions, and access control for LawMind platform
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.database_models import User

class UserRole(str, Enum):
    """User roles with hierarchical permissions"""
    ADMIN = "admin"              # Full system access
    ADVOCATE = "advocate"        # Professional lawyer - full features
    STUDENT = "student"          # Law student - limited features
    GUEST = "guest"              # Trial user - restricted access

class Permission(str, Enum):
    """Granular permissions for feature access"""
    # Document permissions
    CREATE_DRAFT = "create_draft"
    EDIT_DRAFT = "edit_draft"
    DELETE_DRAFT = "delete_draft"
    EXPORT_PDF = "export_pdf"
    
    # AI features
    USE_AI_QUERY = "use_ai_query"
    ADVANCED_AI = "advanced_ai"
    PRECEDENT_ANALYSIS = "precedent_analysis"
    
    # Dataset features
    SEARCH_CASES = "search_cases"
    ACCESS_FULL_DATABASE = "access_full_database"
    TRIGGER_DATASET_UPDATE = "trigger_dataset_update"
    
    # Analytics
    VIEW_ANALYTICS = "view_analytics"
    VIEW_PLATFORM_ANALYTICS = "view_platform_analytics"
    
    # Admin
    MANAGE_USERS = "manage_users"
    VIEW_AUDIT_LOGS = "view_audit_logs"
    SYSTEM_CONFIG = "system_config"

# Role-Permission mapping
ROLE_PERMISSIONS: Dict[UserRole, List[Permission]] = {
    UserRole.ADMIN: list(Permission),  # All permissions
    
    UserRole.ADVOCATE: [
        Permission.CREATE_DRAFT,
        Permission.EDIT_DRAFT,
        Permission.DELETE_DRAFT,
        Permission.EXPORT_PDF,
        Permission.USE_AI_QUERY,
        Permission.ADVANCED_AI,
        Permission.PRECEDENT_ANALYSIS,
        Permission.SEARCH_CASES,
        Permission.ACCESS_FULL_DATABASE,
        Permission.VIEW_ANALYTICS,
    ],
    
    UserRole.STUDENT: [
        Permission.CREATE_DRAFT,
        Permission.EDIT_DRAFT,
        Permission.EXPORT_PDF,
        Permission.USE_AI_QUERY,
        Permission.SEARCH_CASES,
        Permission.VIEW_ANALYTICS,
    ],
    
    UserRole.GUEST: [
        Permission.CREATE_DRAFT,
        Permission.SEARCH_CASES,
    ]
}

class RBACService:
    """Service for managing role-based access control"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_role(self, user: User) -> UserRole:
        """Get user's role (default to ADVOCATE if not set)"""
        role = getattr(user, 'role', 'advocate')
        try:
            return UserRole(role.lower())
        except ValueError:
            return UserRole.ADVOCATE
    
    def get_user_permissions(self, user: User) -> List[Permission]:
        """Get all permissions for a user based on their role"""
        role = self.get_user_role(user)
        return ROLE_PERMISSIONS.get(role, [])
    
    def has_permission(self, user: User, permission: Permission) -> bool:
        """Check if user has a specific permission"""
        user_permissions = self.get_user_permissions(user)
        return permission in user_permissions
    
    def require_permission(self, user: User, permission: Permission) -> bool:
        """
        Require user to have a permission, raise exception if not
        
        Raises:
            PermissionError: If user doesn't have the required permission
        """
        if not self.has_permission(user, permission):
            raise PermissionError(
                f"User '{user.email}' with role '{self.get_user_role(user)}' "
                f"does not have permission: {permission.value}"
            )
        return True
    
    def require_role(self, user: User, required_role: UserRole) -> bool:
        """
        Require user to have a specific role or higher
        
        Raises:
            PermissionError: If user doesn't have the required role
        """
        user_role = self.get_user_role(user)
        
        # Role hierarchy: ADMIN > ADVOCATE > STUDENT > GUEST
        role_hierarchy = {
            UserRole.ADMIN: 4,
            UserRole.ADVOCATE: 3,
            UserRole.STUDENT: 2,
            UserRole.GUEST: 1
        }
        
        if role_hierarchy.get(user_role, 0) < role_hierarchy.get(required_role, 0):
            raise PermissionError(
                f"User '{user.email}' requires role '{required_role.value}' or higher. "
                f"Current role: '{user_role.value}'"
            )
        return True
    
    def update_user_role(self, admin_user: User, target_user_id: int, new_role: UserRole) -> bool:
        """
        Update a user's role (admin only)
        
        Args:
            admin_user: User performing the action (must be admin)
            target_user_id: ID of user whose role to update
            new_role: New role to assign
            
        Returns:
            True if successful
            
        Raises:
            PermissionError: If admin_user is not admin
        """
        self.require_permission(admin_user, Permission.MANAGE_USERS)
        
        target_user = self.db.query(User).filter(User.id == target_user_id).first()
        if not target_user:
            raise ValueError(f"User with ID {target_user_id} not found")
        
        # Update role (assuming role field exists in User model)
        # If not, this would need to be added to the database schema
        if hasattr(target_user, 'role'):
            target_user.role = new_role.value
            self.db.commit()
            return True
        else:
            # For now, store in metadata or handle gracefully
            print(f"Warning: Role field not found in User model. Cannot update role for user {target_user_id}")
            return False
    
    def get_feature_limits(self, user: User) -> Dict[str, Any]:
        """
        Get feature usage limits based on user role
        
        Returns:
            Dictionary with limits for various features
        """
        role = self.get_user_role(user)
        
        limits = {
            UserRole.ADMIN: {
                "max_drafts_per_month": -1,  # Unlimited
                "max_ai_queries_per_day": -1,
                "max_case_searches_per_day": -1,
                "can_export_pdf": True,
                "can_use_advanced_ai": True,
                "storage_limit_mb": 10000
            },
            UserRole.ADVOCATE: {
                "max_drafts_per_month": 100,
                "max_ai_queries_per_day": 50,
                "max_case_searches_per_day": 100,
                "can_export_pdf": True,
                "can_use_advanced_ai": True,
                "storage_limit_mb": 5000
            },
            UserRole.STUDENT: {
                "max_drafts_per_month": 20,
                "max_ai_queries_per_day": 10,
                "max_case_searches_per_day": 20,
                "can_export_pdf": True,
                "can_use_advanced_ai": False,
                "storage_limit_mb": 1000
            },
            UserRole.GUEST: {
                "max_drafts_per_month": 3,
                "max_ai_queries_per_day": 2,
                "max_case_searches_per_day": 5,
                "can_export_pdf": False,
                "can_use_advanced_ai": False,
                "storage_limit_mb": 100
            }
        }
        
        return limits.get(role, limits[UserRole.GUEST])
