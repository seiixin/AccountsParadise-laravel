<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('order_payment_proofs', function (Blueprint $table) {
            $table->string('face_image_path')->nullable()->after('receipt_image_path');
            $table->string('facescan_status')->nullable()->after('idscan_result');
            $table->string('facescan_provider')->nullable()->after('facescan_status');
            $table->string('facescan_request_id')->nullable()->after('facescan_provider');
            $table->json('facescan_result')->nullable()->after('facescan_request_id');
        });
    }

    public function down(): void
    {
        Schema::table('order_payment_proofs', function (Blueprint $table) {
            $table->dropColumn(['face_image_path', 'facescan_status', 'facescan_provider', 'facescan_request_id', 'facescan_result']);
        });
    }
};
