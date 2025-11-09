"""
Analytics Service - Comprehensive Dashboard Metrics
Provides insights for legal professionals including case statistics, 
citation analysis, and AI-powered success predictions.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
from collections import Counter

from app.models.database_models import User, Draft
from app.core.database import get_db

class AnalyticsService:
    """
    Service for generating comprehensive analytics and insights
    for the LawMind legal assistant platform.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_dashboard_metrics(self, user_id: int) -> Dict[str, Any]:
        """
        Get comprehensive dashboard metrics for a user
        
        Returns:
            - Total drafts created
            - Total case searches
            - Recent activity count
            - Success rate predictions
            - Most used features
        """
        try:
            # Get user's drafts
            total_drafts = self.db.query(func.count(Draft.id)).filter(
                Draft.user_id == user_id
            ).scalar() or 0
            
            # Get drafts by type
            drafts_by_type = self.db.query(
                Draft.draft_type,
                func.count(Draft.id).label('count')
            ).filter(
                Draft.user_id == user_id
            ).group_by(Draft.draft_type).all()
            
            # Get recent activity (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_drafts = self.db.query(func.count(Draft.id)).filter(
                Draft.user_id == user_id,
                Draft.created_at >= thirty_days_ago
            ).scalar() or 0
            
            # Get most active day
            drafts_by_day = self.db.query(
                func.date(Draft.created_at).label('date'),
                func.count(Draft.id).label('count')
            ).filter(
                Draft.user_id == user_id
            ).group_by(func.date(Draft.created_at)).all()
            
            most_active_day = max(drafts_by_day, key=lambda x: x.count) if drafts_by_day else None
            
            return {
                "total_drafts": total_drafts,
                "drafts_by_type": {dt: count for dt, count in drafts_by_type},
                "recent_activity": {
                    "last_30_days": recent_drafts,
                    "most_active_day": {
                        "date": str(most_active_day.date) if most_active_day else None,
                        "count": most_active_day.count if most_active_day else 0
                    }
                },
                "user_stats": await self._get_user_stats(user_id)
            }
        
        except Exception as e:
            print(f"Error getting dashboard metrics: {str(e)}")
            return {
                "total_drafts": 0,
                "drafts_by_type": {},
                "recent_activity": {"last_30_days": 0, "most_active_day": {"date": None, "count": 0}},
                "user_stats": {}
            }
    
    async def _get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Get detailed user statistics"""
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {}
        
        return {
            "account_created": str(user.created_at),
            "role": getattr(user, 'role', 'User'),
            "total_sessions": getattr(user, 'total_sessions', 0)
        }
    
    async def get_platform_analytics(self) -> Dict[str, Any]:
        """
        Get platform-wide analytics (admin only)
        
        Returns:
            - Total users
            - Total petitions/drafts
            - Most popular draft types
            - User growth metrics
            - System health
        """
        try:
            # Total users
            total_users = self.db.query(func.count(User.id)).scalar() or 0
            
            # Total drafts
            total_drafts = self.db.query(func.count(Draft.id)).scalar() or 0
            
            # Most popular draft types
            popular_types = self.db.query(
                Draft.draft_type,
                func.count(Draft.id).label('count')
            ).group_by(Draft.draft_type).order_by(desc('count')).limit(5).all()
            
            # User growth (last 7 days)
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            new_users_week = self.db.query(func.count(User.id)).filter(
                User.created_at >= seven_days_ago
            ).scalar() or 0
            
            # Recent activity
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            active_users_month = self.db.query(
                func.count(func.distinct(Draft.user_id))
            ).filter(
                Draft.created_at >= thirty_days_ago
            ).scalar() or 0
            
            return {
                "overview": {
                    "total_users": total_users,
                    "total_drafts": total_drafts,
                    "active_users_30d": active_users_month,
                    "new_users_7d": new_users_week
                },
                "popular_draft_types": [
                    {"type": dt, "count": count} for dt, count in popular_types
                ],
                "growth_metrics": {
                    "user_growth_rate": (new_users_week / max(total_users - new_users_week, 1)) * 100,
                    "engagement_rate": (active_users_month / max(total_users, 1)) * 100
                }
            }
        
        except Exception as e:
            print(f"Error getting platform analytics: {str(e)}")
            return {
                "overview": {"total_users": 0, "total_drafts": 0, "active_users_30d": 0, "new_users_7d": 0},
                "popular_draft_types": [],
                "growth_metrics": {"user_growth_rate": 0, "engagement_rate": 0}
            }
    
    async def get_citation_analytics(self) -> Dict[str, Any]:
        """
        Get citation analytics - most cited judgments, trending cases
        
        NOTE: This requires the dataset builder to be running and populating data.
        For now, returns mock data structure.
        """
        try:
            # TODO: Integrate with ChromaDB to get actual citation data
            # from vector database and judgment metadata
            
            # Mock structure for now
            return {
                "most_cited_judgments": [
                    {
                        "case_name": "Kesavananda Bharati v. State of Kerala",
                        "citation_count": 1247,
                        "year": 1973,
                        "importance": "landmark"
                    },
                    {
                        "case_name": "Maneka Gandhi v. Union of India",
                        "citation_count": 892,
                        "year": 1978,
                        "importance": "landmark"
                    },
                    {
                        "case_name": "Vishaka v. State of Rajasthan",
                        "citation_count": 645,
                        "year": 1997,
                        "importance": "precedent"
                    }
                ],
                "trending_cases": [
                    {
                        "case_name": "Recent Supreme Court Case on Privacy",
                        "trend_score": 85,
                        "category": "constitutional"
                    }
                ],
                "citation_by_category": {
                    "Constitutional": 3245,
                    "Criminal": 2156,
                    "Civil": 1823,
                    "Corporate": 892
                }
            }
        
        except Exception as e:
            print(f"Error getting citation analytics: {str(e)}")
            return {
                "most_cited_judgments": [],
                "trending_cases": [],
                "citation_by_category": {}
            }
    
    async def get_ai_insights(self, user_id: int) -> Dict[str, Any]:
        """
        Get AI-powered insights and predictions
        
        Analyzes user's case history to provide:
        - Success rate predictions
        - Recommended strategies
        - Similar case outcomes
        """
        try:
            # Get user's draft history
            user_drafts = self.db.query(Draft).filter(
                Draft.user_id == user_id
            ).all()
            
            if not user_drafts:
                return {
                    "success_prediction": {
                        "rate": 0,
                        "confidence": 0,
                        "message": "Not enough data for predictions"
                    },
                    "recommendations": [],
                    "insights": []
                }
            
            # Analyze draft types and content
            draft_types = [d.draft_type for d in user_drafts]
            type_counter = Counter(draft_types)
            most_common_type = type_counter.most_common(1)[0] if type_counter else ("Unknown", 0)
            
            # Mock AI insights (would be replaced with actual ML model)
            insights = []
            
            if most_common_type[1] >= 3:
                insights.append({
                    "type": "pattern",
                    "message": f"You frequently work on {most_common_type[0]} cases. Our AI suggests reviewing recent precedents in this area.",
                    "action": "View Similar Cases"
                })
            
            # Success rate prediction (mock - would use actual ML model)
            success_rate = self._calculate_success_prediction(user_drafts)
            
            return {
                "success_prediction": {
                    "rate": success_rate,
                    "confidence": 75,
                    "message": f"Based on similar cases, estimated success rate: {success_rate}%"
                },
                "recommendations": [
                    "Include recent Supreme Court rulings on similar matters",
                    "Strengthen arguments with constitutional provisions",
                    "Consider citing precedents from High Courts"
                ],
                "insights": insights,
                "case_complexity": self._assess_complexity(user_drafts)
            }
        
        except Exception as e:
            print(f"Error getting AI insights: {str(e)}")
            return {
                "success_prediction": {"rate": 0, "confidence": 0, "message": "Error calculating predictions"},
                "recommendations": [],
                "insights": []
            }
    
    def _calculate_success_prediction(self, drafts: List[Draft]) -> float:
        """
        Calculate success prediction based on historical data
        This is a mock implementation - would use actual ML model
        """
        # Mock calculation based on draft quality indicators
        total_score = 0
        
        for draft in drafts[-5:]:  # Last 5 drafts
            score = 50  # Base score
            
            # Add points for comprehensive content
            if draft.content and len(draft.content) > 1000:
                score += 15
            
            # Add points for recent activity
            days_old = (datetime.utcnow() - draft.created_at).days
            if days_old < 30:
                score += 10
            
            total_score += score
        
        avg_score = total_score / min(len(drafts), 5) if drafts else 50
        return min(round(avg_score), 95)  # Cap at 95%
    
    def _assess_complexity(self, drafts: List[Draft]) -> str:
        """Assess case complexity based on draft patterns"""
        if not drafts:
            return "Unknown"
        
        avg_length = sum(len(d.content or "") for d in drafts) / len(drafts)
        
        if avg_length > 5000:
            return "High"
        elif avg_length > 2000:
            return "Medium"
        else:
            return "Low"
    
    async def get_recent_court_updates(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent court updates and judgments
        
        NOTE: This would integrate with live court feeds (RSS/API)
        For now, returns mock data structure
        """
        return [
            {
                "title": "Supreme Court Rules on Data Privacy",
                "court": "Supreme Court of India",
                "date": "2024-11-08",
                "category": "Constitutional",
                "summary": "Landmark judgment on digital privacy rights",
                "importance": "high"
            },
            {
                "title": "New Guidelines for Criminal Appeals",
                "court": "Delhi High Court",
                "date": "2024-11-07",
                "category": "Criminal",
                "summary": "Updated procedural guidelines for appeal filing",
                "importance": "medium"
            },
            {
                "title": "Corporate Governance Standards Updated",
                "court": "Bombay High Court",
                "date": "2024-11-06",
                "category": "Corporate",
                "summary": "New compliance requirements for listed companies",
                "importance": "medium"
            }
        ][:limit]
