<?php
<?php
// Minimal health endpoint — must start with <?php and contain only PHP
header('Content-Type: application/json');
echo json_encode([
  'status' => 'ok',
  'time'   => time()
]);