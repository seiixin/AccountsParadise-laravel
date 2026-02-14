<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'cover_image_path')) {
                $table->string('cover_image_path')->nullable()->after('description');
            }
        });
    }

    public function down(): void {
        Schema::table('listings', function (Blueprint $table) {
            if (Schema::hasColumn('listings', 'cover_image_path')) {
                $table->dropColumn('cover_image_path');
            }
        });
    }
};
