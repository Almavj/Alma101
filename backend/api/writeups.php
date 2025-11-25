<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/Writeup.php';
require_once '../middleware/auth.php';

$database = new Database();
$writeup = new Writeup($database);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $result = $writeup->getById($_GET['id']);
            if($result) {
                http_response_code(200);
                echo json_encode($result);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Writeup not found']);
            }
        } else {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $result = $writeup->getAll($limit, $page);
            http_response_code(200);
            echo json_encode($result);
        }
        break;

    case 'POST':
        $adminId = authenticateAdmin();
        $data = json_decode(file_get_contents("php://input"), true);
        $data['author_id'] = $adminId;

        $result = $writeup->create($data);
        if($result) {
            http_response_code(201);
            echo json_encode(['message' => 'Writeup created successfully', 'data' => $result]);
        } else {
            $err = $writeup->getLastResponse();
            http_response_code(503);
            echo json_encode(['message' => 'Unable to create writeup', 'error' => $err]);
        }
        break;

    case 'PUT':
        $adminId = authenticateAdmin();
        $data = json_decode(file_get_contents("php://input"), true);

        if(isset($_GET['id'])) {
            if($writeup->update($_GET['id'], $data)) {
                http_response_code(200);
                echo json_encode(['message' => 'Writeup updated successfully']);
            } else {
                http_response_code(503);
                echo json_encode(['message' => 'Unable to update writeup']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Writeup ID not provided']);
        }
        break;

    case 'DELETE':
        $adminId = authenticateAdmin();

        if(isset($_GET['id'])) {
            if($writeup->delete($_GET['id'])) {
                http_response_code(200);
                echo json_encode(['message' => 'Writeup deleted successfully']);
            } else {
                http_response_code(503);
                echo json_encode(['message' => 'Unable to delete writeup']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Writeup ID not provided']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
