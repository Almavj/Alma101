<?php
// production-safe API root / health check
header('Content-Type: application/json; charset=utf-8');
http_response_code(200);
echo json_encode([
  'status' => 'ok',
  'service' => 'Alma101 API',
  'time' => time(),
  'port' => getenv('PORT') ?: null
], JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);