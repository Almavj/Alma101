<?php
// Minimal index for API root so web server returns a 200 JSON response
//header('Content-Type: application/json');
//http_response_code(200);
//echo json_encode([
 //   'status' => 'success',
 //   'message' => 'Alma101 API is running'
//]);


<?php
// ...existing code...
// Temporary debug / health check — remove after debugging
ini_set('display_errors','1');
ini_set('display_startup_errors','1');
error_reporting(E_ALL);

header('Content-Type: application/json');
echo json_encode([
  'status' => 'ok',
  'time'   => time(),
  'port'   => getenv('PORT')
]);
// ...existing code...