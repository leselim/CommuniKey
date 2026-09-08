"""
Analytics endpoints.

Every figure returned here is aggregated from the database by the ORM. There
are no stored presets: the same query that produces the dashboard would
produce different numbers tomorrow, because it reads the incidents table.

Grouping is done with database functions (TruncDate, TruncWeek, Count, Avg)
so the work happens in Postgres rather than by pulling rows into Python.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, F, FloatField, Q
from django.db.models.functions import TruncDate, TruncHour, TruncWeek
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.announcements.models import Announcement
from apps.emergency.models import SOSAlert
from apps.events.models import Event
from apps.incidents.models import IncidentReport

from .models import AuditLog
from .serializers import AuditLogSerializer

User = get_user_model()

RANGE_DAYS = {"7d": 7, "30d": 30, "90d": 84}
RESOLVED = "Resolved"
UNDER_REVIEW = "Under review"


def _window(request):
    """Resolve the requested trailing window, defaulting to 30 days."""
    key = request.query_params.get("period", "30d")
    days = RANGE_DAYS.get(key, 30)
    end = timezone.now()
    return key, days, end - timedelta(days=days), end


def _percent(part, whole):
    return round((part / whole) * 100, 1) if whole else 0.0


class AnalyticsOverviewView(APIView):
    """Totals, a time series, and breakdowns for the estate dashboard."""

    def get(self, request):
        period, days, start, end = _window(request)

        current = IncidentReport.objects.filter(date_reported__range=(start, end))
        previous = IncidentReport.objects.filter(
            date_reported__range=(start - timedelta(days=days), start)
        )

        # One pass over the table for the status split.
        counts = current.aggregate(
            total=Count("id"),
            resolved=Count("id", filter=Q(status=RESOLVED)),
            review=Count("id", filter=Q(status=UNDER_REVIEW)),
        )
        total = counts["total"] or 0
        resolved = counts["resolved"] or 0
        review = counts["review"] or 0
        still_open = total - resolved - review

        previous_total = previous.count()
        previous_resolved = previous.filter(status=RESOLVED).count()

        # Time to close, in hours, averaged in the database.
        closure = (
            current.filter(status=RESOLVED, date_resolved__isnull=False)
            .annotate(seconds=(F("date_resolved") - F("date_reported")))
            .aggregate(avg=Avg("seconds"))
        )
        avg_hours = None
        if closure["avg"] is not None:
            avg_hours = round(closure["avg"].total_seconds() / 3600, 1)

        # Daily for short windows, weekly once a daily chart would be unreadable.
        trunc = TruncDate if days <= 31 else TruncWeek
        grouped = (
            current.annotate(bucket=trunc("date_reported"))
            .values("bucket")
            .annotate(
                resolved=Count("id", filter=Q(status=RESOLVED)),
                outstanding=Count("id", filter=~Q(status=RESOLVED)),
            )
            .order_by("bucket")
        )

        timeline = [
            {
                "label": row["bucket"].strftime("%d %b") if row["bucket"] else "",
                "fullLabel": row["bucket"].strftime("%d %B %Y") if row["bucket"] else "",
                "resolved": row["resolved"],
                "outstanding": row["outstanding"],
            }
            for row in grouped
        ]

        by_type = [
            {"label": row["incident_type"], "value": row["count"]}
            for row in current.values("incident_type")
            .annotate(count=Count("id"))
            .order_by("-count")[:8]
        ]

        by_location = [
            {"label": row["location"], "value": row["count"]}
            for row in current.values("location")
            .annotate(count=Count("id"))
            .order_by("-count")[:6]
        ]

        by_hour = [
            {"label": row["bucket"].strftime("%H"), "value": row["count"]}
            for row in current.annotate(bucket=TruncHour("date_reported"))
            .values("bucket")
            .annotate(count=Count("id"))
            .order_by("bucket")
        ]

        role_distribution = [
            {"role": row["role"] or "Resident", "count": row["count"]}
            for row in User.objects.values("role").annotate(count=Count("id")).order_by("-count")
        ]

        return Response(
            {
                "success": True,
                "message": "Estate analytics retrieved.",
                "data": {
                    "period": period,
                    "days": days,
                    "date_range": {
                        "start": start.date().isoformat(),
                        "end": end.date().isoformat(),
                        "label": f"{start.strftime('%d %b')} to {end.strftime('%d %b %Y')}",
                    },
                    "metrics": {
                        "total_incidents": total,
                        "resolved_incidents": resolved,
                        "review_incidents": review,
                        "open_incidents": still_open,
                        "resolution_rate": _percent(resolved, total),
                        "resolution_rate_change": round(
                            _percent(resolved, total) - _percent(previous_resolved, previous_total),
                            1,
                        ),
                        "reported_change_pct": (
                            round(((total - previous_total) / previous_total) * 100)
                            if previous_total
                            else 0
                        ),
                        "avg_hours_to_close": avg_hours,
                        "total_users": User.objects.count(),
                        "active_sos_alerts": SOSAlert.objects.filter(status="Active").count(),
                        "announcements_published": Announcement.objects.filter(
                            date_published__range=(start, end)
                        ).count(),
                        "upcoming_events": Event.objects.filter(event_date__gte=end).count(),
                    },
                    "timeline": timeline,
                    "by_type": by_type,
                    "by_location": by_location,
                    "by_hour": by_hour,
                    "role_distribution": role_distribution,
                },
            }
        )


class ActivityLogListView(APIView):
    """The audit trail, filtered by free text and role."""

    def get(self, request):
        search = request.query_params.get("search", "").strip()
        role = request.query_params.get("role", "All")

        logs = AuditLog.objects.all().order_by("-timestamp")

        if role and role != "All":
            logs = logs.filter(role=role)

        if search:
            logs = logs.filter(
                Q(user_name__icontains=search)
                | Q(action__icontains=search)
                | Q(details__icontains=search)
            )

        return Response(
            {
                "success": True,
                "message": "Activity log retrieved.",
                "data": AuditLogSerializer(logs[:200], many=True).data,
            },
            status=status.HTTP_200_OK,
        )
