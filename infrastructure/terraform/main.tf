terraform {
  required_version = ">= 1.2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    # Packages the Lambda source into a zip at plan time.
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "ccp_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-ccp-vpc"
    Environment = var.environment
  }
}

# Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.ccp_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "${var.environment}-public-subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.ccp_vpc.id

  tags = {
    Name = "${var.environment}-igw"
  }
}

# Security Group for Backend EC2
resource "aws_security_group" "backend_sg" {
  name        = "${var.environment}-backend-sg"
  description = "Security group allowing HTTP, HTTPS, and SSH traffic"
  vpc_id      = aws_vpc.ccp_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-backend-sg"
  }
}

# S3 Bucket for Static Assets & Frontend Hosting
resource "aws_s3_bucket" "frontend_bucket" {
  bucket        = "${var.project_name}-${var.environment}-assets"
  force_destroy = true

  tags = {
    Name        = "Community Cloud Platform Storage"
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# Notification pipeline
#
# Django publishes one message to SNS when a notice is published or an SOS is
# raised. Lambda picks it up and sends the email. The web request returns
# without waiting for the mail provider, and a spike of notifications costs
# nothing when idle.
# ---------------------------------------------------------------------------

resource "aws_sns_topic" "estate_notifications" {
  name = "${var.project_name}-notifications"

  tags = {
    Project = var.project_name
  }
}

data "archive_file" "notify_residents" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/notify_residents"
  output_path = "${path.module}/build/notify_residents.zip"
}

resource "aws_iam_role" "notify_lambda" {
  name = "${var.project_name}-notify-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# Only what the function actually needs: write logs, send email.
resource "aws_iam_role_policy" "notify_lambda" {
  name = "${var.project_name}-notify-lambda-policy"
  role = aws_iam_role.notify_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      },
    ]
  })
}

resource "aws_lambda_function" "notify_residents" {
  function_name    = "${var.project_name}-notify-residents"
  role             = aws_iam_role.notify_lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.notify_residents.output_path
  source_code_hash = data.archive_file.notify_residents.output_base64sha256
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      SENDER_ADDRESS = var.notification_sender
      ESTATE_NAME    = var.estate_name
    }
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_sns_topic_subscription" "notify_residents" {
  topic_arn = aws_sns_topic.estate_notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.notify_residents.arn
}

resource "aws_lambda_permission" "allow_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notify_residents.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.estate_notifications.arn
}

# ---------------------------------------------------------------------------
# Document storage
#
# Proof of residence uploaded during registration. Private, versioned and
# encrypted; the application issues short lived presigned URLs rather than
# ever making an object public.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "documents" {
  bucket = "${var.project_name}-documents-${var.environment}"

  tags = {
    Project = var.project_name
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket                  = aws_s3_bucket.documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Verification documents are only needed while an application is open.
resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "expire-verification-documents"
    status = "Enabled"

    filter {
      prefix = "verification/"
    }

    expiration {
      days = 365
    }
  }
}
