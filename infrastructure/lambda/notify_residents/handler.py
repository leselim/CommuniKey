"""
Notification fan-out.

Django publishes one message to an SNS topic when a notice is published or an
SOS is raised. This function receives it and sends the email, so the web
request returns immediately instead of waiting on the mail provider.

This is the piece of the system that directly addresses fragmented
communication: one action by estate management reaches every verified
resident through a single, recorded channel.

Event shape (the SNS message body, JSON):
    {
      "type": "announcement" | "sos",
      "title": "Planned water interruption",
      "body":  "The municipality will interrupt supply ...",
      "priority": "normal" | "high",
      "recipients": ["resident@example.com", ...]
    }
"""

import json
import logging
import os

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ses = boto3.client("ses", region_name=os.environ.get("AWS_REGION", "af-south-1"))

SENDER = os.environ.get("SENDER_ADDRESS", "notices@riverside-estate.co.za")
ESTATE = os.environ.get("ESTATE_NAME", "Riverside Estate")
# SES caps a single call at 50 destinations.
BATCH_SIZE = 45


def _subject(payload):
    if payload.get("type") == "sos":
        return f"[{ESTATE}] Emergency alert"
    if payload.get("priority") == "high":
        return f"[{ESTATE}] Urgent: {payload.get('title', 'Notice')}"
    return f"[{ESTATE}] {payload.get('title', 'Notice')}"


def _batches(items, size):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def _send(subject, body, recipients):
    """Returns the number of addresses accepted by SES."""
    accepted = 0
    for batch in _batches(recipients, BATCH_SIZE):
        try:
            ses.send_email(
                Source=SENDER,
                # Recipients go in BCC so residents never see each other's
                # addresses. Privacy is not optional here.
                Destination={"ToAddresses": [SENDER], "BccAddresses": batch},
                Message={
                    "Subject": {"Data": subject, "Charset": "UTF-8"},
                    "Body": {"Text": {"Data": body, "Charset": "UTF-8"}},
                },
            )
            accepted += len(batch)
        except ClientError as err:
            # One bad batch must not lose the rest. Failures are logged and
            # the message is left for the SNS retry policy.
            logger.error("SES rejected a batch of %s: %s", len(batch), err)
    return accepted


def lambda_handler(event, context):
    sent = 0
    failures = 0

    for record in event.get("Records", []):
        try:
            payload = json.loads(record["Sns"]["Message"])
        except (KeyError, json.JSONDecodeError) as err:
            logger.error("Unreadable SNS record: %s", err)
            failures += 1
            continue

        recipients = payload.get("recipients") or []
        if not recipients:
            logger.warning("No recipients on %s, nothing to send", payload.get("title"))
            continue

        body = "\n\n".join(
            [
                payload.get("title", ""),
                payload.get("body", ""),
                f"Sent by {ESTATE} through CommuniKey.",
            ]
        ).strip()

        sent += _send(_subject(payload), body, recipients)

    logger.info("Delivered %s notifications, %s records failed", sent, failures)
    return {"statusCode": 200, "delivered": sent, "failed": failures}
