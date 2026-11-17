<?php
// GET (connecté) : toute la progression de L'ÉTUDIANT CONNECTÉ (jamais celle d'un autre : user_id vient de la session).
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('GET');
$user = require_login();
$uid = (int) $user['id'];
$pdo = db();

// Leçons terminées : { "html-css": [0, 2], ... }
$st = $pdo->prepare('SELECT c.slug, l.lesson_order FROM progress p JOIN lessons l ON l.id = p.lesson_id JOIN courses c ON c.id = p.course_id
                     WHERE p.user_id = ? AND p.completed = 1 ORDER BY c.slug, l.lesson_order');
$st->execute([$uid]);
$done = [];
foreach ($st->fetchAll() as $r) {
    $done[$r['slug']][] = (int) $r['lesson_order'];
}

// Dernière leçon consultée
$st = $pdo->prepare('SELECT c.slug, l.lesson_order FROM progress p JOIN lessons l ON l.id = p.lesson_id JOIN courses c ON c.id = p.course_id
                     WHERE p.user_id = ? ORDER BY p.last_accessed DESC, p.id DESC LIMIT 1');
$st->execute([$uid]);
$last = $st->fetch();
$position = $last ? ['courseId' => $last['slug'], 'lessonId' => (int) $last['lesson_order']] : null;

// Meilleurs scores de quiz : { "html-css_0": {score, total} }
$st = $pdo->prepare('SELECT c.slug, l.lesson_order, q.score, q.total FROM quiz_scores q JOIN lessons l ON l.id = q.lesson_id JOIN courses c ON c.id = l.course_id WHERE q.user_id = ?');
$st->execute([$uid]);
$scores = [];
foreach ($st->fetchAll() as $r) {
    $scores[$r['slug'] . '_' . $r['lesson_order']] = ['score' => (int) $r['score'], 'total' => (int) $r['total']];
}

// Pourcentage de complétion de chaque cours (calculé en SQL)
$st = $pdo->prepare('SELECT c.slug, COUNT(l.id) AS total, COALESCE(SUM(p.completed), 0) AS done
                     FROM courses c LEFT JOIN lessons l ON l.course_id = c.id LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
                     GROUP BY c.id, c.slug');
$st->execute([$uid]);
$stats = [];
foreach ($st->fetchAll() as $r) {
    $total = (int) $r['total'];
    $d = (int) $r['done'];
    $stats[$r['slug']] = ['done' => $d, 'total' => $total, 'percent' => $total ? (int) round($d / $total * 100) : 0];
}

ok(['done' => (object) $done, 'position' => $position, 'scores' => (object) $scores, 'stats' => (object) $stats]);
