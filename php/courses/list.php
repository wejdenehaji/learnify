<?php
// GET : catalogue (public) = tous les cours avec leurs leçons (version allégée).
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('GET');

ok(fetch_courses_list(db()));
