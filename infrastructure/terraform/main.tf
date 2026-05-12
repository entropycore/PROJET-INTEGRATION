terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
  }
  backend "s3" {
    bucket = "bucket-terraform-state"
    key    = "Credencia/terraform.tfstate"
    region = var.aws_region
  }

}

provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "credencia-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "eu-west-3a"
  tags = { Name = "credencia-subnet" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "credencia-igw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "credencia-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "common_sg" {
  name        = "credencia-common-sg"
  description = "Pare-feu de l'application"
  vpc_id      = aws_vpc.main.id


 # SSH (port 22)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip] 
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Application Web"
  }

  # Règle sortante : tout le trafic est autorisé
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "credencia-common-sg"
  }
}

resource "aws_instance" "production" {
  ami           = "ami-0680d20ec23693be9" 
  instance_type = "t3.micro" 
  subnet_id              = aws_subnet.public.id
  key_name      = var.key_name
  vpc_security_group_ids = [aws_security_group.common_sg.id]
   
   root_block_device {
    volume_type           = "gp3"
    volume_size           = 8     
    delete_on_termination = true    
  }
  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y python3
  EOF

  tags = {
    Name = "VM_production"
    ManagedBy   = "terraform"
  }
}