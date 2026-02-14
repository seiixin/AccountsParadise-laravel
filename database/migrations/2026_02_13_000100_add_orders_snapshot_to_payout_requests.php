<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('payout_requests', function (Blueprint $table) {
            $table->json('orders_snapshot')->nullable()->after('approval_notes');
            $table->unsignedInteger('orders_count')->default(0)->after('orders_snapshot');
        });
    }

    public function down(): void {
        Schema::table('payout_requests', function (Blueprint $table) {
            $table->dropColumn(['orders_snapshot', 'orders_count']);
        });
    }
};
