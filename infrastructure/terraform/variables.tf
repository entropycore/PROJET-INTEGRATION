variable "aws_region" {
  description = "Région AWS cible"
  type        = string
  default     = "eu-west-3"
}
variable "my_ip" {
  description = "192.168.1.0/24"
  type        = string
  sensitive   = true
 
}
variable "key_name" {
  description = "Credencia-key"
  type        = string
}