<?php
// POST (admin) { title, category, level, instructor, description, image, lessons: [{title, video}] } : crée un cours.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
require_admin();

$in = read_json();
[$v, $errors] = validate_course_input($in);

$lessons = [];
$lessonsIn = $in['lessons'] ?? null;
if (!is_array($lessonsIn) || count($lessonsIn) === 0) {
    $errors['lessons'] = 'Ajoutez au moins une leçon.';
} elseif (count($lessonsIn) > 50) {
    $errors['lessons'] = '50 leçons maximum à la création.';
} else {
    foreach (array_values($lessonsIn) as $i => $l) {
        [$lv, $le] = validate_lesson_input(is_array($l) ? $l : []);
        if ($le) {
            $errors['lessons'] = 'Ligne ' . ($i + 1) . ' invalide : ' . reset($le);
            break;
        }
        $lessons[] = $lv;
    }
}
if ($errors) {
    fail(reset($errors), 422, $errors);
}

$pdo = db();
$slug = unique_slug($pdo, slugify($v['title']));
$instructor = $v['instructor'] !== '' ? $v['instructor'] : 'Formateur';
$initials = function_exists('mb_substr') ? mb_strtoupper(mb_substr($instructor, 0, 2, 'UTF-8'), 'UTF-8') : strtoupper(substr($instructor, 0, 2));
$n = count($lessons);

$pdo->beginTransaction();
try {
    $st = $pdo->prepare('INSERT INTO courses (slug, title, description, image, category, eyebrow, tag_class, art_class, badge, level, duration, about,
                                              instructor_name, instructor_role, instructor_initials, instructor_bio, objectives)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $st->execute([
        $slug, $v['title'], $v['description'], $v['image'] !== '' ? $v['image'] : null, $v['category'],
        function_exists('mb_strtoupper') ? mb_strtoupper($v['category'], 'UTF-8') : strtoupper($v['category']),
        TAG_CLASSES[$v['category']] ?? 'tag-web', 'art-web', 'NEW', $v['level'],
        'Environ ' . ($n * 8) . ' minutes', $v['description'],
        $instructor, 'Formateur', $initials, '',
        json_encode(['Suivre les ' . $n . ' leçons de ' . $v['title']], JSON_UNESCAPED_UNICODE),
    ]);
    $courseId = (int) $pdo->lastInsertId();
    foreach ($lessons as $order => $lv) {
        insert_lesson($pdo, $courseId, $lv, $order);
    }
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}

ok(fetch_course_full($pdo, $slug), 'Cours ajouté avec succès.', 201);
