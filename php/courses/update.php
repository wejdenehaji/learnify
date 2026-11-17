<?php
// POST (admin) { id (slug), title, category, level, instructor, description, image } : modifie un cours.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
require_admin();

$in = read_json();
$slug = input_string($in, 'id');
[$v, $errors] = validate_course_input($in);
if ($slug === '') {
    $errors['id'] = 'Identifiant de cours manquant.';
}
if ($errors) {
    fail(reset($errors), 422, $errors);
}

$pdo = db();
$st = $pdo->prepare('SELECT * FROM courses WHERE slug = ?');
$st->execute([$slug]);
$old = $st->fetch();
if (!$old) {
    fail('Cours introuvable.', 404);
}

// Si la catégorie change, le bandeau et la couleur de l'étiquette suivent ; sinon on garde ceux du cours.
$eyebrow = $old['eyebrow'];
$tagClass = $old['tag_class'];
if ($v['category'] !== $old['category']) {
    $eyebrow = function_exists('mb_strtoupper') ? mb_strtoupper($v['category'], 'UTF-8') : strtoupper($v['category']);
    $tagClass = TAG_CLASSES[$v['category']] ?? 'tag-web';
}
$instrName = $v['instructor'] !== '' ? $v['instructor'] : $old['instructor_name'];
$initials = $v['instructor'] !== ''
    ? (function_exists('mb_substr') ? mb_strtoupper(mb_substr($instrName, 0, 2, 'UTF-8'), 'UTF-8') : strtoupper(substr($instrName, 0, 2)))
    : $old['instructor_initials'];

$st = $pdo->prepare('UPDATE courses SET title = ?, description = ?, image = ?, category = ?, eyebrow = ?, tag_class = ?, level = ?,
                            instructor_name = ?, instructor_initials = ? WHERE id = ?');
$st->execute([
    $v['title'], $v['description'], $v['image'] !== '' ? $v['image'] : null, $v['category'], $eyebrow, $tagClass,
    $v['level'], $instrName, $initials, (int) $old['id'],
]);

ok(fetch_course_full($pdo, $slug), 'Cours modifié avec succès.');
