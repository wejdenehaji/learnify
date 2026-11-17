# Tests

## Environnement
PHP et MySQL n'étaient **pas installés** et sans accès réseau dans l'environnement où le code a été écrit.
Aucun endpoint PHP n'a donc été exécuté et aucune requête SQL n'a été jouée sur un vrai serveur MySQL.

## Tests réellement exécutés
| Test | Résultat |
|---|---|
| Syntaxe de tous les modules JS (`node --check`) | OK |
| `api.js` + `storage.js` contre un **faux fetch** (Node) : chargement de la progression, POST avec jeton CSRF et corps JSON, état local après succès, erreur réseau, JSON invalide, 401 (état inchangé + redirection `login.html?next=`) | 11/11 OK — teste le JavaScript seulement, pas PHP |
| Équilibre des parenthèses/accolades/guillemets des 21 fichiers PHP (script maison, **pas** un vrai lint) | OK |
| `database/learnify.sql` : guillemets bien fermés, 30 instructions comptées (1 DROP, 3 SET, 1 CREATE DATABASE, 1 USE, 6 CREATE TABLE, 18 INSERT), 6 cours / 22 leçons / 27 questions | OK (contrôle de forme, pas un import réel) |

