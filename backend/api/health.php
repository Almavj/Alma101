<?php
// Minimal health endpoint — valid PHP only
header('Content-Type: application/json');
echo json_encode([
  'status' => 'ok',
  'time'   => time()
]);