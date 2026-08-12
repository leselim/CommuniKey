output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.ccp_vpc.id
}

output "public_subnet_id" {
  description = "The ID of the public subnet"
  value       = aws_subnet.public_subnet.id
}

output "ec2_public_ip" {
  description = "Public IP address of the backend EC2 server"
  value       = aws_instance.backend_server.public_ip
}

output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint"
  value       = aws_db_instance.ccp_db.endpoint
  sensitive   = true
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket for assets"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "security_group_id" {
  description = "The security group ID for the backend service"
  value       = aws_security_group.backend_sg.id
}
