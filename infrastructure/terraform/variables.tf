variable "aws_region" {
  description = "AWS region for cloud resources"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Target deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Unique project identifier"
  type        = string
  default     = "community-cloud-platform"
}

variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "Ubuntu AMI ID for EC2 instance"
  type        = string
  default     = "ami-0d75513e22e574a61"
}

variable "db_password" {
  description = "RDS PostgreSQL master password"
  type        = string
  sensitive   = true
  default     = "ChangeMeInProductionPassword123!"
}
