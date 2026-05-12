
output "production_public_ip" {
  description = "Adresse IP publique de la machine de production"
  value       = aws_instance.production.public_ip
}
output "instance_id" {
  description = "ID de l'instance EC2"
  value       = aws_instance.production.id
}