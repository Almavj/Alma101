<?php
$supabaseUrl = 'https://vmwuglqrafyzrriygzyn.supabase.co';
$serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd3VnbHFyYWZ5enJyaXlnenluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTczMDcyNCwiZXhwIjoyMDc3MzA2NzI0fQ.H9-A0M7QIjOnToy-DNkAjx_m3mS_DmYjdz1N8XtS4k8';

// Get a blog to delete
$ch = curl_init($supabaseUrl . '/rest/v1/blogs?select=id,title&limit=1');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $serviceKey,
    'Authorization: Bearer ' . $serviceKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$blogs = json_decode($response, true);

if (empty($blogs)) {
    echo "No blogs found to test\n";
    exit;
}

$blog = $blogs[0];
echo "Testing DELETE on blog:\n";
echo "ID: {$blog['id']}\n";
echo "Title: {$blog['title']}\n\n";

// DELETE with service key (should bypass RLS)
$ch2 = curl_init($supabaseUrl . "/rest/v1/blogs?id=eq.{$blog['id']}");
curl_setopt($ch2, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'apikey: ' . $serviceKey,
    'Authorization: Bearer ' . $serviceKey,
    'Content-Type: application/json',
    'Prefer: return=minimal'
]);

$deleteResponse = curl_exec($ch2);
$httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
echo "DELETE HTTP Code: $httpCode\n";

// Wait and verify
sleep(1);
$ch3 = curl_init($supabaseUrl . "/rest/v1/blogs?id=eq.{$blog['id']}");
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_HTTPHEADER, [
    'apikey: ' . $serviceKey,
    'Authorization: Bearer ' . $serviceKey
]);

$verifyResponse = curl_exec($ch3);
$remaining = json_decode($verifyResponse, true);

echo "Blogs remaining with this ID: " . count($remaining) . "\n";

if (count($remaining) === 0) {
    echo "✅ DELETE successful with service key!\n";
    echo "RLS is blocking frontend deletes but service key works.\n";
} else {
    echo "� DELETE still failed even with service key!\n";
    echo "There might be database constraints or triggers.\n";
}
