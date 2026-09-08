output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.ccp_vpc.id
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket for assets"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "security_group_id" {
  description = "The security group ID for the backend service"
  value       = aws_security_group.backend_sg.id
}

output "notifications_topic_arn" {
  description = "Publish estate notifications here from Django"
  value       = aws_sns_topic.estate_notifications.arn
}

output "documents_bucket" {
  description = "Private bucket holding proof of residence uploads"
  value       = aws_s3_bucket.documents.id
}
