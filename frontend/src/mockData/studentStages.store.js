import { ref } from "vue";

import { studentStages as mockStages } from "./studentStages.mock";

/*
| STORE MOCK TEMPORAIRE — STAGES ÉTUDIANT
POURQUOI CE FICHIER ?
| Pour le moment, le backend n’est pas encore connecté.
| Mais on veut quand même que l’interface fonctionne vraiment :
| - Ajouter un stage
| - Modifier un stage
| - Supprimer un stage
| - Soumettre un stage à validation
| - Voir les détails mis à jour
| Si on met la liste directement dans StagesView.vue, alors :
| - StageFormView.vue ne peut pas modifier facilement cette liste
| - StageDetailsView.vue ne voit pas forcément les changements
| - après navigation, les données peuvent être réinitialisées
| Donc on met la liste ici dans un ref partagé.
| Toutes les pages importent la même variable :
| import { stages } from '@/mockData/studentStages.store'
| Grâce à ref(), Vue met automatiquement l’affichage à jour.
| BACKEND PLUS TARD :
| Quand le backend sera prêt, ce fichier pourra être remplacé par :
| - Pinia
| - ou des appels API directs dans les vues
| - ou une vraie fonction fetchStages()
*/

export const stages = ref([...mockStages]);

/*FONCTION FUTURE BACKEND — fetchStages()
| Cette fonction n’est pas utilisée maintenant.
| Elle montre ce qu’on fera quand le backend sera prêt.
| À créer plus tard :
| import { getStudentStages } from '@/services/studentStageService'
| export const fetchStages = async () => {
|   const response = await getStudentStages()
|   stages.value = response.data
| }
| Quand backend prêt :
| - appeler fetchStages() au chargement de StagesView.vue
| - appeler fetchStages() après ajout/modification/suppression
*/

/* AJOUTER UN STAGE*/
export const addStage = (newStage) => {
  /*
  BACKEND PLUS TARD :
  1. Importer la fonction API :
     import { createStudentStage } from '@/services/studentStageService'
  2. Dans StageFormView.vue, construire un FormData :
     const formData = new FormData()
     formData.append('title', payload.title)
     formData.append('company', payload.company)
     formData.append('duration', payload.duration)
     formData.append('startDate', payload.startDate)
     formData.append('endDate', payload.endDate)
     formData.append('description', payload.description)
     formData.append('missions', JSON.stringify(payload.missions))
     formData.append('supervisorId', payload.supervisorId)
     formData.append('technologies', JSON.stringify(payload.technologies))
     formData.append('visibility', payload.visibility)

     if (payload.report) {
       formData.append('report', payload.report)
     }

     payload.images.forEach((image) => {
       formData.append('images', image)
     })
  3. Appeler le backend :
     await createStudentStage(formData)
  4. Recharger la liste :
     await fetchStages()
  5. Supprimer la logique mock :
     stages.value.unshift(newStage)
  */

  // VERSION MOCK ACTUELLE :
  // On ajoute localement le stage au début de la liste.
  stages.value.unshift(newStage);
};

/*MODIFIER UN STAGE*/
export const updateStage = (updatedStage) => {
  /*
  BACKEND PLUS TARD :
  1. Importer la fonction API :
     import { updateStudentStage } from '@/services/studentStageService'
  2. Construire un FormData avec les nouvelles valeurs :
     const formData = new FormData()
     formData.append('title', payload.title)
     formData.append('company', payload.company)
     formData.append('duration', payload.duration)
     formData.append('startDate', payload.startDate)
     formData.append('endDate', payload.endDate)
     formData.append('description', payload.description)
     formData.append('missions', JSON.stringify(payload.missions))
     formData.append('supervisorId', payload.supervisorId)
     formData.append('technologies', JSON.stringify(payload.technologies))
     formData.append('visibility', payload.visibility)

     if (payload.report) {
       formData.append('report', payload.report)
     }

     payload.images.forEach((image) => {
       formData.append('images', image)
     })

  3. Appeler le backend :
     await updateStudentStage(updatedStage.id, formData)

  4. Recharger la liste :
     await fetchStages()

  5. Supprimer la logique mock :
     stages.value = stages.value.map(...)
  */

  // VERSION MOCK ACTUELLE :
  // On remplace le stage qui a le même id.
  stages.value = stages.value.map((stage) =>
    stage.id === updatedStage.id ? updatedStage : stage,
  );
};

/*SUPPRIMER UN STAGE
 */
export const deleteStage = (stageId) => {
  /*
  BACKEND PLUS TARD :

  1. Importer la fonction API :
     import { deleteStudentStage } from '@/services/studentStageService'

  2. Appeler le backend :
     await deleteStudentStage(stageId)

  3. Recharger la liste :
     await fetchStages()

  4. Supprimer la logique mock :
     stages.value = stages.value.filter(...)
  */

  // VERSION MOCK ACTUELLE :
  // On garde tous les stages sauf celui à supprimer.
  stages.value = stages.value.filter((stage) => stage.id !== stageId);
};

/*SOUMETTRE UN STAGE POUR VALIDATION*/
export const submitStageValidation = (stageId) => {
  /*
  BACKEND PLUS TARD :

  1. Importer la fonction API :
     import { submitStudentStageValidation } from '@/services/studentStageService'

  2. Appeler le backend :
     await submitStudentStageValidation(stageId)

  3. Recharger la liste :
     await fetchStages()

  4. Supprimer la logique mock :
     le changement local validationStatus: 'PENDING'
     et l’ajout local dans validationHistory
  */

  // VERSION MOCK ACTUELLE :
  // On change le statut localement vers PENDING
  // et on ajoute une ligne dans l’historique.
  stages.value = stages.value.map((stage) => {
    if (stage.id !== stageId) return stage;

    return {
      ...stage,
      validationStatus: "PENDING",
      validationHistory: [
        {
          status: "PENDING",
          comment: "Stage soumis pour validation.",
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...(stage.validationHistory || []),
      ],
    };
  });
};
