<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('order_payment_proofs', function (Blueprint $table) {
            $table->string('idscan_status')->nullable()->after('status');
            $table->string('idscan_provider')->nullable()->after('idscan_status');
            $table->string('idscan_request_id')->nullable()->after('idscan_provider');
            $table->json('idscan_result')->nullable()->after('idscan_request_id');
        });
    }

    public function down(): void
    {
        Schema::table('order_payment_proofs', function (Blueprint $table) {
            $table->dropColumn(['idscan_status', 'idscan_provider', 'idscan_request_id', 'idscan_result']);
        });
    }
};
