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
