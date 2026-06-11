output "alb_dns_name" {
  description = "Nom DNS de l'ALB (utilisé pour accéder à l'API)"
  value       = aws_lb.main.dns_name
}

output "backend_private_ips" {
  description = "Liste des IP privées des instances backend"
  value       = aws_instance.backend[*].private_ip
}

output "bastion_public_ip" {
  description = "IP publique du bastion"
  value       = aws_instance.bastion.public_ip
}

output "rds_endpoint" {
  description = "Endpoint du cluster RDS (adresse de connexion)"
  value       = aws_db_instance.postgres.endpoint
}