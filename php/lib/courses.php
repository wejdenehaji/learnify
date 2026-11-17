<?php
/**
 * Learnify - Fonctions partagées par les endpoints cours / leçons / progression.
 * Le format JSON renvoyé est identique à l'ancien fichier courses.json : le frontend change très peu.
 */

const CATEGORIES = ['Web', 'Programmation', 'Technologie', 'Design'];
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];
const TAG_CLASSES = ['Web' => 'tag-web', 'Programmation' => 'tag-js', 'Technologie' => 'tag-ai', 'Design' => 'tag-python'];
const DEFAULT_VIDEO = 'https://www.youtube-nocookie.com/embed/UB1O30fR-EE';

/* ---------- Utilitaires ---------- */

function json_list(?string $json): array
{
    $d = $json ? json_decode($json, true) : null;
    return is_array($d) ? $d : [];
}

function slugify(string $text): string
{
    $map = ['à' => 'a', 'á' => 'a', 'â' => 'a', 'ä' => 'a', 'ç' => 'c', 'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'î' => 'i', 'ï' => 'i', 'ô' => 'o', 'ö' => 'o', 'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ÿ' => 'y', 'œ' => 'oe', 'ñ' => 'n'];
    $t = function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
    $t = strtr($t, $map);
    $t = trim((string) preg_replace('/[^a-z0-9]+/', '-', $t), '-');
    return $t !== '' ? substr($t, 0, 80) : 'cours';
}

function unique_slug(PDO $pdo, string $base): string
{
    $st = $pdo->prepare('SELECT 1 FROM courses WHERE slug = ?');
    $slug = $base;
    $n = 2;
    while (true) {
        $st->execute([$slug]);
        if (!$st->fetchColumn()) {
            return $slug;
        }
        $slug = $base . '-' . $n;
        $n++;
    }
}

/** Lien YouTube (watch, youtu.be, embed) -> lien embed ; vide -> vidéo par défaut ; invalide -> null. */
function to_embed_url(string $link): ?string
{
    if ($link === '') {
        return DEFAULT_VIDEO;
    }
    $re = '~^https?://(?:www\.)?(?:youtube\.com/(?:watch\?(?:[^#]*&)?v=|embed/)|youtube-nocookie\.com/embed/|youtu\.be/)([A-Za-z0-9_-]{11})~';
    if (preg_match($re, $link, $m)) {
        return 'https://www.youtube-nocookie.com/embed/' . $m[1];
    }
    return null;
}

/* ---------- Validation ---------- */

/** @return array [valeurs nettoyées, erreurs par champ] */
function validate_course_input(array $in): array
{
    $e = [];
    $title = input_string($in, 'title');
    if (text_len($title) < 3 || text_len($title) > 150) {
        $e['title'] = 'Le titre doit contenir entre 3 et 150 caractères.';
    }
    $description = input_string($in, 'description');
    if ($description === '' || text_len($description) > 2000) {
        $e['description'] = 'La description est obligatoire (2000 caractères maximum).';
    }
    $category = input_string($in, 'category') ?: 'Web';
    if (!in_array($category, CATEGORIES, true)) {
        $e['category'] = 'Catégorie invalide.';
    }
    $level = input_string($in, 'level') ?: 'Débutant';
    if (!in_array($level, LEVELS, true)) {
        $e['level'] = 'Niveau invalide.';
    }
    $instructor = input_string($in, 'instructor');
    if (text_len($instructor) > 100) {
        $e['instructor'] = 'Nom du formateur trop long (100 caractères maximum).';
    }
    $image = input_string($in, 'image');
    if ($image !== '' && (strlen($image) > 500 || !preg_match('~^https?://~i', $image) || !filter_var($image, FILTER_VALIDATE_URL))) {
        $e['image'] = "L'image doit être une URL http(s) valide.";
    }
    return [compact('title', 'description', 'category', 'level', 'instructor', 'image'), $e];
}

/** @return array [valeurs nettoyées, erreurs par champ] */
function validate_lesson_input(array $in): array
{
    $e = [];
    $title = input_string($in, 'title');
    if (text_len($title) < 2 || text_len($title) > 150) {
        $e['title'] = 'Le titre de la leçon doit contenir entre 2 et 150 caractères.';
    }
    $duration = input_string($in, 'duration') ?: '8 min';
    if (text_len($duration) > 30) {
        $e['duration'] = 'Durée trop longue.';
    }
    $video = to_embed_url(input_string($in, 'video'));
    if ($video === null) {
        $e['video'] = "Lien YouTube invalide.";
    }
    $content = input_string($in, 'content');
    if ($content === '') {
        $content = 'Contenu de la leçon « ' . $title . ' ».';
    }
    if (text_len($content) > 20000) {
        $e['content'] = 'Contenu trop long (20000 caractères maximum).';
    }
    $tip = input_string($in, 'tip') ?: 'Pratiquez après chaque leçon pour mieux retenir.';
    if (text_len($tip) > 500) {
        $e['tip'] = 'Astuce trop longue (500 caractères maximum).';
    }
    $code = isset($in['codeSnippet']) && is_string($in['codeSnippet']) ? rtrim($in['codeSnippet']) : '';
    if (text_len($code) > 5000) {
        $e['codeSnippet'] = 'Exemple de code trop long (5000 caractères maximum).';
    }
    return [compact('title', 'duration', 'video', 'content', 'tip', 'code'), $e];
}

/* ---------- Écriture ---------- */

function insert_lesson(PDO $pdo, int $courseId, array $v, int $order): int
{
    $st = $pdo->prepare('INSERT INTO lessons (course_id, title, subtitle, duration, video_url, article_heading, content, tip, code_snippet, markers, lesson_order)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $st->execute([$courseId, $v['title'], 'Leçon ' . ($order + 1) . ' · ' . $v['duration'], $v['duration'], $v['video'],
                  $v['title'], $v['content'], $v['tip'], $v['code'], '[]', $order]);
    return (int) $pdo->lastInsertId();
}

