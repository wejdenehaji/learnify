<?php
// POST (admin) { lessonId, title, duration, video, content, tip, codeSnippet } : modifie une leçon.
// Les chapitres vidéo et le quiz de la leçon ne sont pas touchés.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
require_admin();

$in = read_json();
$lessonId = input_int($in, 'lessonId');
[$v, $errors] = validate_lesson_input($in);
if ($lessonId === null) {
    $errors['lessonId'] = 'Leçon manquante.';
}
if ($errors) {
    fail(reset($errors), 422, $errors);
}

$pdo = db();
$st = $pdo->prepare('SELECT l.course_id, l.lesson_order, c.slug FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?');
$st->execute([$lessonId]);
$old = $st->fetch();
if (!$old) {
    fail('Leçon introuvable.', 404);
}

$st = $pdo->prepare('UPDATE lessons SET title = ?, subtitle = ?, duration = ?, video_url = ?, article_heading = ?, content = ?, tip = ?, code_snippet = ? WHERE id = ?');
$st->execute([$v['title'], 'Leçon ' . ((int) $old['lesson_order'] + 1) . ' · ' . $v['duration'], $v['duration'], $v['video'],
              $v['title'], $v['content'], $v['tip'], $v['code'], $lessonId]);

ok(fetch_course_full($pdo, $old['slug']), 'Leçon modifiée.');
