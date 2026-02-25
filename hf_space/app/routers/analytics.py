"""
Analytics Router - Dashboard Metrics & Insights API
Provides endpoints for analytics, statistics, and AI-powered insights
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.database_models import User
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard metrics for the current user
    
    Returns:
    - Total drafts created
    - Drafts by type breakdown
    - Recent activity (last 30 days)
    - User statistics
    """
    try:
        analytics = AnalyticsService(db)
        metrics = await analytics.get_dashboard_metrics(current_user.id)
        
        return {
            "status": "success",
            "data": metrics
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching dashboard metrics: {str(e)}"
        )

@router.get("/platform", response_model=Dict[str, Any])
async def get_platform_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get platform-wide analytics (admin/all users)
    
    Returns:
    - Total users and drafts
    - Most popular draft types
    - User growth metrics
    - Engagement statistics
    """
    try:
        analytics = AnalyticsService(db)
        platform_stats = await analytics.get_platform_analytics()
        
        return {
            "status": "success",
            "data": platform_stats
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching platform analytics: {str(e)}"
        )

@router.get("/citations", response_model=Dict[str, Any])
async def get_citation_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get citation analytics and most cited judgments
    
    Returns:
    - Most cited judgments with counts
    - Trending cases
    - Citations by category
    
    NOTE: Integrates with dataset builder's vector database
    """
    try:
        analytics = AnalyticsService(db)
        citation_stats = await analytics.get_citation_analytics()
        
        return {
            "status": "success",
            "data": citation_stats
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching citation analytics: {str(e)}"
        )

@router.get("/insights", response_model=Dict[str, Any])
async def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered insights and predictions for the user
    
    Returns:
    - Success rate predictions
    - Personalized recommendations
    - Case complexity assessment
    - Pattern analysis from user's history
    """
    try:
        analytics = AnalyticsService(db)
        insights = await analytics.get_ai_insights(current_user.id)
        
        return {
            "status": "success",
            "data": insights
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching AI insights: {str(e)}"
        )

@router.get("/court-updates", response_model=Dict[str, Any])
async def get_recent_court_updates(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get recent court updates and judgments
    
    Parameters:
    - limit: Number of updates to return (default: 10)
    
    Returns:
    - List of recent court judgments and updates
    - Categorized by importance and court
    
    NOTE: Would integrate with live court RSS feeds/APIs
    """
    try:
        analytics = AnalyticsService(db)
        updates = await analytics.get_recent_court_updates(limit)
        
        return {
            "status": "success",
            "count": len(updates),
            "data": updates
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching court updates: {str(e)}"
        )

@router.get("/stats/summary", response_model=Dict[str, Any])
async def get_stats_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get quick statistics summary for dashboard widgets
    
    Returns condensed metrics for quick display:
    - Total drafts
    - Recent activity count
    - AI confidence score
    - Platform stats
    """
    try:
        analytics = AnalyticsService(db)
        
        # Get multiple metrics in parallel
        dashboard = await analytics.get_dashboard_metrics(current_user.id)
        insights = await analytics.get_ai_insights(current_user.id)
        platform = await analytics.get_platform_analytics()
        
        return {
            "status": "success",
            "data": {
                "user_metrics": {
                    "total_drafts": dashboard.get("total_drafts", 0),
                    "recent_activity": dashboard.get("recent_activity", {}).get("last_30_days", 0)
                },
                "ai_metrics": {
                    "success_rate": insights.get("success_prediction", {}).get("rate", 0),
                    "confidence": insights.get("success_prediction", {}).get("confidence", 0)
                },
                "platform_metrics": {
                    "total_users": platform.get("overview", {}).get("total_users", 0),
                    "total_petitions": platform.get("overview", {}).get("total_drafts", 0)
                }
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching stats summary: {str(e)}"
        )
