# Ormeet — Glossaire de traduction

Document de référence pour la cohérence des traductions FR et AR.
À injecter dans chaque prompt de traduction.

## 🎯 Contexte produit

**Ormeet** : plateforme de gestion et de découverte d'événements.

Deux audiences :
- **Attendees** : utilisateurs qui cherchent et réservent des billets pour
  des événements. 20-40 ans, urbains, mobile-first, multilingues.
- **Organizers** : organisateurs d'événements pros et semi-pros.

**Marché actuel** : Algérie, expansion Maghreb à terme.

**Deux apps techniques** :
- Landing publique (Next.js) : SEO-critical, orientée attendees principalement
- Plateforme authentifiée (React + Vite) : contient attendee dashboard et
  organizer dashboard

## 🎨 Ton de voix

| Audience | Registre FR | Registre AR |
|----------|-------------|-------------|
| Attendees | Vouvoiement chaleureux, court, dynamique, lifestyle | Arabe standard moderne (MSA), chaleureux, accessible |
| Organizers | Vouvoiement pro, plus informatif | Arabe standard moderne, professionnel mais pas froid |
| Erreurs | Claires, jamais culpabilisantes | Idem |

Références de ton (à imiter) :
- FR : Shotgun, Dice, Doctolib, Alan, Qonto
- AR : Yassir, Temtem One, Jumia DZ (style algérien moderne)

À éviter :
- FR : ton "agence marketing 2015", anglicismes creux, mots-béquilles
- AR : arabe trop classique, formules trop solennelles

## 📖 Termes produit — Référence FR

| Anglais | Français | Notes |
|---------|----------|-------|
| event | événement | jamais "évènement" |
| attendee | participant | pas "invité" |
| organizer | organisateur | |
| ticket | billet | pas "ticket" |
| booking | réservation | |
| host (verbe) | organiser | pas "héberger" |
| venue | lieu | |
| workshop | workshop | anglicisme accepté |
| meetup | meetup | anglicisme accepté |
| dashboard | tableau de bord | à trancher selon contexte |
| sign up | s'inscrire | |
| log in | se connecter | |
| log out | se déconnecter | |
| get started | commencer | |
| learn more | en savoir plus | |
| support | aide / support | selon contexte |
| free | gratuit | |
| paid | payant | |
| sold out | complet | pas "épuisé" |
| upcoming | à venir | |
| trending | populaire / tendance | |

## 📖 Termes produit — Référence AR (à compléter)

Voir phase AR ultérieure.

## 🌍 Conventions techniques

### Dates
- FR : "20 avril" / "20 avr." — passer par formatDate du package
- AR (DZ) : "20 أبريل" — locale ar-DZ
- ⚠️ Toujours via @ormeet/i18n utils, jamais en dur

### Heures : 24h pour FR et AR-DZ

### Chiffres
- FR : chiffres occidentaux (1, 2, 3)
- AR (DZ) : chiffres occidentaux aussi

### Devise : DZD pour l'Algérie

### Typographie FR
- Espaces insécables avant : ; ! ? « »
- Guillemets français « »
- Apostrophes courbes '
- Majuscules accentuées : À É È Ê
- Titres : capitalisation 1ʳᵉ lettre seulement

### Typographie AR
- Virgule arabe : ،
- Point d'interrogation arabe : ؟
- Police : Cairo

## 🚫 Pièges fréquents

### FR
- "Your" souvent supprimable
- Pas de Title Case
- "Click here" → toujours reformuler

### AR
- Ne pas traduire "Ormeet" (reste Ormeet)
- Chiffres en LTR au milieu de texte RTL (natif navigateur)

## ✅ Décisions controversées

À documenter au fur et à mesure.