/* ---------- Lecture (mise en forme JSON) ---------- */

function course_to_array(array $r): array
{
    return [
        'id'          => $r['slug'],            // identifiant utilisé dans les URLs (?course=html-css)
        'dbId'        => (int) $r['id'],
        'title'       => $r['title'],
        'eyebrow'     => $r['eyebrow'],
        'category'    => $r['category'],
        'tagClass'    => $r['tag_class'],
        'artClass'    => $r['art_class'],
        'badge'       => $r['badge'],
        'level'       => $r['level'],
        'duration'    => $r['duration'],
        'description' => $r['description'],
        'about'       => $r['about'],
        'image'       => $r['image'] ?? '',
        'instructor'  => [
            'name'     => $r['instructor_name'],
            'role'     => $r['instructor_role'],
            'initials' => $r['instructor_initials'],
            'bio'      => $r['instructor_bio'],
        ],
        'objectives'  => json_list($r['objectives']),
        'lessons'     => [],
    ];
}

/** Liste du catalogue : cours + version allégée des leçons (sans texte ni quiz). */
function fetch_courses_list(PDO $pdo): array
{
    $courses = [];
    foreach ($pdo->query('SELECT * FROM courses ORDER BY id') as $r) {
        $courses[(int) $r['id']] = course_to_array($r);
    }
    $rows = $pdo->query('SELECT id, course_id, title, subtitle, duration, lesson_order FROM lessons ORDER BY course_id, lesson_order');
    foreach ($rows as $l) {
        $cid = (int) $l['course_id'];
        if (isset($courses[$cid])) {
            $courses[$cid]['lessons'][] = [
                'id' => (int) $l['lesson_order'], 'dbId' => (int) $l['id'], 'title' => $l['title'],
                'subtitle' => $l['subtitle'], 'duration' => $l['duration'],
            ];
        }
    }
    return array_values($courses);
}

/** Un cours complet : leçons, chapitres vidéo et questions de quiz. null si inconnu. */
function fetch_course_full(PDO $pdo, string $slug): ?array
{
    $st = $pdo->prepare('SELECT * FROM courses WHERE slug = ?');
    $st->execute([$slug]);
    $row = $st->fetch();
    if (!$row) {
        return null;
    }
    $course = course_to_array($row);
    $courseId = (int) $row['id'];

    $st = $pdo->prepare('SELECT q.* FROM quiz_questions q JOIN lessons l ON l.id = q.lesson_id WHERE l.course_id = ? ORDER BY q.lesson_id, q.position');
    $st->execute([$courseId]);
    $quiz = [];
    foreach ($st->fetchAll() as $q) {
        $quiz[(int) $q['lesson_id']][] = [
            'id'           => 'q' . $q['id'],
            'question'     => $q['question'],
            'options'      => json_list($q['options']),
            'correctIndex' => (int) $q['correct_index'],
            'explanation'  => $q['explanation'],
        ];
    }

    $st = $pdo->prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order');
    $st->execute([$courseId]);
    foreach ($st->fetchAll() as $l) {
        $course['lessons'][] = [
            'id'             => (int) $l['lesson_order'],
            'dbId'           => (int) $l['id'],
            'title'          => $l['title'],
            'subtitle'       => $l['subtitle'],
            'duration'       => $l['duration'],
            'videoUrl'       => $l['video_url'],
            'markers'        => json_list($l['markers']),
            'articleHeading' => $l['article_heading'],
            'description'    => $l['content'],
            'tip'            => $l['tip'],
            'codeSnippet'    => $l['code_snippet'],
            'quiz'           => $quiz[(int) $l['id']] ?? [],
        ];
    }
    return $course;
}

/** Retrouve l'id d'une leçon à partir du slug du cours et de son numéro (0, 1, 2…). */
function find_lesson(PDO $pdo, string $slug, int $index): ?array
{
    $st = $pdo->prepare('SELECT l.id AS lesson_id, l.course_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.slug = ? AND l.lesson_order = ?');
    $st->execute([$slug, $index]);
    $r = $st->fetch();
    return $r ? ['lesson_id' => (int) $r['lesson_id'], 'course_id' => (int) $r['course_id']] : null;
}

/** Statistiques de progression d'un étudiant pour un cours (calculées par SQL). */
function course_stats(PDO $pdo, int $userId, int $courseId): array
{
    $st = $pdo->prepare('SELECT COUNT(l.id) AS total, COALESCE(SUM(p.completed), 0) AS done
                         FROM lessons l LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
                         WHERE l.course_id = ?');
    $st->execute([$userId, $courseId]);
    $r = $st->fetch();
    $total = (int) $r['total'];
    $done = (int) $r['done'];
    return ['done' => $done, 'total' => $total, 'percent' => $total ? (int) round($done / $total * 100) : 0];
}
