"""Analytics Service - stub"""
class AnalyticsService:
    def get_usage_stats(self, user_id=None): return {"total_drafts": 0}
    def get_document_type_stats(self, user_id=None): return []
    def get_recent_activity(self, user_id=None, limit=10): return []

analytics_service = AnalyticsService()