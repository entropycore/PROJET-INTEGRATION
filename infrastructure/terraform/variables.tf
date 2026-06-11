variable "aws_region" {
  description = "Région AWS cible"
  type        = string
  default     = "eu-west-3"
}
variable "my_ip" {
  description = "192.168.3.59/24"
  type        = string
  sensitive   = true
 
}
variable "key_name" {
  description = "Credencia-key"
  type        = string
}

variable "db_username" {
  description = "UserRDS"
  type        = string
  default     = "admin"
}
