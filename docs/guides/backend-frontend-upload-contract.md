# Contrat backend/frontend pour les uploads

Ce fichier resume ce qui est pret cote backend pour que l equipe frontend branche les formulaires sans deviner les noms des champs.

## Configuration backend

Par defaut, le backend stocke les fichiers en local:

```env
STORAGE_DRIVER=local
LOCAL_UPLOAD_DIR=uploads
UPLOAD_MAX_MB=10
```

En Docker, `LOCAL_UPLOAD_DIR` est force a `/app/uploads` et un volume conserve les fichiers.

Pour utiliser MinIO ou un service compatible S3, mettre:

```env
STORAGE_DRIVER=s3
S3_BUCKET=student-uploads
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_BASE_URL=http://localhost:9000/student-uploads
STORAGE_AUTO_CREATE_BUCKET=true
SIGNED_URL_TTL_SECONDS=300
```

## Uploads deja utilises par le frontend

| Fonction | Methode et route | Champ FormData |
| --- | --- | --- |
| Medias projet | `POST /api/projects/:projectId/media` | `screenshots`, `attachments` |
| Rapport de stage | `POST /api/student/stages/:stageId/report` | `report` |
| Images de stage | `POST /api/student/stages/:stageId/images` | `images` |
| Certificat activite | `POST /api/student/activities/:activityId/certificate` | `certificate` |

Ces routes sont les routes principales pour le frontend et elles ne passent pas par `/api/files`.

## Uploads prets mais pas encore branches cote frontend

| Fonction | Methode et route | Champ FormData |
| --- | --- | --- |
| Photo de profil etudiant | `POST /api/student/profile-picture` | `profilePicture` |
| Import CSV admin | `POST /api/admin/users/import-csv` | `file` |

## API generique de fichiers

Le backend expose aussi `/api/files` pour un besoin futur plus general:

| Fonction | Methode et route | Champ FormData |
| --- | --- | --- |
| Upload simple | `POST /api/files` | `file` |
| Upload multiple | `POST /api/files/batch` | `files` |
| Metadata privee | `GET /api/files/:fileId` | - |
| Download prive | `GET /api/files/:fileId/download` | - |
| Metadata publique | `GET /api/files/public/:fileId` | - |
| Download public | `GET /api/files/public/:fileId/download` | - |
| Suppression | `DELETE /api/files/:fileId` | - |

Parametres optionnels dans le `FormData`:

```txt
access=PRIVATE ou PUBLIC
entityType=PROJECT, INTERNSHIP, ACTIVITY, EXTRACURRICULAR_ACTIVITY, CERTIFICATE, PORTFOLIO, RECOMMENDATION_LETTER, RECOMMENDATION ou COMMENT
entityId=<id de l entite>
purpose=<nom court du besoin>
metadata=<JSON objet>
```

## Notifications

Les notifications sont disponibles avec le meme contrat pour admin, student, professor et professional:

```txt
GET    /api/<role>/notifications
GET    /api/<role>/notifications/unread-count
PATCH  /api/<role>/notifications/read-all
PATCH  /api/<role>/notifications/:notificationId/read
DELETE /api/<role>/notifications/:notificationId
```

Pour `student`, il existe aussi:

```txt
GET /api/notifications/me/unread
```

## Points a communiquer au frontend

- Garder `VITE_API_BASE_URL=http://localhost:3000` si le backend Docker expose le port 3000.
- Les requetes upload doivent etre envoyees en `multipart/form-data` avec `FormData`.
- Ne pas definir manuellement le header `Content-Type`; Axios/le navigateur le mettra avec le boundary.
- Les cookies d auth sont utilises, donc garder `withCredentials: true`.

## Etat frontend actuel

- Les notifications admin, student, professor et professional appellent maintenant les vraies routes backend.
- La photo de profil etudiant est branchee sur `POST /api/student/profile-picture`.
- L import CSV admin est branche sur `POST /api/admin/users/import-csv`.
- Les URLs relatives renvoyees par le backend, comme `/api/profile-pictures/...`, sont converties en URLs backend completes avant affichage.
