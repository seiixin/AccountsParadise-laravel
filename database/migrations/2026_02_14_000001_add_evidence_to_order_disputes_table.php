<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('order_disputes', function (Blueprint $table) {
            if (!Schema::hasColumn('order_disputes', 'evidence')) {
                $table->string('evidence')->nullable()->after('description');
            }
        });
    }

    public function down(): void {
        Schema::table('order_disputes', function (Blueprint $table) {
            if (Schema::hasColumn('order_disputes', 'evidence')) {
                $table->dropColumn('evidence');
            }
        });
    }
};
